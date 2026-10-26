import mongoose from 'mongoose'
import { connectDB } from '@/lib/databaseConnection'
import { MAX_WISHLIST_ITEMS, normalizeAddedAt, normalizeWishlistItems } from '@/lib/wishlist'
import { LIVE_REVIEW_EXPR } from '@/lib/reviewModeration'
import UserModel from '@/models/User.model'
import ProductModel from '@/models/Product.model'
import '@/models/Media.model'

const toPlainObject = (data) => JSON.parse(JSON.stringify(data))

const isValidId = (value) => mongoose.Types.ObjectId.isValid(value) && String(new mongoose.Types.ObjectId(value)) === String(value).toLowerCase()

const toClientItems = (items = []) => items
    .map((item) => ({
        productId: String(item.product),
        addedAt: new Date(item.addedAt || Date.now()).getTime(),
    }))
    .sort((a, b) => b.addedAt - a.addedAt)

// Ids (as strings) of the given products that still exist and aren't soft-deleted.
const getActiveProductIds = async (productIds) => {
    if (!productIds.length) return new Set()
    const active = await ProductModel.find({ _id: { $in: productIds }, deletedAt: null })
        .select('_id')
        .lean()
    return new Set(active.map((product) => String(product._id)))
}

const loadWishlist = (userId) => UserModel.findOne({ _id: userId, deletedAt: null })
    .select('+wishlist +wishlistVersion')
    .lean()

// Removes entries whose product is gone (hard or soft deleted) so they stop
// counting against the cap and never resurface on another device.
const pruneStaleEntries = async (userId, entries) => {
    const activeIds = await getActiveProductIds(entries.map((entry) => entry.product))
    const staleIds = entries
        .filter((entry) => !activeIds.has(String(entry.product)))
        .map((entry) => entry.product)

    if (staleIds.length) {
        await UserModel.updateOne(
            { _id: userId },
            { $pull: { wishlist: { product: { $in: staleIds } } }, $inc: { wishlistVersion: 1 } }
        )
    }

    return entries.filter((entry) => activeIds.has(String(entry.product)))
}

export const getWishlist = async (userId) => {
    await connectDB()
    const user = await loadWishlist(userId)
    if (!user) return null

    const entries = await pruneStaleEntries(userId, user.wishlist || [])
    return toClientItems(entries)
}

/**
 * Atomically appends one product. The filter itself enforces "not already
 * saved" and "fewer than MAX items", so concurrent requests can never push the
 * list past the cap or create duplicates.
 * Returns { ok, code?, added? }.
 */
export const addWishlistItem = async (userId, productId) => {
    await connectDB()

    if (!isValidId(productId)) return { ok: false, code: 'INVALID_PRODUCT' }

    const productExists = await ProductModel.exists({ _id: productId, deletedAt: null })
    if (!productExists) return { ok: false, code: 'PRODUCT_NOT_FOUND' }

    const tryPush = () => UserModel.updateOne(
        {
            _id: userId,
            deletedAt: null,
            'wishlist.product': { $ne: productId },
            [`wishlist.${MAX_WISHLIST_ITEMS - 1}`]: { $exists: false },
        },
        {
            $push: { wishlist: { product: productId, addedAt: new Date() } },
            $inc: { wishlistVersion: 1 },
        }
    )

    let result = await tryPush()
    if (result.modifiedCount) return { ok: true, added: true }

    // Work out why the push didn't apply.
    const user = await loadWishlist(userId)
    if (!user) return { ok: false, code: 'USER_NOT_FOUND' }

    const entries = user.wishlist || []
    if (entries.some((entry) => String(entry.product) === String(productId))) {
        // Already saved — adding is idempotent.
        return { ok: true, added: false }
    }

    // Full: entries for deleted products may be eating slots. Drop them and retry once.
    const activeEntries = await pruneStaleEntries(userId, entries)
    if (activeEntries.length < entries.length) {
        result = await tryPush()
        if (result.modifiedCount) return { ok: true, added: true }
    }

    return { ok: false, code: 'WISHLIST_FULL' }
}

export const removeWishlistItems = async (userId, productIds) => {
    await connectDB()

    const ids = [...new Set(productIds.map(String))].filter(isValidId)
    if (!ids.length) return { ok: false, code: 'INVALID_PRODUCT' }

    await UserModel.updateOne(
        { _id: userId, deletedAt: null },
        { $pull: { wishlist: { product: { $in: ids } } }, $inc: { wishlistVersion: 1 } }
    )

    return { ok: true }
}

/**
 * Union a guest (localStorage) wishlist into the account's list on sign-in.
 * - Items already on the account win (their original save time is kept).
 * - Products that no longer exist are dropped silently.
 * - If the union exceeds the cap, account items are kept first, then the most
 *   recently saved guest items; the rest are reported back as `dropped`.
 * Uses wishlistVersion as a compare-and-swap token and retries on conflict.
 */
export const mergeWishlist = async (userId, incomingItems) => {
    await connectDB()

    const now = Date.now()
    const incoming = normalizeWishlistItems(incomingItems, now).filter((item) => isValidId(item.productId))

    for (let attempt = 0; attempt < 3; attempt++) {
        const user = await loadWishlist(userId)
        if (!user) return { ok: false, code: 'USER_NOT_FOUND' }

        const existing = user.wishlist || []
        const activeIds = await getActiveProductIds([
            ...existing.map((entry) => entry.product),
            ...incoming.map((item) => item.productId),
        ])

        const kept = existing.filter((entry) => activeIds.has(String(entry.product)))
        const keptIds = new Set(kept.map((entry) => String(entry.product)))
        const additions = incoming.filter((item) => activeIds.has(item.productId) && !keptIds.has(item.productId))

        const room = Math.max(0, MAX_WISHLIST_ITEMS - kept.length)
        const accepted = additions.slice(0, room) // already newest-first
        const dropped = additions.length - accepted.length

        const merged = [
            ...kept.map((entry) => ({ product: entry.product, addedAt: entry.addedAt || new Date(now) })),
            ...accepted.map((item) => ({
                product: new mongoose.Types.ObjectId(item.productId),
                addedAt: new Date(normalizeAddedAt(item.addedAt, now)),
            })),
        ].sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))

        const versionFilter = typeof user.wishlistVersion === 'number'
            ? { wishlistVersion: user.wishlistVersion }
            : { wishlistVersion: { $exists: false } }

        const result = await UserModel.updateOne(
            { _id: userId, ...versionFilter },
            { $set: { wishlist: merged, wishlistVersion: (user.wishlistVersion || 0) + 1 } }
        )

        if (result.matchedCount) {
            return { ok: true, items: toClientItems(merged), dropped }
        }
        // Someone else wrote in between — re-read and try again.
    }

    return { ok: false, code: 'CONFLICT' }
}

/**
 * Resolve product ids into the same card shape the shop grid uses (so the
 * wishlist page can render <ProductBox/>). Public — guests need it too — and it
 * only ever exposes storefront data. Ids that don't resolve to a live product
 * are returned in `missing` so the caller can prune them.
 */
export const getWishlistProducts = async (productIds) => {
    await connectDB()

    const ids = [...new Set(productIds.map((id) => String(id).toLowerCase()))]
        .filter(isValidId)
        .slice(0, MAX_WISHLIST_ITEMS)

    if (!ids.length) return { products: [], missing: [] }

    const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id))

    const products = await ProductModel.aggregate([
        { $match: { _id: { $in: objectIds }, deletedAt: null } },
        {
            $lookup: {
                from: 'productvariants',
                let: { productId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$product', '$$productId'] },
                                    { $eq: ['$deletedAt', null] },
                                ]
                            }
                        }
                    },
                    { $project: { _id: 1, size: 1, color: 1, mrp: 1, sellingPrice: 1 } },
                    { $limit: 1 },
                ],
                as: 'matchedVariants'
            }
        },
        {
            $lookup: {
                from: 'reviews',
                let: { productId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$product', '$$productId'] },
                                    { $eq: ['$deletedAt', null] },
                                    LIVE_REVIEW_EXPR,
                                ]
                            }
                        }
                    },
                    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
                ],
                as: 'reviewStats'
            }
        },
        {
            $lookup: {
                from: 'medias',
                let: { mediaIds: '$media' },
                pipeline: [
                    { $match: { $expr: { $in: ['$_id', '$$mediaIds'] } } },
                    { $project: { _id: 1, secure_url: 1, alt: 1 } },
                ],
                as: 'media'
            }
        },
        {
            $project: {
                _id: 1,
                name: 1,
                slug: 1,
                mrp: 1,
                sellingPrice: 1,
                discountPercentage: 1,
                media: 1,
                ratingAvg: { $ifNull: [{ $arrayElemAt: ['$reviewStats.avg', 0] }, 0] },
                ratingCount: { $ifNull: [{ $arrayElemAt: ['$reviewStats.count', 0] }, 0] },
                // null when every variant has been removed — the card then shows
                // the product but can't be added to the cart.
                defaultVariant: { $ifNull: [{ $arrayElemAt: ['$matchedVariants', 0] }, null] },
            }
        },
    ])

    const found = new Set(products.map((product) => String(product._id)))
    const missing = ids.filter((id) => !found.has(id))

    return toPlainObject({ products, missing })
}

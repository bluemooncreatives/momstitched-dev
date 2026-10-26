import mongoose, { isValidObjectId } from 'mongoose'
import cloudinary from '@/lib/cloudinary'
import MediaModel from '@/models/Media.model'
import ProductModel from '@/models/Product.model'
import ProductVariantModel from '@/models/ProductVariant.model'
import CategoryModel from '@/models/Category.model'

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const MAX_UPLOAD_BATCH = 20
const ALLOWED_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif']
// A rejected upload is only removed from Cloudinary when it was created this
// recently — so a hand-crafted request can't get an older, unrelated asset
// (one that never went through this uploader) deleted.
const FRESH_UPLOAD_MS = 60 * 60 * 1000
// A permanent delete that crashed mid-way leaves `deletingAt` set; after this
// long the row can be claimed again by a new delete attempt.
const STALE_DELETE_MS = 10 * 60 * 1000
const CLOUDINARY_BATCH = 100

// Media the storefront and pickers may use: not trashed, not being deleted.
export const LIVE_MEDIA_FILTER = { deletedAt: null, deletingAt: null }

const chunk = (list, size) => {
    const out = []
    for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size))
    return out
}

const thumbnailUrl = (resource) => cloudinary.url(resource.public_id, {
    secure: true,
    version: resource.version,
    format: resource.format,
    transformation: [{ crop: 'limit', width: 90, height: 60 }],
})

const rejectionFor = (resource) => {
    if (resource.resource_type !== 'image') return 'Only images can be added to the media library.'
    if (!ALLOWED_FORMATS.includes(String(resource.format).toLowerCase())) {
        return `Unsupported format "${resource.format}". Use JPG, PNG, WebP, AVIF or GIF.`
    }
    if (resource.bytes > MAX_IMAGE_BYTES) return 'Image is larger than 5 MB.'
    return null
}

/**
 * Register Cloudinary uploads in the media library. Only `public_id` is taken
 * from the client — every other field comes from Cloudinary's own record, so a
 * forged URL, size or format can't be stored. Idempotent: ids that are already
 * registered return their existing row, so retrying after a failure is safe.
 *
 * @returns {Promise<{ media: object[], rejected: { public_id: string, reason: string }[] }>}
 */
export const registerUploads = async (publicIds) => {
    const ids = [...new Set(publicIds)]
    const rejected = []

    const existing = await MediaModel.find({ public_id: { $in: ids } }).select('public_id').lean()
    const existingIds = new Set(existing.map((row) => row.public_id))
    const newIds = ids.filter((id) => !existingIds.has(id))

    const resources = []
    for (const batch of chunk(newIds, CLOUDINARY_BATCH)) {
        const result = await cloudinary.api.resources_by_ids(batch, { resource_type: 'image' })
        resources.push(...(result.resources || []))
    }
    const resourceById = new Map(resources.map((resource) => [resource.public_id, resource]))

    const toInsert = []
    const toDiscard = []
    for (const id of newIds) {
        const resource = resourceById.get(id)
        if (!resource) {
            rejected.push({ public_id: id, reason: 'Upload not found on the image host.' })
            continue
        }
        const reason = rejectionFor(resource)
        if (reason) {
            rejected.push({ public_id: id, reason })
            if (Date.now() - new Date(resource.created_at).getTime() < FRESH_UPLOAD_MS) toDiscard.push(id)
            continue
        }
        toInsert.push(resource)
    }

    if (toInsert.length) {
        // Upsert keyed on the unique public_id: two concurrent retries of the
        // same upload converge on one row instead of racing to insert twice.
        await MediaModel.bulkWrite(toInsert.map((resource) => ({
            updateOne: {
                filter: { public_id: resource.public_id },
                update: {
                    $setOnInsert: {
                        asset_id: resource.asset_id,
                        public_id: resource.public_id,
                        path: `v${resource.version}/${resource.public_id}.${resource.format}`,
                        secure_url: resource.secure_url,
                        thumbnail_url: thumbnailUrl(resource),
                        bytes: resource.bytes,
                        width: resource.width,
                        height: resource.height,
                        format: resource.format,
                        deletedAt: null,
                        deletingAt: null,
                    },
                },
                upsert: true,
            },
        })), { ordered: false })
    }

    // Best-effort: a rejected upload that we just discovered is unusable is
    // removed so it doesn't linger as an orphan. Never touches library rows.
    if (toDiscard.length) {
        try {
            await cloudinary.api.delete_resources(toDiscard, { invalidate: true })
        } catch (error) {
            console.error('media: failed to discard rejected uploads', error?.message || error)
        }
    }

    const media = await MediaModel.find({ public_id: { $in: ids } }).lean()
    return { media, rejected }
}

/**
 * Check that every id points at live library media. Used before a product,
 * variant or category is saved so it can never reference trashed media.
 */
export const findUnavailableMedia = async (ids) => {
    const unique = [...new Set(ids.map(String))]
    if (!unique.length) return []
    if (unique.some((id) => !isValidObjectId(id))) return unique.filter((id) => !isValidObjectId(id))
    const live = await MediaModel.find({ _id: { $in: unique }, ...LIVE_MEDIA_FILTER }).select('_id').lean()
    const liveIds = new Set(live.map((row) => String(row._id)))
    return unique.filter((id) => !liveIds.has(id))
}

export const unavailableMediaMessage = (count) => count === 1
    ? 'One selected image is in the trash or no longer exists. Remove it and try again.'
    : `${count} selected images are in the trash or no longer exist. Remove them and try again.`

/**
 * Where each media id is still referenced. Products and variants count
 * whether or not they are trashed — a trashed product can be restored, and
 * its images must still be there when it is.
 */
export const findMediaUsage = async (rawIds) => {
    // Aggregation pipelines don't cast, so match on real ObjectIds.
    const ids = rawIds.map((id) => new mongoose.Types.ObjectId(String(id)))
    const countBy = (Model) => Model.aggregate([
        { $match: { media: { $in: ids } } },
        { $unwind: '$media' },
        { $match: { media: { $in: ids } } },
        { $group: { _id: '$media', count: { $sum: 1 } } },
    ])

    const [productRows, variantRows, categories] = await Promise.all([
        countBy(ProductModel),
        countBy(ProductVariantModel),
        CategoryModel.find({ coverImage: { $in: ids } }).select('coverImage').lean(),
    ])

    const usage = new Map()
    const bump = (id, key, by = 1) => {
        const entry = usage.get(String(id)) || { products: 0, variants: 0, categories: 0 }
        entry[key] += by
        usage.set(String(id), entry)
    }
    productRows.forEach((row) => bump(row._id, 'products', row.count))
    variantRows.forEach((row) => bump(row._id, 'variants', row.count))
    categories.forEach((row) => bump(row.coverImage, 'categories'))
    return usage
}

const describeUsage = ({ products, variants, categories }) => [
    products && `${products} product${products === 1 ? '' : 's'}`,
    variants && `${variants} variant${variants === 1 ? '' : 's'}`,
    categories && `${categories} categor${categories === 1 ? 'y' : 'ies'}`,
].filter(Boolean).join(', ')

/**
 * Permanently delete trashed media, Cloudinary first. A row is removed from
 * the library only once Cloudinary confirms the asset is gone (or was already
 * gone), so a failed call never leaves a library row pointing at nothing — or
 * an unreachable asset still billed in Cloudinary. Media that is not in the
 * trash, or is still used anywhere, is skipped with a reason.
 *
 * @returns {Promise<{ deleted: string[], skipped: { id: string, reason: string }[], failed: string[] }>}
 */
export const permanentlyDeleteMedia = async (rawIds) => {
    const ids = [...new Set(rawIds.map(String))].filter(isValidObjectId)
    const skipped = []

    const trashed = await MediaModel.find({ _id: { $in: ids }, deletedAt: { $ne: null } }).select('_id').lean()
    const trashedIds = new Set(trashed.map((row) => String(row._id)))
    for (const id of ids) {
        if (!trashedIds.has(id)) skipped.push({ id, reason: 'Not in the trash. Move it to the trash first.' })
    }

    const usage = await findMediaUsage([...trashedIds])
    const eligible = []
    for (const id of trashedIds) {
        const used = usage.get(id)
        if (used) skipped.push({ id, reason: `Still used by ${describeUsage(used)}.` })
        else eligible.push(id)
    }

    if (!eligible.length) return { deleted: [], skipped, failed: [] }

    // Claim the rows so a concurrent delete (double click, second tab) can't
    // process the same assets; a claim older than STALE_DELETE_MS is re-taken.
    const claimedAt = new Date()
    await MediaModel.updateMany(
        {
            _id: { $in: eligible },
            deletedAt: { $ne: null },
            $or: [{ deletingAt: null }, { deletingAt: { $lt: new Date(claimedAt.getTime() - STALE_DELETE_MS) } }],
        },
        { $set: { deletingAt: claimedAt } }
    )
    const claimed = await MediaModel.find({ _id: { $in: eligible }, deletingAt: claimedAt }).select('_id public_id').lean()
    for (const id of eligible) {
        if (!claimed.some((row) => String(row._id) === id)) skipped.push({ id, reason: 'Already being deleted.' })
    }

    const confirmed = []
    const failed = []
    for (const batch of chunk(claimed, CLOUDINARY_BATCH)) {
        try {
            const result = await cloudinary.api.delete_resources(batch.map((row) => row.public_id), { invalidate: true })
            for (const row of batch) {
                const status = result?.deleted?.[row.public_id]
                if (status === 'deleted' || status === 'not_found') confirmed.push(row._id)
                else failed.push(row._id)
            }
        } catch (error) {
            console.error('media: Cloudinary delete failed', error?.message || error)
            failed.push(...batch.map((row) => row._id))
        }
    }

    if (confirmed.length) await MediaModel.deleteMany({ _id: { $in: confirmed } })
    // Release failed rows back to the trash so they can be retried.
    if (failed.length) await MediaModel.updateMany({ _id: { $in: failed } }, { $set: { deletingAt: null } })

    return { deleted: confirmed.map(String), skipped, failed: failed.map(String) }
}

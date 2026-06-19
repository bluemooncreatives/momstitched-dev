import { unstable_cache } from 'next/cache'
import { connectDB } from '@/lib/databaseConnection'
import ProductModel from '@/models/Product.model'
import ProductVariantModel from '@/models/ProductVariant.model'
import ReviewModel from '@/models/Review.model'
import '@/models/Media.model'
import '@/models/SizeGuide.model'

const toPlainObject = (data) => JSON.parse(JSON.stringify(data))

const fetchFeaturedProducts = async () => {
    await connectDB()

    const featuredProducts = await ProductModel.find({ deletedAt: null })
        .sort({ createdAt: -1 })
        .limit(9)
        .populate('media', 'secure_url alt')
        .populate('sizeGuide', 'name slug type columns rows note isActive')
        .lean()

    // Attach a default variant (cheapest available) per product so storefront
    // cards can quick-add to the cart, which keys on variantId.
    const productIds = featuredProducts.map((product) => product._id)
    const variants = await ProductVariantModel.find({ product: { $in: productIds }, deletedAt: null })
        .select('product color size mrp sellingPrice')
        .sort({ sellingPrice: 1 })
        .lean()

    const variantByProduct = new Map()
    for (const variant of variants) {
        const key = String(variant.product)
        if (!variantByProduct.has(key)) variantByProduct.set(key, variant)
    }

    const enriched = featuredProducts.map((product) => ({
        ...product,
        defaultVariant: variantByProduct.get(String(product._id)) || null,
    }))

    return toPlainObject(enriched)
}

export const getFeaturedProducts = unstable_cache(
    fetchFeaturedProducts,
    ['storefront-featured-products'],
    {
        revalidate: 300,
        tags: ['storefront-featured-products']
    }
)

const fetchProductDetailsBySlug = async (slug, size, color) => {
    if (!slug) return null

    await connectDB()

    const product = await ProductModel.findOne({ deletedAt: null, slug })
        .populate('media', 'secure_url alt')
        .populate('sizeGuide', 'name slug type columns rows note isActive')
        .lean()

    if (!product) return null

    const variantFilter = {
        product: product._id,
        deletedAt: null
    }

    if (size) variantFilter.size = size
    if (color) variantFilter.color = color

    let variant = await ProductVariantModel.findOne(variantFilter)
        .populate('media', 'secure_url alt')
        .lean()

    // fallback to first available variant if requested combination does not exist
    if (!variant) {
        variant = await ProductVariantModel.findOne({ product: product._id, deletedAt: null })
            .sort({ _id: 1 })
            .populate('media', 'secure_url alt')
            .lean()
    }

    if (!variant) return null

    const [colors, sizesResult, reviewCount] = await Promise.all([
        ProductVariantModel.distinct('color', { product: product._id, deletedAt: null }),
        ProductVariantModel.aggregate([
            { $match: { product: product._id, deletedAt: null } },
            { $sort: { _id: 1 } },
            {
                $group: {
                    _id: '$size',
                    first: { $first: '$_id' }
                }
            },
            { $sort: { first: 1 } },
            { $project: { _id: 0, size: '$_id' } }
        ]),
        ReviewModel.countDocuments({ product: product._id })
    ])

    return toPlainObject({
        product,
        variant,
        colors,
        sizes: sizesResult.length ? sizesResult.map((item) => item.size) : [],
        reviewCount
    })
}

export const getProductDetailsBySlug = unstable_cache(
    fetchProductDetailsBySlug,
    ['storefront-product-details'],
    {
        revalidate: 180,
        tags: ['storefront-product-details']
    }
)

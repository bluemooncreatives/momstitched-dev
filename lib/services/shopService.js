import { unstable_cache } from 'next/cache'
import { connectDB } from '@/lib/databaseConnection'
import CategoryModel from '@/models/Category.model'
import ProductModel from '@/models/Product.model'
import ProductVariantModel from '@/models/ProductVariant.model'

const toPlainObject = (data) => JSON.parse(JSON.stringify(data))

const normalizeParam = (value) => {
    if (Array.isArray(value)) return value.join(',')
    return value ?? ''
}

const fetchShopFilters = async () => {
    await connectDB()

    const [categories, colors, sizesAggregate] = await Promise.all([
        CategoryModel.find({ deletedAt: null }).select('name slug').lean(),
        ProductVariantModel.distinct('color', { deletedAt: null }),
        ProductVariantModel.aggregate([
            { $match: { deletedAt: null } },
            { $sort: { _id: 1 } },
            {
                $group: {
                    _id: '$size',
                    first: { $first: '$_id' }
                }
            },
            { $sort: { first: 1 } },
            { $project: { _id: 0, size: '$_id' } }
        ])
    ])

    const sizes = sizesAggregate.map((item) => item.size)

    return toPlainObject({ categories, colors, sizes })
}

export const getShopFilters = unstable_cache(
    fetchShopFilters,
    ['storefront-shop-filters'],
    {
        revalidate: 300,
        tags: ['storefront-shop-filters']
    }
)

export const getShopProducts = async (params = {}) => {
    await connectDB()

    const size = normalizeParam(params.size)
    const color = normalizeParam(params.color)
    const minPrice = parseInt(params.minPrice) || 0
    const maxPrice = parseInt(params.maxPrice) || 100000
    const categorySlug = normalizeParam(params.category)
    const search = normalizeParam(params.q)

    const sizeList = size ? size.split(',').filter(Boolean) : []
    const colorList = color ? color.split(',').filter(Boolean) : []

    const limit = Math.min(parseInt(params.limit) || 9, 30)
    const page = parseInt(params.page) || 0
    const skip = page * limit

    const sortOption = params.sort || 'default_sorting'
    let sortquery = {}
    if (sortOption === 'default_sorting') sortquery = { createdAt: -1 }
    if (sortOption === 'asc') sortquery = { name: 1 }
    if (sortOption === 'desc') sortquery = { name: -1 }
    if (sortOption === 'price_low_high') sortquery = { sellingPrice: 1 }
    if (sortOption === 'price_high_low') sortquery = { sellingPrice: -1 }

    let categoryId = []
    if (categorySlug) {
        const slugs = categorySlug.split(',')
        const categoryData = await CategoryModel.find({ deletedAt: null, slug: { $in: slugs } })
            .select('_id')
            .lean()
        categoryId = categoryData.map((category) => category._id)
    }

    let matchStage = { deletedAt: null }
    if (categoryId.length > 0) matchStage.category = { $in: categoryId }

    if (search) {
        matchStage.name = { $regex: search, $options: 'i' }
    }

    const products = await ProductModel.aggregate([
        { $match: matchStage },
        { $sort: sortquery },
        { $skip: skip },
        { $limit: limit + 1 },
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
                                    sizeList.length > 0 ? { $in: ['$size', sizeList] } : { $literal: true },
                                    colorList.length > 0 ? { $in: ['$color', colorList] } : { $literal: true },
                                    { $gte: ['$sellingPrice', minPrice] },
                                    { $lte: ['$sellingPrice', maxPrice] },
                                ]
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                        }
                    },
                    {
                        $limit: 1
                    }
                ],
                as: 'matchedVariants'
            }
        },
        {
            $match: { 'matchedVariants.0': { $exists: true } }
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
                                    { $eq: ['$deletedAt', null] }
                                ]
                            }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            avg: { $avg: '$rating' },
                            count: { $sum: 1 }
                        }
                    }
                ],
                as: 'reviewStats'
            }
        },
        {
            $addFields: {
                ratingAvg: { $ifNull: [{ $arrayElemAt: ['$reviewStats.avg', 0] }, 0] },
                ratingCount: { $ifNull: [{ $arrayElemAt: ['$reviewStats.count', 0] }, 0] }
            }
        },
        {
            $lookup: {
                from: 'medias',
                let: { mediaIds: '$media' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $in: ['$_id', '$$mediaIds']
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            secure_url: 1,
                            alt: 1
                        }
                    }
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
                ratingAvg: 1,
                ratingCount: 1,
                media: {
                    _id: 1,
                    secure_url: 1,
                    alt: 1
                }
            }
        }
    ])

    let nextPage = null
    if (products.length > limit) {
        nextPage = page + 1
        products.pop()
    }

    return toPlainObject({ products, nextPage })
}

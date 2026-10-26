import { unstable_cache } from 'next/cache'
import { connectDB } from '@/lib/databaseConnection'
import { categoryCover } from '@/lib/categoryConfig'
import { getShopProducts } from '@/lib/services/shopService'
import CategoryModel from '@/models/Category.model'
import ProductModel from '@/models/Product.model'
import '@/models/Media.model'

const toPlainObject = (data) => JSON.parse(JSON.stringify(data))

// Products rendered on the landing page itself; the rest are one click away
// in the filterable shop.
export const CATEGORY_PAGE_PRODUCTS = 24
const RELATED_CATEGORY_COUNT = 8

const fetchCategoryLanding = async (slug) => {
    if (!slug) return null
    await connectDB()

    const key = String(slug).trim().toLowerCase()
    // Current slug or a previous one — the page 308s old slugs to the current.
    const category = await CategoryModel.findOne({ deletedAt: null, $or: [{ slug: key }, { routeSlugs: key }] })
        .select('name slug intro faqs coverImage coverAlt coverPosition updatedAt')
        .populate('coverImage', 'secure_url alt deletedAt deletingAt')
        .lean()
    if (!category) return null

    const [{ products, total }, related] = await Promise.all([
        // Same query the shop uses, so counts and cards match /shop?category=.
        getShopProducts({ category: category.slug, limit: CATEGORY_PAGE_PRODUCTS }),
        fetchRelatedCategories(category._id),
    ])

    return toPlainObject({
        category: {
            _id: category._id,
            name: category.name,
            slug: category.slug,
            intro: category.intro || '',
            faqs: category.faqs || [],
            cover: categoryCover(category),
            updatedAt: category.updatedAt,
        },
        products,
        total,
        related,
    })
}

// Other categories that actually have products, most-stocked first.
const fetchRelatedCategories = async (excludeId) => {
    const counts = await ProductModel.aggregate([
        { $match: { deletedAt: null, category: { $ne: excludeId } } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: RELATED_CATEGORY_COUNT * 2 },
    ])
    if (!counts.length) return []
    const categories = await CategoryModel.find({ deletedAt: null, _id: { $in: counts.map((row) => row._id) } })
        .select('name slug')
        .lean()
    const byId = new Map(categories.map((category) => [String(category._id), category]))
    return counts
        .map((row) => byId.get(String(row._id)))
        .filter(Boolean)
        .slice(0, RELATED_CATEGORY_COUNT)
        .map(({ name, slug }) => ({ name, slug }))
}

export const getCategoryLanding = unstable_cache(
    fetchCategoryLanding,
    ['storefront-category-landing'],
    {
        revalidate: 300,
        tags: ['storefront-category-landing']
    }
)

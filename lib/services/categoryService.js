import { unstable_cache } from 'next/cache'
import { connectDB } from '@/lib/databaseConnection'
import CategoryModel from '@/models/Category.model'
import ProductModel from '@/models/Product.model'
import '@/models/Media.model'
import { WEBSITE_SHOP } from '@/routes/WebsiteRoute'

const toPlainObject = (data) => JSON.parse(JSON.stringify(data))

// Homepage "Categories" archive renders the most popular categories. The list
// is capped so the layout/animation stays balanced regardless of how many
// categories exist in the catalogue.
const HOME_CATEGORY_COUNT = 9

const fetchHomeCategories = async () => {
    await connectDB()

    // 1) Rank categories by how many active products they hold. This is the
    //    definition of "top" — popular, self-maintaining, and needs no extra
    //    admin field on the Category model.
    const counts = await ProductModel.aggregate([
        { $match: { deletedAt: null } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
    ])

    if (!counts.length) return []

    const countByCategory = new Map(counts.map((row) => [String(row._id), row.count]))
    const candidateIds = counts.map((row) => row._id)

    // 2) Resolve names/slugs and drop soft-deleted categories. A product can
    //    still point at a trashed category, so this join is the authority on
    //    which categories are allowed to surface on the storefront.
    const categories = await CategoryModel.find({
        deletedAt: null,
        _id: { $in: candidateIds }
    })
        .select('name slug createdAt')
        .lean()

    if (!categories.length) return []

    // 3) Pick a representative image per category: the newest active product
    //    that carries at least one non-deleted media asset. Categories whose
    //    products have no usable image get none here and are filtered out below
    //    — the section is image-led, so a category with nothing to show should
    //    not be featured (and its hover preview would otherwise be blank).
    const categoryIds = categories.map((category) => category._id)
    const imageRows = await ProductModel.aggregate([
        { $match: { deletedAt: null, category: { $in: categoryIds } } },
        // Newest first so $first lands on the most recent product with an image.
        { $sort: { createdAt: -1, _id: -1 } },
        {
            $lookup: {
                from: 'medias',
                let: { mediaIds: { $ifNull: ['$media', []] } },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $in: ['$_id', '$$mediaIds'] },
                                    { $eq: ['$deletedAt', null] }
                                ]
                            }
                        }
                    },
                    { $project: { _id: 0, secure_url: 1, alt: 1 } },
                    { $limit: 1 }
                ],
                as: 'firstMedia'
            }
        },
        // Only products that resolved to a usable image can represent a category.
        { $match: { 'firstMedia.0': { $exists: true } } },
        {
            $group: {
                _id: '$category',
                image: { $first: { $arrayElemAt: ['$firstMedia', 0] } }
            }
        }
    ])

    const imageByCategory = new Map(imageRows.map((row) => [String(row._id), row.image]))

    // 4) Keep only categories that have both a product count and a usable image,
    //    order by popularity (count desc) with a stable name tiebreaker, then
    //    cap at HOME_CATEGORY_COUNT.
    const ranked = categories
        .filter((category) => imageByCategory.has(String(category._id)))
        .map((category) => {
            const id = String(category._id)
            const count = countByCategory.get(id) || 0
            const image = imageByCategory.get(id)
            return {
                id,
                name: category.name,
                slug: category.slug,
                href: `${WEBSITE_SHOP}?category=${encodeURIComponent(category.slug)}`,
                productCount: count,
                collectionLabel: `${count} ${count === 1 ? 'Style' : 'Styles'}`,
                year: category.createdAt
                    ? new Date(category.createdAt).getFullYear()
                    : new Date().getFullYear(),
                previewImage: image?.secure_url || '',
                alt: image?.alt || category.name
            }
        })
        // Guard against a media row that somehow has no URL.
        .filter((category) => category.previewImage)
        .sort((a, b) => {
            if (b.productCount !== a.productCount) return b.productCount - a.productCount
            return a.name.localeCompare(b.name)
        })
        .slice(0, HOME_CATEGORY_COUNT)

    return toPlainObject(ranked)
}

export const getHomeCategories = unstable_cache(
    fetchHomeCategories,
    ['storefront-home-categories'],
    {
        revalidate: 300,
        tags: ['storefront-home-categories']
    }
)

import { connectDB } from '@/lib/databaseConnection'
import { SITE_URL, absoluteUrl, categoryUrl } from '@/lib/seo'
import { WEBSITE_PRODUCT_DETAILS } from '@/routes/WebsiteRoute'
import CategoryModel from '@/models/Category.model'
import ProductModel from '@/models/Product.model'
import ProductVariantModel from '@/models/ProductVariant.model'
import '@/models/Media.model'

// Regenerate the sitemap at most once an hour so new products show up
// without hitting the database on every crawl.
export const revalidate = 3600

// Next writes <loc>/<image:loc> values verbatim, so anything with `&` (or a
// stray quote in a CDN URL) would produce invalid XML unless escaped here.
const xmlEscape = (value) =>
    String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')

export default async function sitemap() {
    const staticPages = [
        { url: `${SITE_URL}/`, changeFrequency: 'daily', priority: 1 },
        { url: absoluteUrl('/shop'), changeFrequency: 'daily', priority: 0.9 },
        { url: absoluteUrl('/about-us'), changeFrequency: 'monthly', priority: 0.5 },
        { url: absoluteUrl('/contact'), changeFrequency: 'monthly', priority: 0.5 },
        { url: absoluteUrl('/privacy-policy'), changeFrequency: 'yearly', priority: 0.3 },
        { url: absoluteUrl('/terms-and-conditions'), changeFrequency: 'yearly', priority: 0.3 },
    ]

    let productPages = []
    let categoryPages = []
    try {
        await connectDB()

        // A product page 404s without a live variant, so only products that
        // can actually be bought are listed — and only their categories.
        const stockedProductIds = await ProductVariantModel.distinct('product', { deletedAt: null })

        const products = await ProductModel.find({ deletedAt: null, _id: { $in: stockedProductIds } })
            .select('slug category media updatedAt')
            .populate({ path: 'media', match: { deletedAt: null }, select: 'secure_url' })
            .lean()

        productPages = products.map((product) => ({
            url: xmlEscape(absoluteUrl(WEBSITE_PRODUCT_DETAILS(product.slug))),
            lastModified: product.updatedAt,
            changeFrequency: 'weekly',
            priority: 0.8,
            images: (product.media || [])
                .map((media) => media?.secure_url)
                .filter(Boolean)
                .map(xmlEscape),
        }))

        // Newest product update per category doubles as the category's lastModified.
        const latestByCategory = new Map()
        for (const product of products) {
            const key = String(product.category)
            const current = latestByCategory.get(key)
            if (!current || product.updatedAt > current) latestByCategory.set(key, product.updatedAt)
        }

        const categories = await CategoryModel.find({
            deletedAt: null,
            _id: { $in: [...latestByCategory.keys()] },
        })
            .select('slug')
            .lean()

        categoryPages = categories.map((category) => ({
            url: xmlEscape(categoryUrl(category.slug)),
            lastModified: latestByCategory.get(String(category._id)),
            changeFrequency: 'weekly',
            priority: 0.7,
        }))
    } catch (error) {
        // A database hiccup shouldn't take the whole sitemap down —
        // serve the static pages and let the next revalidation retry.
        console.error('sitemap: failed to load catalogue', error)
    }

    return [...staticPages, ...categoryPages, ...productPages]
}

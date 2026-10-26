import ShopClient from '@/components/Application/Website/ShopClient'
import { getDefaultShopProducts, getShopFilters, getShopProducts } from '@/lib/services/shopService'
import { WEBSITE_CATEGORY, WEBSITE_SHOP } from '@/routes/WebsiteRoute'

const buildSearchParamString = (searchParams) => {
    if (!searchParams) return ''
    const params = new URLSearchParams()
    Object.entries(searchParams).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            value.forEach((item) => params.append(key, item))
        } else if (value !== undefined && value !== null) {
            params.set(key, value)
        }
    })
    return params.toString()
}

// Bare /shop is indexable; ?category=x on its own is the category landing
// page's content, so it canonicalises there; any other filter/sort/search
// combination is a near-duplicate — noindex, but keep following its links.
export async function generateMetadata({ searchParams }) {
    const params = (await searchParams) ?? {}
    const keys = Object.keys(params).filter((key) => params[key] !== undefined && params[key] !== '')

    if (keys.length === 0) {
        return { alternates: { canonical: WEBSITE_SHOP } }
    }
    const category = params.category
    if (keys.length === 1 && typeof category === 'string' && /^[a-z0-9-]+$/.test(category)) {
        return { alternates: { canonical: WEBSITE_CATEGORY(category) } }
    }
    return { alternates: { canonical: WEBSITE_SHOP }, robots: { index: false, follow: true } }
}

const Shop = async ({ searchParams }) => {
    const resolvedSearchParams = (await searchParams) ?? {}
    const initialSearchParamsString = buildSearchParamString(resolvedSearchParams)
    const [filters, { products, total, totalPages }] = await Promise.all([
        getShopFilters(),
        // Bare /shop (no filters/search/sort) serves the cached default page;
        // any query param falls through to the fully dynamic aggregation.
        initialSearchParamsString === ''
            ? getDefaultShopProducts()
            : getShopProducts({
                size: resolvedSearchParams?.size,
                color: resolvedSearchParams?.color,
                minPrice: resolvedSearchParams?.minPrice,
                maxPrice: resolvedSearchParams?.maxPrice,
                category: resolvedSearchParams?.category,
                bestseller: resolvedSearchParams?.bestseller,
                freshlyArrived: resolvedSearchParams?.freshlyArrived,
                q: resolvedSearchParams?.q,
                sort: resolvedSearchParams?.sort,
                limit: resolvedSearchParams?.limit,
                page: resolvedSearchParams?.page,
            })
    ])

    return (
        <ShopClient
            initialFilters={filters}
            initialProducts={products}
            initialTotal={total}
            initialTotalPages={totalPages}
            initialSearchParamsString={initialSearchParamsString}
        />
    )
}

export default Shop

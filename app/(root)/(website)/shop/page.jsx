import ShopClient from '@/components/Application/Website/ShopClient'
import { getShopFilters, getShopProducts } from '@/lib/services/shopService'

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

const Shop = async ({ searchParams }) => {
    const resolvedSearchParams = (await searchParams) ?? {}
    const initialSearchParamsString = buildSearchParamString(resolvedSearchParams)
    const [filters, { products, total, totalPages }] = await Promise.all([
        getShopFilters(),
        getShopProducts({
            size: resolvedSearchParams?.size,
            color: resolvedSearchParams?.color,
            minPrice: resolvedSearchParams?.minPrice,
            maxPrice: resolvedSearchParams?.maxPrice,
            category: resolvedSearchParams?.category,
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

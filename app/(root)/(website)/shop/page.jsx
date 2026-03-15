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
    const initialSearchParamsString = buildSearchParamString(searchParams)
    const [filters, { products, nextPage }] = await Promise.all([
        getShopFilters(),
        getShopProducts({
            size: searchParams?.size,
            color: searchParams?.color,
            minPrice: searchParams?.minPrice,
            maxPrice: searchParams?.maxPrice,
            category: searchParams?.category,
            q: searchParams?.q,
            sort: searchParams?.sort,
            limit: searchParams?.limit,
            page: searchParams?.page,
        })
    ])

    return (
        <ShopClient
            initialFilters={filters}
            initialProducts={products}
            initialNextPage={nextPage}
            initialSearchParamsString={initialSearchParamsString}
        />
    )
}

export default Shop

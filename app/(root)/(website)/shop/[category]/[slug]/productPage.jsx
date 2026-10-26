import { Suspense } from 'react'
import ProductDetails from './ProductDetails'
import ProductLoading from './ProductLoading'
import { getRelatedProducts } from '@/lib/services/productService'
import { htmlToText, pickRandom } from '@/lib/utils'
import JsonLd from '@/components/Application/JsonLd'
import { breadcrumbJsonLd, productJsonLd } from '@/lib/seo'
import { WEBSITE_CATEGORY, WEBSITE_HOME, WEBSITE_SHOP, productHref } from '@/routes/WebsiteRoute'

// Shared by the canonical /shop/{category}/{slug} route and the legacy
// /product/{slug} route (which redirects whenever the product has a category).

// Canonical path for a resolved product: /shop/{category}/{slug}, or
// /product/{slug} when its category is gone (that page then renders in place).
export const canonicalProductPath = (product) => productHref(product)

// Route params may or may not arrive percent-decoded; compare decoded values
// so a redirect can never point back at the URL it came from.
export const decodeParam = (value) => {
    try { return decodeURIComponent(String(value)) } catch { return String(value) }
}

// Re-attach the query (?color=&size=) so a redirect keeps the chosen variant.
export const withQuery = (path, searchParams = {}) => {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(searchParams)) {
        if (Array.isArray(value)) value.forEach((item) => params.append(key, item))
        else if (value != null) params.set(key, value)
    }
    const query = params.toString()
    return query ? `${path}?${query}` : path
}

export const productMetadata = (productData) => {
    if (!productData) return { title: 'Product not found' }

    const { product } = productData
    const description = htmlToText(product?.description).slice(0, 160)
    const image = product?.media?.[0]?.secure_url

    return {
        title: product?.name,
        description,
        // Old slugs, the legacy /product URL and ?color= / ?size= all collapse
        // onto the one canonical URL.
        alternates: { canonical: canonicalProductPath(product) },
        openGraph: {
            title: product?.name,
            description,
            images: image ? [{ url: image }] : [],
            type: 'website',
        },
    }
}

// Rendered by the route only after its redirect / not-found checks, so those
// still produce real 308 / 404 responses; the skeleton covers the rest.
export const ProductPageView = ({ productData }) => (
    <Suspense fallback={<ProductLoading />}>
        <ProductPageContent productData={productData} />
    </Suspense>
)

const ProductPageContent = async ({ productData }) => {
    // Fetch the cached pool, then randomly pick 4 so the rail varies each visit.
    const relatedPool = await getRelatedProducts(
        productData.product._id,
        productData.product.category?._id
    )
    const relatedProducts = pickRandom(relatedPool, 4)

    const { product } = productData
    // Mirrors the visible breadcrumb in ProductDetails.
    const crumbs = [
        { name: 'Home', path: WEBSITE_HOME },
        { name: 'Shop', path: WEBSITE_SHOP },
        ...(product.category?.name
            ? [{ name: product.category.name, path: WEBSITE_CATEGORY(product.category.slug) }]
            : []),
        { name: product.name, path: canonicalProductPath(product) },
    ]

    return (
        <>
            <JsonLd data={productJsonLd(productData)} />
            <JsonLd data={breadcrumbJsonLd(crumbs)} />
            <ProductDetails
                product={productData.product}
                variant={productData.variant}
                colors={productData.colors}
                colorEntries={productData.colorEntries}
                sizes={productData.sizes}
                variantOptions={productData.variantOptions}
                reviewCount={productData.reviewCount}
                ratingAvg={productData.ratingAvg}
                relatedProducts={relatedProducts}
            />
        </>
    )
}

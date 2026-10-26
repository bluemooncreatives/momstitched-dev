import { notFound, permanentRedirect } from 'next/navigation'
import { getProductDetailsBySlug } from '@/lib/services/productService'
import { ProductPageView, canonicalProductPath, decodeParam, productMetadata, withQuery } from './productPage'

export async function generateMetadata({ params }) {
    const { slug } = await params
    return productMetadata(await getProductDetailsBySlug(slug))
}

// Canonical product URL: /shop/{category}/{slug}. A renamed slug, a wrong or
// renamed category, or different casing all 308 here, keeping ?color/?size.
const ProductPage = async ({ params, searchParams }) => {
    const { category, slug } = await params
    const query = await searchParams
    const { color, size } = query

    const productData = await getProductDetailsBySlug(slug, size, color)
    if (!productData) notFound()

    const { product } = productData
    if (product.slug !== decodeParam(slug) || product.category?.slug !== decodeParam(category)) {
        permanentRedirect(withQuery(canonicalProductPath(product), query))
    }

    return <ProductPageView productData={productData} />
}

export default ProductPage

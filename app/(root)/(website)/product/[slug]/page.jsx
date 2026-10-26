import { notFound, permanentRedirect } from 'next/navigation'
import { getProductDetailsBySlug } from '@/lib/services/productService'
import { ProductPageView, canonicalProductPath, decodeParam, productMetadata, withQuery } from '../../shop/[category]/[slug]/productPage'

export async function generateMetadata({ params }) {
    const { slug } = await params
    return productMetadata(await getProductDetailsBySlug(slug))
}

// Legacy URL. Links from carts, orders and search (which don't know the
// category) and every URL shared before /shop/{category}/{slug} land here and
// 308 to the canonical page. Only a product whose category is gone renders here.
const LegacyProductPage = async ({ params, searchParams }) => {
    const { slug } = await params
    const query = await searchParams
    const { color, size } = query

    const productData = await getProductDetailsBySlug(slug, size, color)
    if (!productData) notFound()

    const { product } = productData
    if (product.category?.slug || product.slug !== decodeParam(slug)) {
        permanentRedirect(withQuery(canonicalProductPath(product), query))
    }

    return <ProductPageView productData={productData} />
}

export default LegacyProductPage

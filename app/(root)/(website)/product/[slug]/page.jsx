import { notFound } from 'next/navigation'
import ProductDetails from './ProductDetails'
import { getProductDetailsBySlug } from '@/lib/services/productService'

const ProductPage = async ({ params, searchParams }) => {
    const { slug } = await params
    const { color, size } = await searchParams

    const productData = await getProductDetailsBySlug(slug, size, color)

    if (!productData) notFound()

    return (
        <ProductDetails
            product={productData.product}
            variant={productData.variant}
            colors={productData.colors}
            sizes={productData.sizes}
            reviewCount={productData.reviewCount}
        />
    )
}

export default ProductPage

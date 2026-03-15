import ProductDetails from './ProductDetails'
import { getProductDetailsBySlug } from '@/lib/services/productService'

const ProductPage = async ({ params, searchParams }) => {
    const { slug } = await params
    const { color, size } = await searchParams

    const productData = await getProductDetailsBySlug(slug, size, color)

    if (!productData) {
        return (
            <section className='website-gutter py-14'>
                <div className='website-content rounded-[var(--admin-shell-radius)] border border-border/60 bg-white p-12 text-center shadow-sm'>
                    <h1 className='font-neue text-3xl font-semibold uppercase tracking-[0.06em]'>Data not found.</h1>
                </div>
            </section>
        )
    } else {

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

}

export default ProductPage

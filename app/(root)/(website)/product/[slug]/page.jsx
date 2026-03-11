import React from 'react'
import ProductDetails from './ProductDetails'
import { getProductDetailsBySlug } from '@/lib/services/productService'

const ProductPage = async ({ params, searchParams }) => {
    const { slug } = await params
    const { color, size } = await searchParams

    const productData = await getProductDetailsBySlug(slug, size, color)

    if (!productData) {
        return (
            <div className='flex justify-center items-center py-10 h-[300px]'>
                <h1 className='text-4xl font-semibold'>Data not found.</h1>
            </div>
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

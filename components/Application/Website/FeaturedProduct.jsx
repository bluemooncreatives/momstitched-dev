import dynamic from 'next/dynamic'
import { getFeaturedProducts } from '@/lib/services/productService'

const FeaturedProductClient = dynamic(() => import('./FeaturedProductClient'))

const FeaturedProduct = async () => {
    const products = await getFeaturedProducts()

    return <FeaturedProductClient products={products || []} />
}

export default FeaturedProduct

import FeaturedProductClient from './FeaturedProductClient'
import { getFeaturedProducts } from '@/lib/services/productService'

const FeaturedProduct = async () => {
    const products = await getFeaturedProducts()

    return <FeaturedProductClient products={products || []} />
}

export default FeaturedProduct

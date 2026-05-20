import BestsellersSectionClient from './BestsellersSectionClient'
import { getFeaturedProducts } from '@/lib/services/productService'

const BestsellersSection = async () => {
    const products = await getFeaturedProducts()
    return <BestsellersSectionClient products={(products || []).slice(0, 4)} />
}

export default BestsellersSection

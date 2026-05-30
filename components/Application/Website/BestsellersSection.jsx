import dynamic from 'next/dynamic'
import { getFeaturedProducts } from '@/lib/services/productService'

const BestsellersSectionClient = dynamic(() => import('./BestsellersSectionClient'))

const BestsellersSection = async () => {
    const products = await getFeaturedProducts()
    return <BestsellersSectionClient products={(products || []).slice(0, 4)} />
}

export default BestsellersSection

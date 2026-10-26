import { permanentRedirect } from 'next/navigation'
import { WEBSITE_CATEGORY } from '@/routes/WebsiteRoute'
import { withQuery } from './[slug]/productPage'

// /shop/{category} on its own is the category landing page's job.
const ShopCategoryRedirect = async ({ params, searchParams }) => {
    const { category } = await params
    permanentRedirect(withQuery(WEBSITE_CATEGORY(String(category).toLowerCase()), await searchParams))
}

export default ShopCategoryRedirect

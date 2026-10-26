import { revalidatePath, revalidateTag } from 'next/cache'

// Every storefront cache that renders product, category or media data. Catalogue
// mutations call revalidateCatalogue() instead of picking tags by hand, so a
// slug rename, image reorder or cover change can't leave one page stale.
const CATALOGUE_TAGS = [
    'storefront-featured-products',
    'storefront-bestseller-products',
    'storefront-freshly-arrived-products',
    'storefront-product-details',
    'storefront-related-products',
    'storefront-shop-filters',
    'storefront-shop-default-products',
    'storefront-home-categories',
    'storefront-home-colors',
    'storefront-category-landing',
    // About Us photos come from the media library (lib/services/pageContentService.js).
    'storefront-page-content',
]

export const revalidateCatalogue = () => {
    for (const tag of CATALOGUE_TAGS) revalidateTag(tag)
    revalidatePath('/sitemap.xml')
}

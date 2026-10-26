import { revalidateTag } from 'next/cache'

// Every cached storefront read that embeds review counts/averages. Call
// revalidateReviewCaches() after anything changes which reviews are live:
// create, publish/unpublish, trash/restore, permanent delete.
export const REVIEW_CACHE_TAGS = [
    'storefront-product-details',     // product page rating + count
    'storefront-related-products',    // "You may also like" card stars
    'storefront-shop-default-products', // cached first page of /shop
]

export const revalidateReviewCaches = () => {
    for (const tag of REVIEW_CACHE_TAGS) {
        revalidateTag(tag)
    }
}

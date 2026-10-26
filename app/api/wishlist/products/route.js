import { catchError, response } from "@/lib/helperFunction";
import { getWishlistProducts } from "@/lib/services/wishlistService";
import { MAX_WISHLIST_ITEMS } from "@/lib/wishlist";

// Public: resolves saved product ids (guest or account) into product cards.
export async function POST(request) {
    try {
        const payload = await request.json().catch(() => ({}))
        const productIds = Array.isArray(payload?.productIds)
            ? payload.productIds.slice(0, MAX_WISHLIST_ITEMS)
            : []

        const data = await getWishlistProducts(productIds)
        return response(true, 200, 'Wishlist products.', data)
    } catch (error) {
        return catchError(error)
    }
}

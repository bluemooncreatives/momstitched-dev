import { isAuthenticated } from "@/lib/authentication";
import { catchError, response } from "@/lib/helperFunction";
import { removeWishlistItems } from "@/lib/services/wishlistService";
import { MAX_WISHLIST_ITEMS } from "@/lib/wishlist";

// Accepts { productId } or { productIds: [] } (used to prune unavailable items).
export async function POST(request) {
    try {
        const auth = await isAuthenticated('user', request)
        if (!auth.isAuth) {
            return response(false, 401, 'Unauthorized')
        }

        const payload = await request.json().catch(() => ({}))
        const productIds = Array.isArray(payload?.productIds)
            ? payload.productIds.slice(0, MAX_WISHLIST_ITEMS)
            : [payload?.productId]

        const result = await removeWishlistItems(auth.userId, productIds.filter(Boolean))
        if (!result.ok) {
            return response(false, 400, 'Invalid product.', { code: result.code })
        }

        return response(true, 200, 'Removed from wishlist.')
    } catch (error) {
        return catchError(error)
    }
}

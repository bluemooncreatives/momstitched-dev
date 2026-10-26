import { isAuthenticated } from "@/lib/authentication";
import { catchError, response } from "@/lib/helperFunction";
import { mergeWishlist } from "@/lib/services/wishlistService";
import { MAX_WISHLIST_ITEMS } from "@/lib/wishlist";

// Called once after sign-in with the guest (localStorage) wishlist. Returns the
// merged account list, which the client adopts as the new source of truth.
export async function POST(request) {
    try {
        const auth = await isAuthenticated('user', request)
        if (!auth.isAuth) {
            return response(false, 401, 'Unauthorized')
        }

        const payload = await request.json().catch(() => ({}))
        // A tampered client could send thousands of entries; only the newest
        // MAX can ever survive the merge, so don't even look at the rest.
        const items = Array.isArray(payload?.items) ? payload.items.slice(0, MAX_WISHLIST_ITEMS * 2) : []

        const result = await mergeWishlist(auth.userId, items)
        if (!result.ok) {
            const statusCode = result.code === 'USER_NOT_FOUND' ? 404 : 409
            return response(false, statusCode, 'Could not sync your wishlist. Please try again.', { code: result.code })
        }

        return response(true, 200, 'Wishlist synced.', { items: result.items, dropped: result.dropped })
    } catch (error) {
        return catchError(error)
    }
}

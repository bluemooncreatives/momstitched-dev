import { isAuthenticated } from "@/lib/authentication";
import { catchError, response } from "@/lib/helperFunction";
import { getWishlist } from "@/lib/services/wishlistService";

// The signed-in customer's saved product ids, newest first.
export async function GET(request) {
    try {
        const auth = await isAuthenticated('user', request)
        if (!auth.isAuth) {
            return response(false, 401, 'Unauthorized')
        }

        const items = await getWishlist(auth.userId)
        if (!items) {
            return response(false, 404, 'User not found.')
        }

        return response(true, 200, 'Wishlist.', { items })
    } catch (error) {
        return catchError(error)
    }
}

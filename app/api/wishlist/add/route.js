import { isAuthenticated } from "@/lib/authentication";
import { catchError, response } from "@/lib/helperFunction";
import { addWishlistItem } from "@/lib/services/wishlistService";
import { MAX_WISHLIST_ITEMS } from "@/lib/wishlist";

const ERROR_MESSAGES = {
    INVALID_PRODUCT: [400, 'Invalid product.'],
    PRODUCT_NOT_FOUND: [404, 'This product is no longer available.'],
    USER_NOT_FOUND: [404, 'User not found.'],
    WISHLIST_FULL: [409, `Your wishlist can hold up to ${MAX_WISHLIST_ITEMS} items. Remove one to add another.`],
}

export async function POST(request) {
    try {
        const auth = await isAuthenticated('user', request)
        if (!auth.isAuth) {
            return response(false, 401, 'Unauthorized')
        }

        const payload = await request.json().catch(() => ({}))
        const result = await addWishlistItem(auth.userId, String(payload?.productId ?? ''))

        if (!result.ok) {
            const [statusCode, message] = ERROR_MESSAGES[result.code] || [400, 'Could not update wishlist.']
            return response(false, statusCode, message, { code: result.code })
        }

        return response(true, 200, 'Added to wishlist.', { added: result.added })
    } catch (error) {
        return catchError(error)
    }
}

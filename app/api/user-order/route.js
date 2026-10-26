import { isAuthenticated } from "@/lib/authentication";
import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { listUserOrders, toUserObjectId } from "@/lib/services/userOrderService";

const MAX_LIMIT = 50

const toPositiveInt = (value, fallback) => {
    const n = parseInt(value, 10)
    return Number.isFinite(n) && n > 0 ? n : fallback
}

// GET /api/user-order?tab=all|in_progress|delivered|cancelled&q=&page=1&limit=10
export async function GET(request) {
    try {
        await connectDB()
        const auth = await isAuthenticated('user', request)
        if (!auth.isAuth) {
            return response(false, 401, 'Unauthorized')
        }

        const searchParams = request.nextUrl.searchParams
        const params = {
            tab: searchParams.get('tab') || 'all',
            q: searchParams.get('q') || '',
            page: toPositiveInt(searchParams.get('page'), 1),
            limit: Math.min(toPositiveInt(searchParams.get('limit'), 10), MAX_LIMIT),
        }

        const userObjectId = toUserObjectId(auth.userId)
        if (!userObjectId) {
            return response(true, 200, 'Order info.', {
                orders: [],
                counts: { all: 0, in_progress: 0, delivered: 0, cancelled: 0 },
                total: 0,
                totalPages: 1,
                page: 1,
                limit: params.limit,
                tab: 'all',
                q: '',
            })
        }

        const data = await listUserOrders(userObjectId, params)
        return response(true, 200, 'Order info.', JSON.parse(JSON.stringify(data)))

    } catch (error) {
        return catchError(error)
    }
}

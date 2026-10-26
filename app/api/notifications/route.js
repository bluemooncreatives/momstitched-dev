import { ADMIN_EVENT_TYPES } from "@/lib/adminNotificationEvents"
import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import NotificationModel from "@/models/Notification.model"
import mongoose, { isValidObjectId } from "mongoose"

const MAX_LIMIT = 50

// Admin: cursor-paginated notification feed with the caller's unread count.
// `isRead` is computed per admin from `readBy`, which is never sent to the client.
export async function GET(request) {
    try {
        const auth = await isAuthenticated('admin', request)
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()

        const searchParams = request.nextUrl.searchParams
        const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10) || 20, 1), MAX_LIMIT)
        const before = searchParams.get('before')
        const status = searchParams.get('status') === 'unread' ? 'unread' : 'all'
        const type = searchParams.get('type')

        const adminId = new mongoose.Types.ObjectId(auth.userId)
        const unreadMatch = { readBy: { $ne: adminId } }

        const matchQuery = {}
        if (type && type !== 'all') {
            if (!ADMIN_EVENT_TYPES.includes(type)) {
                return response(false, 400, 'Invalid notification type.')
            }
            matchQuery.type = type
        }
        if (status === 'unread') {
            Object.assign(matchQuery, unreadMatch)
        }
        if (before) {
            if (!isValidObjectId(before)) {
                return response(false, 400, 'Invalid cursor.')
            }
            matchQuery._id = { $lt: new mongoose.Types.ObjectId(before) }
        }

        const [items, unreadCount] = await Promise.all([
            NotificationModel.aggregate([
                { $match: matchQuery },
                { $sort: { _id: -1 } },
                { $limit: limit + 1 },
                { $addFields: { isRead: { $in: [adminId, { $ifNull: ['$readBy', []] }] } } },
                { $project: { readBy: 0, dedupeKey: 0, __v: 0 } },
            ]),
            NotificationModel.countDocuments(unreadMatch),
        ])

        const hasMore = items.length > limit
        const page = hasMore ? items.slice(0, limit) : items

        return response(true, 200, 'Notifications fetched.', {
            items: page,
            unreadCount,
            hasMore,
            nextCursor: hasMore ? String(page[page.length - 1]._id) : null,
        })
    } catch (error) {
        return catchError(error)
    }
}

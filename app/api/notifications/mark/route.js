import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import NotificationModel from "@/models/Notification.model"
import mongoose, { isValidObjectId } from "mongoose"

// Admin: mark notifications read/unread for the calling admin only.
// Body: { ids: string[] } or { all: true }, plus { read: boolean } (default true).
export async function PUT(request) {
    try {
        const auth = await isAuthenticated('admin', request)
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json().catch(() => ({}))
        const read = payload?.read !== false
        const all = payload?.all === true
        const ids = Array.isArray(payload?.ids) ? payload.ids : []

        if (!all && !ids.length) {
            return response(false, 400, 'Select at least one notification.')
        }
        if (ids.length > 200 || ids.some((id) => !isValidObjectId(id))) {
            return response(false, 400, 'Invalid notification ids.')
        }

        const adminId = new mongoose.Types.ObjectId(auth.userId)
        const filter = all ? {} : { _id: { $in: ids } }
        const update = read
            ? { $addToSet: { readBy: adminId } }
            : { $pull: { readBy: adminId } }

        const result = await NotificationModel.updateMany(filter, update)
        const unreadCount = await NotificationModel.countDocuments({ readBy: { $ne: adminId } })

        return response(true, 200, read ? 'Marked as read.' : 'Marked as unread.', {
            modified: result.modifiedCount,
            unreadCount,
        })
    } catch (error) {
        return catchError(error)
    }
}

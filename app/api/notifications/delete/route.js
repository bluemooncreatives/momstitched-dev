import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import NotificationModel from "@/models/Notification.model"
import mongoose, { isValidObjectId } from "mongoose"

// Admin: permanently delete notifications. Notifications are a log, not
// business data, so there is no trash step.
// Body: { ids: string[] } or { scope: 'read' } (everything the caller has read).
export async function DELETE(request) {
    try {
        const auth = await isAuthenticated('admin', request)
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json().catch(() => ({}))
        const ids = Array.isArray(payload?.ids) ? payload.ids : []
        const adminId = new mongoose.Types.ObjectId(auth.userId)

        let filter
        if (payload?.scope === 'read') {
            filter = { readBy: adminId }
        } else {
            if (!ids.length) {
                return response(false, 400, 'Select at least one notification.')
            }
            if (ids.length > 200 || ids.some((id) => !isValidObjectId(id))) {
                return response(false, 400, 'Invalid notification ids.')
            }
            filter = { _id: { $in: ids } }
        }

        const result = await NotificationModel.deleteMany(filter)
        const unreadCount = await NotificationModel.countDocuments({ readBy: { $ne: adminId } })

        const message = result.deletedCount
            ? `Deleted ${result.deletedCount} notification${result.deletedCount === 1 ? '' : 's'}.`
            : 'Nothing to delete.'

        return response(true, 200, message, {
            deleted: result.deletedCount,
            unreadCount,
        })
    } catch (error) {
        return catchError(error)
    }
}

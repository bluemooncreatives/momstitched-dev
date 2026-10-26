import { ADMIN_EVENT_TYPES } from "@/lib/adminNotificationEvents"
import mongoose from "mongoose"

// In-app notification for the admin team. One document per event; read state
// is tracked per admin in `readBy` so several admins can each clear their own
// bell without hiding the event from the others.
const notificationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ADMIN_EVENT_TYPES,
        required: true,
        index: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    message: {
        type: String,
        trim: true,
        default: '',
    },
    // Admin panel path the notification opens (e.g. /admin/orders/details/<id>).
    link: {
        type: String,
        trim: true,
        default: '',
    },
    meta: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
    // Idempotency key (e.g. "order_placed:<order_id>"). Unique + sparse so a
    // retried request can never produce a second notification or email.
    dedupeKey: {
        type: String,
        trim: true,
        unique: true,
        sparse: true,
    },
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    // Outcome of the email copy, so a missed email is visible in the panel
    // instead of failing silently in the server logs.
    email: {
        status: {
            type: String,
            enum: ['sent', 'failed', 'disabled', 'none'],
            default: 'none',
        },
        recipients: [{ type: String, trim: true }],
        error: { type: String, default: null },
        sentAt: { type: Date, default: null },
    },
}, { timestamps: true })

notificationSchema.index({ createdAt: -1 })
notificationSchema.index({ readBy: 1, createdAt: -1 })

const NotificationModel = mongoose.models.Notification || mongoose.model('Notification', notificationSchema, 'notifications')
export default NotificationModel

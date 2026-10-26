import mongoose from "mongoose"

// Singleton (key: 'default') holding who receives admin emails and which
// events send one. Missing event keys fall back to ADMIN_EVENT_LIST defaults,
// so adding a new event never requires a migration.
const notificationSettingSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        default: 'default',
    },
    // Email every active account with the admin role.
    includeAdminAccounts: {
        type: Boolean,
        default: true,
    },
    // Email the store's sending inbox (NODEMAILER_EMAIL).
    includeStoreInbox: {
        type: Boolean,
        default: true,
    },
    extraRecipients: [{
        type: String,
        trim: true,
        lowercase: true,
    }],
    emailEvents: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
}, { timestamps: true, minimize: false })

const NotificationSettingModel = mongoose.models.NotificationSetting || mongoose.model('NotificationSetting', notificationSettingSchema, 'notification_settings')
export default NotificationSettingModel

import { ADMIN_EVENT_LIST } from "@/lib/adminNotificationEvents"
import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import {
    MAX_EXTRA_RECIPIENTS,
    getNotificationSettings,
    isValidEmail,
    resolveAdminRecipients,
} from "@/lib/services/notificationService"
import NotificationSettingModel from "@/models/NotificationSetting.model"
import UserModel from "@/models/User.model"
import { z } from "zod"

// Everything the settings page needs to show who will actually be emailed.
const buildSettingsPayload = async () => {
    const settings = await getNotificationSettings()
    const [{ recipients, usedFallback }, admins] = await Promise.all([
        resolveAdminRecipients(settings),
        UserModel.find({ role: 'admin', deletedAt: null }).select('name email').lean(),
    ])

    return {
        settings,
        events: ADMIN_EVENT_LIST,
        adminAccounts: admins.map((admin) => ({
            name: admin.name,
            email: admin.email,
            valid: isValidEmail(admin.email),
        })),
        storeInbox: process.env.NODEMAILER_EMAIL || null,
        smtpConfigured: Boolean(process.env.NODEMAILER_HOST && process.env.NODEMAILER_EMAIL && process.env.NODEMAILER_PASSWORD),
        recipients,
        usedFallback,
        maxExtraRecipients: MAX_EXTRA_RECIPIENTS,
    }
}

export async function GET(request) {
    try {
        const auth = await isAuthenticated('admin', request)
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        return response(true, 200, 'Settings fetched.', await buildSettingsPayload())
    } catch (error) {
        return catchError(error)
    }
}

const settingsSchema = z.object({
    includeAdminAccounts: z.boolean(),
    includeStoreInbox: z.boolean(),
    extraRecipients: z.array(z.string().trim().toLowerCase().email('One of the extra recipients is not a valid email.'))
        .max(MAX_EXTRA_RECIPIENTS, `You can add up to ${MAX_EXTRA_RECIPIENTS} extra recipients.`),
    emailEvents: z.record(z.boolean()),
})

export async function PUT(request) {
    try {
        const auth = await isAuthenticated('admin', request)
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json().catch(() => null)
        const validate = settingsSchema.safeParse(payload)
        if (!validate.success) {
            const message = validate.error.issues?.[0]?.message || 'Invalid settings.'
            return response(false, 400, message)
        }

        const { includeAdminAccounts, includeStoreInbox, extraRecipients } = validate.data

        // Only persist known event keys; unknown keys from a stale client are dropped.
        const emailEvents = {}
        for (const event of ADMIN_EVENT_LIST) {
            if (typeof validate.data.emailEvents[event.type] === 'boolean') {
                emailEvents[event.type] = validate.data.emailEvents[event.type]
            }
        }

        await NotificationSettingModel.findOneAndUpdate(
            { key: 'default' },
            {
                $set: {
                    includeAdminAccounts,
                    includeStoreInbox,
                    extraRecipients: [...new Set(extraRecipients)],
                    emailEvents,
                },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        )

        return response(true, 200, 'Notification settings saved.', await buildSettingsPayload())
    } catch (error) {
        return catchError(error)
    }
}

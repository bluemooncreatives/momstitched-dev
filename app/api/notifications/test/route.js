import { adminAlert } from "@/email/adminAlert"
import { ADMIN_EVENT } from "@/lib/adminNotificationEvents"
import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { adminUrl, notifyAdmins } from "@/lib/services/notificationService"
import UserModel from "@/models/User.model"
import { ADMIN_NOTIFICATIONS } from "@/routes/AdminPanelRoute"

// Admin: send a real notification + email through the full pipeline, so the
// SMTP setup and recipient list can be verified from the panel.
export async function POST(request) {
    try {
        const auth = await isAuthenticated('admin', request)
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const admin = await UserModel.findById(auth.userId).select('name').lean()
        const sentBy = admin?.name || 'An admin'

        const result = await notifyAdmins({
            type: ADMIN_EVENT.SYSTEM_TEST,
            title: 'Test notification',
            message: `${sentBy} sent a test from Notification Settings.`,
            link: ADMIN_NOTIFICATIONS,
            forceEmail: true,
            email: {
                subject: 'MomStitched admin notifications are working',
                html: adminAlert({
                    label: 'Test',
                    title: 'Admin emails are working',
                    intro: `${sentBy} sent this test from Notification Settings. If you can read it, order and alert emails will reach this inbox.`,
                    ctaLabel: 'Open notifications',
                    ctaUrl: adminUrl(ADMIN_NOTIFICATIONS),
                }),
            },
        })

        if (!result.notification) {
            return response(false, 500, result.email.error || 'Could not create the test notification.')
        }
        if (result.email.status !== 'sent') {
            return response(false, 502, `The in-app notification was created, but the email failed: ${result.email.error || 'unknown error'}`, result.email)
        }

        return response(true, 200, `Test email sent to ${result.email.recipients.join(', ')}.`, result.email)
    } catch (error) {
        return catchError(error)
    }
}

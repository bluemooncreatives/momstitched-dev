import { connectDB } from "@/lib/databaseConnection"
import { sendMail } from "@/lib/sendMail"
import { ADMIN_EVENT, ADMIN_EVENT_LIST, defaultEmailEvents } from "@/lib/adminNotificationEvents"
import { adminAlert } from "@/email/adminAlert"
import { ADMIN_CUSTOMERS_SHOW } from "@/routes/AdminPanelRoute"
import NotificationModel from "@/models/Notification.model"
import NotificationSettingModel from "@/models/NotificationSetting.model"
import UserModel from "@/models/User.model"

export const MAX_EXTRA_RECIPIENTS = 10
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const isValidEmail = (value) => EMAIL_PATTERN.test(String(value || '').trim())

const normalizeEmail = (value) => String(value || '').trim().toLowerCase()

/** Absolute URL for an admin panel path, for use inside emails. */
export const adminUrl = (path = '') => {
    const base = String(process.env.NEXT_PUBLIC_BASE_URL || 'https://www.momstitched.com').replace(/\/+$/, '')
    return `${base}${path}`
}

/**
 * Load the settings singleton merged over defaults. Never returns a partial
 * object: events added after the settings were saved pick up their default.
 */
export const getNotificationSettings = async () => {
    await connectDB()
    const stored = await NotificationSettingModel.findOne({ key: 'default' }).lean()

    const storedEvents = stored?.emailEvents || {}
    const emailEvents = defaultEmailEvents()
    for (const event of ADMIN_EVENT_LIST) {
        if (typeof storedEvents[event.type] === 'boolean') {
            emailEvents[event.type] = storedEvents[event.type]
        }
    }

    return {
        includeAdminAccounts: stored?.includeAdminAccounts ?? true,
        includeStoreInbox: stored?.includeStoreInbox ?? true,
        extraRecipients: Array.isArray(stored?.extraRecipients) ? stored.extraRecipients : [],
        emailEvents,
        updatedAt: stored?.updatedAt || null,
    }
}

/**
 * Resolve the de-duplicated list of addresses that receive admin emails.
 * If the settings leave nobody (e.g. both toggles off and no extras, or no
 * admin account has a valid email) the store inbox is used as a last resort so
 * an order alert is never silently addressed to no one.
 */
export const resolveAdminRecipients = async (settings) => {
    const resolvedSettings = settings || await getNotificationSettings()
    const storeInbox = normalizeEmail(process.env.NODEMAILER_EMAIL)
    const recipients = new Set()

    if (resolvedSettings.includeAdminAccounts) {
        const admins = await UserModel.find({ role: 'admin', deletedAt: null }).select('email').lean()
        admins.forEach((admin) => {
            if (isValidEmail(admin.email)) recipients.add(normalizeEmail(admin.email))
        })
    }

    if (resolvedSettings.includeStoreInbox && isValidEmail(storeInbox)) {
        recipients.add(storeInbox)
    }

    resolvedSettings.extraRecipients.forEach((email) => {
        if (isValidEmail(email)) recipients.add(normalizeEmail(email))
    })

    let usedFallback = false
    if (!recipients.size && isValidEmail(storeInbox)) {
        recipients.add(storeInbox)
        usedFallback = true
    }

    return { recipients: [...recipients], usedFallback }
}

/**
 * Record an admin notification and, if that event type has email enabled,
 * email the admin team. Best-effort by design: it NEVER throws, because every
 * caller (checkout, contact form, signup, cron) has already done its real work
 * and must not fail because of a notification problem.
 *
 * `dedupeKey` makes the call idempotent — a retried request (double-clicked
 * checkout, re-run cron) records one notification and sends one email.
 *
 * @param {object} input
 * @param {string} input.type          One of ADMIN_EVENT
 * @param {string} input.title
 * @param {string} [input.message]
 * @param {string} [input.link]        Admin panel path
 * @param {object} [input.meta]
 * @param {string} [input.dedupeKey]
 * @param {object} [input.email]       { subject, html, replyTo } — omit for in-app only
 * @param {boolean} [input.forceEmail] Bypass the per-event toggle (test emails)
 * @returns {Promise<{ notification: object|null, email: object, duplicate?: boolean }>}
 */
export const notifyAdmins = async ({ type, title, message = '', link = '', meta = {}, dedupeKey, email, forceEmail = false }) => {
    const emailResult = { status: 'none', recipients: [], error: null, sentAt: null }

    try {
        await connectDB()

        let notification
        try {
            notification = await NotificationModel.create({
                type,
                title,
                message,
                link,
                meta,
                ...(dedupeKey ? { dedupeKey } : {}),
            })
        } catch (error) {
            if (error?.code === 11000 && dedupeKey) {
                return { notification: null, email: emailResult, duplicate: true }
            }
            throw error
        }

        if (email?.subject && email?.html) {
            const settings = await getNotificationSettings()
            const enabled = forceEmail || settings.emailEvents[type] !== false

            if (!enabled) {
                emailResult.status = 'disabled'
            } else {
                const { recipients } = await resolveAdminRecipients(settings)
                emailResult.recipients = recipients

                if (!recipients.length) {
                    emailResult.status = 'failed'
                    emailResult.error = 'No admin email recipients are configured.'
                } else {
                    const sent = await sendMail(email.subject, recipients, email.html, email.replyTo ? { replyTo: email.replyTo } : {})
                    emailResult.status = sent.success ? 'sent' : 'failed'
                    emailResult.error = sent.success ? null : (sent.message || 'Failed to send email.')
                    emailResult.sentAt = sent.success ? new Date() : null
                }
            }

            await NotificationModel.updateOne({ _id: notification._id }, { $set: { email: emailResult } })
        }

        return { notification, email: emailResult }
    } catch (error) {
        console.error(`notifyAdmins(${type}) failed:`, error?.message || error)
        return { notification: null, email: { ...emailResult, status: 'failed', error: error?.message || 'Notification failed.' } }
    }
}

/** Shared "new customer" notification for email and Google signups. */
export const notifyCustomerRegistered = ({ userId, name, email, provider }) => notifyAdmins({
    type: ADMIN_EVENT.CUSTOMER_REGISTERED,
    dedupeKey: `${ADMIN_EVENT.CUSTOMER_REGISTERED}:${userId}`,
    title: `New customer: ${name}`,
    message: `${email} signed up with ${provider === 'google' ? 'Google' : 'email & password'}.`,
    link: ADMIN_CUSTOMERS_SHOW,
    meta: { userId: String(userId), email, provider },
    email: {
        subject: `New customer signup — ${name}`,
        html: adminAlert({
            label: 'New Customer',
            title: `${name} just joined`,
            intro: 'A new customer account was created on MomStitched.',
            rows: [
                { label: 'Name', value: name },
                { label: 'Email', value: email },
                { label: 'Signed up with', value: provider === 'google' ? 'Google' : 'Email & password' },
            ],
            ctaLabel: 'View customers',
            ctaUrl: adminUrl(ADMIN_CUSTOMERS_SHOW),
        }),
    },
})

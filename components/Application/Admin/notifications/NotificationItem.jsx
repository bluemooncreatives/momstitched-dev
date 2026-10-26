'use client'
import { ADMIN_EVENT, ADMIN_EVENT_LABEL } from '@/lib/adminNotificationEvents'
import { cn } from '@/lib/utils'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import {
    Bell,
    FlaskConical,
    MailCheck,
    MailWarning,
    MessageSquare,
    PackageCheck,
    RefreshCwOff,
    ShoppingBag,
    Star,
    TriangleAlert,
    UserPlus,
} from 'lucide-react'

dayjs.extend(relativeTime)

export const NOTIFICATION_ICON = {
    [ADMIN_EVENT.ORDER_PLACED]: { icon: ShoppingBag, className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
    [ADMIN_EVENT.CONTACT_RECEIVED]: { icon: MessageSquare, className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    [ADMIN_EVENT.REVIEW_RECEIVED]: { icon: Star, className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
    [ADMIN_EVENT.CUSTOMER_REGISTERED]: { icon: UserPlus, className: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' },
    [ADMIN_EVENT.SHIPMENT_DELIVERED]: { icon: PackageCheck, className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
    [ADMIN_EVENT.SHIPMENT_ISSUE]: { icon: TriangleAlert, className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
    [ADMIN_EVENT.SHIPMENT_SYNC_FAILED]: { icon: RefreshCwOff, className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
    [ADMIN_EVENT.SYSTEM_TEST]: { icon: FlaskConical, className: 'bg-muted text-muted-foreground' },
}

export const formatNotificationTime = (date) => {
    const value = dayjs(date)
    return dayjs().diff(value, 'day') >= 7 ? value.format('DD MMM YYYY, hh:mm A') : value.fromNow()
}

/** Small status line for the email copy of a notification. */
export const EmailStatus = ({ email, className }) => {
    if (!email || email.status === 'none' || email.status === 'disabled') return null

    if (email.status === 'sent') {
        const count = email.recipients?.length || 0
        return (
            <span className={cn('inline-flex items-center gap-1 text-muted-foreground', className)} title={email.recipients?.join(', ')}>
                <MailCheck className="size-3" />
                Emailed {count} recipient{count === 1 ? '' : 's'}
            </span>
        )
    }

    return (
        <span className={cn('inline-flex items-center gap-1 text-red-600 dark:text-red-400', className)} title={email.error || ''}>
            <MailWarning className="size-3" />
            Email failed
        </span>
    )
}

const NotificationItem = ({ notification, onSelect, compact = false, actions, leading }) => {
    const { icon: Icon, className: iconClass } = NOTIFICATION_ICON[notification.type] || { icon: Bell, className: 'bg-muted text-muted-foreground' }
    const unread = !notification.isRead

    return (
        <div
            className={cn(
                'group relative flex gap-3 rounded-md px-3 py-3 transition-colors',
                unread ? 'bg-primary/[0.04]' : '',
                onSelect ? 'cursor-pointer hover:bg-muted/60' : ''
            )}
            role={onSelect ? 'button' : undefined}
            tabIndex={onSelect ? 0 : undefined}
            onClick={onSelect ? () => onSelect(notification) : undefined}
            onKeyDown={onSelect ? (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onSelect(notification)
                }
            } : undefined}
        >
            {leading}
            <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-full', iconClass)}>
                <Icon className="size-4" />
            </span>

            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                    <p className={cn('text-sm leading-5', unread ? 'font-semibold' : 'font-medium text-foreground/80')}>
                        {notification.title}
                    </p>
                    {unread && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[var(--dark-red,#8E1616)]" aria-label="Unread" />}
                </div>
                {notification.message && (
                    <p className={cn('mt-0.5 text-sm text-muted-foreground break-words', compact ? 'line-clamp-2' : 'line-clamp-3')}>
                        {notification.message}
                    </p>
                )}
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <time dateTime={notification.createdAt} title={dayjs(notification.createdAt).format('DD MMM YYYY, hh:mm A')}>
                        {formatNotificationTime(notification.createdAt)}
                    </time>
                    {!compact && <span>{ADMIN_EVENT_LABEL[notification.type] || 'Notification'}</span>}
                    <EmailStatus email={notification.email} />
                </div>
            </div>

            {actions}
        </div>
    )
}

export default NotificationItem

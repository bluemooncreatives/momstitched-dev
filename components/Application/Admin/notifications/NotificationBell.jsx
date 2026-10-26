'use client'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { useNotificationActions, useNotificationBell } from '@/hooks/useAdminNotifications'
import { ADMIN_NOTIFICATION_SETTINGS, ADMIN_NOTIFICATIONS } from '@/routes/AdminPanelRoute'
import { Bell, CheckCheck, Settings } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import NotificationItem from './NotificationItem'

const MAX_TOASTS = 3

const NotificationBell = () => {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const { data, isPending, isError, error, refetch } = useNotificationBell()
    const { markRead, markAllRead, isMarking } = useNotificationActions()

    const items = data?.items || []
    const unreadCount = data?.unreadCount || 0
    const sessionExpired = [401, 403].includes(error?.statusCode)

    // Toast events that arrive while the panel is open. The first load only
    // records a baseline so existing notifications never toast on page load.
    // ObjectIds are fixed-length hex with a leading timestamp, so string
    // comparison orders them by creation time.
    const newestSeenRef = useRef(null)
    useEffect(() => {
        if (!data?.items) return
        const newestId = data.items[0]?._id || ''

        if (newestSeenRef.current === null) {
            newestSeenRef.current = newestId
            return
        }

        const fresh = data.items.filter((item) => item._id > newestSeenRef.current && !item.isRead)
        if (newestId > newestSeenRef.current) newestSeenRef.current = newestId
        if (!fresh.length || open) return

        if (fresh.length > MAX_TOASTS) {
            toast.info(`${fresh.length} new notifications`, {
                action: { label: 'View', onClick: () => router.push(ADMIN_NOTIFICATIONS) },
            })
            return
        }

        fresh.forEach((item) => {
            toast.info(item.title, {
                description: item.message || undefined,
                action: item.link
                    ? { label: 'Open', onClick: () => { markRead([item._id]); router.push(item.link) } }
                    : undefined,
            })
        })
    }, [data, open, router, markRead])

    const handleSelect = (notification) => {
        if (!notification.isRead) markRead([notification._id])
        setOpen(false)
        if (notification.link) router.push(notification.link)
    }

    const badge = unreadCount > 99 ? '99+' : unreadCount

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'}
                >
                    <Bell className="size-4" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--dark-red,#8E1616)] px-1 text-[10px] font-semibold leading-none text-white">
                            {badge}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent align="end" className="w-[min(24rem,calc(100vw-2rem))] p-0">
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <div>
                        <p className="text-sm font-semibold">Notifications</p>
                        <p className="text-xs text-muted-foreground">
                            {unreadCount ? `${unreadCount} unread` : 'All caught up'}
                        </p>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1.5 text-xs"
                            disabled={!unreadCount || isMarking}
                            onClick={() => markAllRead()}
                        >
                            <CheckCheck className="size-3.5" />
                            Mark all read
                        </Button>
                        <Button variant="ghost" size="icon" className="size-8" asChild>
                            <Link href={ADMIN_NOTIFICATION_SETTINGS} aria-label="Notification settings" onClick={() => setOpen(false)}>
                                <Settings className="size-3.5" />
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="max-h-[min(28rem,60vh)] overflow-y-auto p-1">
                    {isPending && (
                        <div className="space-y-1 p-2">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <div key={index} className="flex gap-3 p-2">
                                    <Skeleton className="size-8 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-3.5 w-3/4" />
                                        <Skeleton className="h-3 w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {isError && !items.length && (
                        <div className="px-4 py-8 text-center text-sm">
                            <p className="text-muted-foreground">
                                {sessionExpired ? 'Your session has expired. Please sign in again.' : "Couldn't load notifications."}
                            </p>
                            {!sessionExpired && (
                                <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
                                    Try again
                                </Button>
                            )}
                        </div>
                    )}

                    {!isPending && !isError && !items.length && (
                        <div className="px-4 py-10 text-center">
                            <Bell className="mx-auto mb-2 size-6 text-muted-foreground/60" />
                            <p className="text-sm font-medium">No notifications yet</p>
                            <p className="mt-1 text-xs text-muted-foreground">New orders, messages and alerts will show up here.</p>
                        </div>
                    )}

                    {items.map((notification) => (
                        <NotificationItem
                            key={notification._id}
                            notification={notification}
                            onSelect={handleSelect}
                            compact
                        />
                    ))}
                </div>

                <div className="border-t p-2">
                    <Button variant="ghost" size="sm" className="w-full" asChild>
                        <Link href={ADMIN_NOTIFICATIONS} onClick={() => setOpen(false)}>View all notifications</Link>
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}

export default NotificationBell

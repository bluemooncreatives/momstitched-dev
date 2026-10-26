'use client'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import PageHeader from '@/components/Application/Admin/PageHeader'
import NotificationItem from '@/components/Application/Admin/notifications/NotificationItem'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useNotificationActions, useNotificationFeed } from '@/hooks/useAdminNotifications'
import { ADMIN_EVENT_LIST } from '@/lib/adminNotificationEvents'
import { ADMIN_DASHBOARD, ADMIN_NOTIFICATION_SETTINGS } from '@/routes/AdminPanelRoute'
import { BellOff, CheckCheck, ExternalLink, Loader2, Mail, MailOpen, MoreHorizontal, Settings, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: '', label: 'Notifications' },
]

const NotificationsPage = () => {
    const router = useRouter()
    const [status, setStatus] = useState('all')
    const [type, setType] = useState('all')
    const [selected, setSelected] = useState(() => new Set())

    const { data, isPending, isError, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useNotificationFeed({ status, type })
    const { markRead, markUnread, markAllRead, remove, clearRead, isMarking, isDeleting } = useNotificationActions()

    const items = useMemo(() => data?.pages.flatMap((page) => page.items) || [], [data])
    const unreadCount = data?.pages[0]?.unreadCount || 0
    const sessionExpired = [401, 403].includes(error?.statusCode)

    // Drop selections that are no longer on screen (deleted, filtered out, or
    // removed by another admin) so bulk actions never target stale ids.
    useEffect(() => {
        setSelected((current) => {
            if (!current.size) return current
            const visible = new Set(items.map((item) => item._id))
            const next = new Set([...current].filter((id) => visible.has(id)))
            return next.size === current.size ? current : next
        })
    }, [items])

    useEffect(() => {
        setSelected(new Set())
    }, [status, type])

    const selectedIds = [...selected]
    const allSelected = items.length > 0 && selected.size === items.length

    const toggle = (id, checked) => {
        setSelected((current) => {
            const next = new Set(current)
            if (checked) next.add(id)
            else next.delete(id)
            return next
        })
    }

    const toggleAll = (checked) => {
        setSelected(checked ? new Set(items.map((item) => item._id)) : new Set())
    }

    const handleOpen = (notification) => {
        if (!notification.isRead) markRead([notification._id])
        if (notification.link) router.push(notification.link)
    }

    const handleDelete = (ids) => {
        if (!ids.length) return
        if (!confirm(`Delete ${ids.length} notification${ids.length === 1 ? '' : 's'}? This cannot be undone and removes ${ids.length === 1 ? 'it' : 'them'} for every admin.`)) return
        remove(ids, { onSuccess: () => setSelected(new Set()) })
    }

    const handleClearRead = () => {
        if (!confirm('Delete every notification you have already read? This cannot be undone.')) return
        clearRead({ onSuccess: () => setSelected(new Set()) })
    }

    const emptyMessage = status === 'unread'
        ? 'No unread notifications. You’re all caught up.'
        : type !== 'all'
            ? 'No notifications of this type yet.'
            : 'No notifications yet. New orders, messages and alerts will appear here.'

    return (
        <div className="flex flex-col gap-4 sm:gap-6">
            <PageHeader
                title="Notifications"
                description="Everything that needs your attention across the store, in one place."
                breadcrumb={<BreadCrumb breadcrumbData={breadcrumbData} />}
                actions={
                    <>
                        <Button variant="outline" size="sm" disabled={!unreadCount || isMarking} onClick={() => markAllRead()}>
                            <CheckCheck className="size-4" />
                            Mark all read
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={ADMIN_NOTIFICATION_SETTINGS}>
                                <Settings className="size-4" />
                                Settings
                            </Link>
                        </Button>
                    </>
                }
            />

            <div className="rounded-md bg-card">
                {/* Filters */}
                <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
                    <Tabs value={status} onValueChange={setStatus}>
                        <TabsList>
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="unread">
                                Unread{unreadCount ? ` (${unreadCount > 99 ? '99+' : unreadCount})` : ''}
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="flex items-center gap-2">
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger className="w-full sm:w-56" aria-label="Filter by type">
                                <SelectValue placeholder="All types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All types</SelectItem>
                                {ADMIN_EVENT_LIST.map((event) => (
                                    <SelectItem key={event.type} value={event.type}>{event.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button variant="ghost" size="sm" className="shrink-0" onClick={handleClearRead} disabled={isDeleting}>
                            <Trash2 className="size-4" />
                            <span className="hidden sm:inline">Clear read</span>
                        </Button>
                    </div>
                </div>

                {/* Bulk action bar */}
                {items.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 border-b px-4 py-2 text-sm">
                        <label className="flex cursor-pointer items-center gap-2">
                            <Checkbox checked={allSelected} onCheckedChange={(checked) => toggleAll(checked === true)} aria-label="Select all" />
                            <span className="text-muted-foreground">
                                {selected.size ? `${selected.size} selected` : 'Select all'}
                            </span>
                        </label>
                        {selected.size > 0 && (
                            <div className="ms-auto flex flex-wrap items-center gap-1">
                                <Button variant="ghost" size="sm" disabled={isMarking} onClick={() => { markRead(selectedIds); setSelected(new Set()) }}>
                                    <MailOpen className="size-4" />
                                    Mark read
                                </Button>
                                <Button variant="ghost" size="sm" disabled={isMarking} onClick={() => { markUnread(selectedIds); setSelected(new Set()) }}>
                                    <Mail className="size-4" />
                                    Mark unread
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" disabled={isDeleting} onClick={() => handleDelete(selectedIds)}>
                                    <Trash2 className="size-4" />
                                    Delete
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {/* List */}
                <div className="p-2">
                    {isPending && (
                        <div className="space-y-1">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <div key={index} className="flex gap-3 p-3">
                                    <Skeleton className="size-8 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-2/3" />
                                        <Skeleton className="h-3 w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {isError && !items.length && (
                        <div className="flex flex-col items-center gap-3 py-16 text-center">
                            <p className="text-sm text-muted-foreground">
                                {sessionExpired ? 'Your session has expired. Please sign in again.' : error?.message || "Couldn't load notifications."}
                            </p>
                            {!sessionExpired && <Button variant="outline" size="sm" onClick={() => refetch()}>Try again</Button>}
                        </div>
                    )}

                    {!isPending && !isError && !items.length && (
                        <div className="flex flex-col items-center gap-2 py-16 text-center">
                            <BellOff className="size-8 text-muted-foreground/60" />
                            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
                        </div>
                    )}

                    <div className="divide-y">
                        {items.map((notification) => (
                            <NotificationItem
                                key={notification._id}
                                notification={notification}
                                onSelect={notification.link ? handleOpen : undefined}
                                leading={
                                    <span className="flex items-start pt-2" onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
                                        <Checkbox
                                            checked={selected.has(notification._id)}
                                            onCheckedChange={(checked) => toggle(notification._id, checked === true)}
                                            aria-label={`Select ${notification.title}`}
                                        />
                                    </span>
                                }
                                actions={
                                    <div onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
                                        <DropdownMenu modal={false}>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="size-8" aria-label="Notification actions">
                                                    <MoreHorizontal className="size-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {notification.link && (
                                                    <DropdownMenuItem onClick={() => handleOpen(notification)}>
                                                        <ExternalLink className="size-4" />
                                                        Open
                                                    </DropdownMenuItem>
                                                )}
                                                {notification.isRead ? (
                                                    <DropdownMenuItem onClick={() => markUnread([notification._id])}>
                                                        <Mail className="size-4" />
                                                        Mark as unread
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem onClick={() => markRead([notification._id])}>
                                                        <MailOpen className="size-4" />
                                                        Mark as read
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-red-600 focus:text-red-700" onClick={() => handleDelete([notification._id])}>
                                                    <Trash2 className="size-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                }
                            />
                        ))}
                    </div>

                    {hasNextPage && (
                        <div className="flex justify-center p-4">
                            <Button variant="outline" size="sm" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                                {isFetchingNextPage && <Loader2 className="size-4 animate-spin" />}
                                Load more
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default NotificationsPage

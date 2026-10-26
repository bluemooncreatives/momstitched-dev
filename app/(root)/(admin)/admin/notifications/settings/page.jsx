'use client'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import ButtonLoading from '@/components/Application/ButtonLoading'
import PageHeader from '@/components/Application/Admin/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { NOTIFICATION_QUERY_KEY } from '@/hooks/useAdminNotifications'
import { ADMIN_EVENT } from '@/lib/adminNotificationEvents'
import { showToast } from '@/lib/showToast'
import { ADMIN_DASHBOARD, ADMIN_NOTIFICATIONS } from '@/routes/AdminPanelRoute'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { AlertTriangle, Info, Mail, Plus, Send, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: ADMIN_NOTIFICATIONS, label: 'Notifications' },
    { href: '', label: 'Settings' },
]

const SETTINGS_QUERY_KEY = [...NOTIFICATION_QUERY_KEY, 'settings']
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const request = async (config) => {
    const { data: response } = await axios(config)
    if (!response.success) throw new Error(response.message || 'Request failed.')
    return response
}

const toForm = (settings) => ({
    includeAdminAccounts: settings.includeAdminAccounts,
    includeStoreInbox: settings.includeStoreInbox,
    extraRecipients: [...settings.extraRecipients],
    emailEvents: { ...settings.emailEvents },
})

const Section = ({ title, description, children }) => (
    <section className="rounded-md bg-card p-4 sm:p-6">
        <div className="mb-4">
            <h3 className="text-base font-semibold">{title}</h3>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {children}
    </section>
)

const Notice = ({ tone = 'info', children }) => {
    const Icon = tone === 'warning' ? AlertTriangle : Info
    return (
        <div className={tone === 'warning'
            ? 'flex gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200'
            : 'flex gap-2 rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground'}
        >
            <Icon className="mt-0.5 size-4 shrink-0" />
            <div>{children}</div>
        </div>
    )
}

const NotificationSettingsPage = () => {
    const queryClient = useQueryClient()
    const [form, setForm] = useState(null)
    const [newRecipient, setNewRecipient] = useState('')
    const [recipientError, setRecipientError] = useState('')

    const { data, isPending, isError, error, refetch } = useQuery({
        queryKey: SETTINGS_QUERY_KEY,
        queryFn: async () => (await request({ url: '/api/notifications/settings', method: 'GET' })).data,
        staleTime: 0,
    })

    // Seed the form from the server once; later refetches must not wipe edits.
    useEffect(() => {
        if (data && !form) setForm(toForm(data.settings))
    }, [data, form])

    const saved = data ? toForm(data.settings) : null
    const isDirty = Boolean(form && saved && JSON.stringify(form) !== JSON.stringify(saved))

    // Warn before leaving the page with unsaved changes.
    useEffect(() => {
        if (!isDirty) return
        const handler = (event) => {
            event.preventDefault()
            event.returnValue = ''
        }
        window.addEventListener('beforeunload', handler)
        return () => window.removeEventListener('beforeunload', handler)
    }, [isDirty])

    const saveMutation = useMutation({
        mutationFn: (values) => request({ url: '/api/notifications/settings', method: 'PUT', data: values }),
        onSuccess: (response) => {
            queryClient.setQueryData(SETTINGS_QUERY_KEY, response.data)
            setForm(toForm(response.data.settings))
            showToast('success', response.message)
        },
        onError: (err) => showToast('error', err.message),
    })

    const testMutation = useMutation({
        mutationFn: () => request({ url: '/api/notifications/test', method: 'POST' }),
        onSuccess: (response) => showToast('success', response.message),
        onError: (err) => showToast('error', err.message),
        // The test also creates an in-app notification; refresh the bell.
        onSettled: () => queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEY, predicate: (query) => query.queryKey[1] !== 'settings' }),
    })

    // Live preview of who will be emailed, mirroring resolveAdminRecipients().
    const preview = useMemo(() => {
        if (!form || !data) return { recipients: [], usedFallback: false }
        const list = new Set()
        if (form.includeAdminAccounts) {
            data.adminAccounts.forEach((admin) => { if (admin.valid) list.add(admin.email.toLowerCase()) })
        }
        if (form.includeStoreInbox && data.storeInbox) list.add(data.storeInbox.toLowerCase())
        form.extraRecipients.forEach((email) => list.add(email))
        if (!list.size && data.storeInbox) return { recipients: [data.storeInbox.toLowerCase()], usedFallback: true }
        return { recipients: [...list], usedFallback: false }
    }, [form, data])

    const enabledEventCount = form ? Object.values(form.emailEvents).filter(Boolean).length : 0

    const addRecipient = () => {
        const email = newRecipient.trim().toLowerCase()
        if (!email) return
        if (!EMAIL_PATTERN.test(email)) {
            setRecipientError('Enter a valid email address.')
            return
        }
        if (form.extraRecipients.includes(email)) {
            setRecipientError('This email is already in the list.')
            return
        }
        if (form.extraRecipients.length >= data.maxExtraRecipients) {
            setRecipientError(`You can add up to ${data.maxExtraRecipients} extra recipients.`)
            return
        }
        setForm({ ...form, extraRecipients: [...form.extraRecipients, email] })
        setNewRecipient('')
        setRecipientError('')
    }

    const removeRecipient = (email) => {
        setForm({ ...form, extraRecipients: form.extraRecipients.filter((item) => item !== email) })
    }

    const setEvent = (eventType, checked) => {
        setForm({ ...form, emailEvents: { ...form.emailEvents, [eventType]: checked } })
    }

    const setAllEvents = (checked) => {
        setForm({
            ...form,
            emailEvents: Object.fromEntries(data.events.map((event) => [event.type, checked])),
        })
    }

    return (
        <div className="flex flex-col gap-4 sm:gap-6">
            <PageHeader
                title="Notification Settings"
                description="Choose which events email the admin team, and who receives them. Every event always appears in the notification bell."
                breadcrumb={<BreadCrumb breadcrumbData={breadcrumbData} />}
            />

            {isPending && (
                <div className="space-y-4">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-72 w-full" />
                </div>
            )}

            {isError && (
                <div className="flex flex-col items-center gap-3 rounded-md bg-card py-16 text-center">
                    <p className="text-sm text-muted-foreground">{error?.message || "Couldn't load notification settings."}</p>
                    <Button variant="outline" size="sm" onClick={() => refetch()}>Try again</Button>
                </div>
            )}

            {data && form && (
                <>
                    {!data.smtpConfigured && (
                        <Notice tone="warning">
                            Email is not configured on the server (NODEMAILER_HOST / NODEMAILER_EMAIL / NODEMAILER_PASSWORD).
                            Notifications will still appear in the panel, but no emails can be sent until it is set up.
                        </Notice>
                    )}

                    <Section title="Recipients" description="Admin emails go to everyone selected here.">
                        <div className="space-y-4">
                            <label className="flex cursor-pointer items-start gap-3">
                                <Checkbox
                                    className="mt-0.5"
                                    checked={form.includeAdminAccounts}
                                    onCheckedChange={(checked) => setForm({ ...form, includeAdminAccounts: checked === true })}
                                />
                                <div className="min-w-0">
                                    <p className="text-sm font-medium">All admin accounts</p>
                                    <p className="text-sm text-muted-foreground">
                                        Updates automatically when admin accounts are added or removed.
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                        {data.adminAccounts.length ? data.adminAccounts.map((admin) => (
                                            <Badge key={admin.email} variant="secondary" className={admin.valid ? '' : 'line-through opacity-60'} title={admin.valid ? admin.name : 'Invalid email, skipped'}>
                                                {admin.email}
                                            </Badge>
                                        )) : <span className="text-xs text-muted-foreground">No admin accounts found.</span>}
                                    </div>
                                </div>
                            </label>

                            <label className="flex cursor-pointer items-start gap-3">
                                <Checkbox
                                    className="mt-0.5"
                                    checked={form.includeStoreInbox}
                                    disabled={!data.storeInbox}
                                    onCheckedChange={(checked) => setForm({ ...form, includeStoreInbox: checked === true })}
                                />
                                <div className="min-w-0">
                                    <p className="text-sm font-medium">Store inbox</p>
                                    <p className="text-sm text-muted-foreground break-all">
                                        {data.storeInbox || 'Not configured (NODEMAILER_EMAIL is empty).'}
                                    </p>
                                </div>
                            </label>

                            <div>
                                <p className="text-sm font-medium">Extra recipients</p>
                                <p className="mb-2 text-sm text-muted-foreground">
                                    Anyone else who should get admin emails, e.g. a fulfilment partner. Up to {data.maxExtraRecipients}.
                                </p>
                                <div className="flex flex-col gap-2 sm:flex-row">
                                    <Input
                                        type="email"
                                        placeholder="name@example.com"
                                        value={newRecipient}
                                        aria-invalid={Boolean(recipientError)}
                                        onChange={(event) => { setNewRecipient(event.target.value); setRecipientError('') }}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter') {
                                                event.preventDefault()
                                                addRecipient()
                                            }
                                        }}
                                        className="sm:max-w-sm"
                                    />
                                    <Button type="button" variant="outline" onClick={addRecipient} disabled={!newRecipient.trim()}>
                                        <Plus className="size-4" />
                                        Add
                                    </Button>
                                </div>
                                {recipientError && <p className="mt-1.5 text-sm text-red-600">{recipientError}</p>}
                                {form.extraRecipients.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                        {form.extraRecipients.map((email) => (
                                            <Badge key={email} variant="outline" className="gap-1 pr-1">
                                                {email}
                                                <button
                                                    type="button"
                                                    className="rounded-sm p-0.5 hover:bg-muted"
                                                    onClick={() => removeRecipient(email)}
                                                    aria-label={`Remove ${email}`}
                                                >
                                                    <X className="size-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="rounded-md border p-3">
                                <p className="mb-2 flex items-center gap-1.5 text-sm font-medium">
                                    <Mail className="size-4" />
                                    Emails will go to {preview.recipients.length} address{preview.recipients.length === 1 ? '' : 'es'}
                                </p>
                                {preview.recipients.length ? (
                                    <p className="text-sm text-muted-foreground break-all">{preview.recipients.join(', ')}</p>
                                ) : (
                                    <p className="text-sm text-red-600">Nobody. Admin emails will fail until a recipient is added.</p>
                                )}
                                {preview.usedFallback && (
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        No recipients are selected, so the store inbox is used as a fallback so order emails are never lost.
                                    </p>
                                )}
                            </div>
                        </div>
                    </Section>

                    <Section title="Email alerts" description="Pick which events also send an email. Unchecked events still show in the bell.">
                        <div className="mb-3 flex items-center justify-between gap-2 text-sm">
                            <span className="text-muted-foreground">{enabledEventCount} of {data.events.length} events send email</span>
                            <div className="flex gap-1">
                                <Button type="button" variant="ghost" size="sm" onClick={() => setAllEvents(true)}>Enable all</Button>
                                <Button type="button" variant="ghost" size="sm" onClick={() => setAllEvents(false)}>Disable all</Button>
                            </div>
                        </div>
                        <div className="divide-y rounded-md border">
                            {data.events.map((event) => (
                                <label key={event.type} className="flex cursor-pointer items-start gap-3 p-3 hover:bg-muted/40">
                                    <Checkbox
                                        className="mt-0.5"
                                        checked={Boolean(form.emailEvents[event.type])}
                                        onCheckedChange={(checked) => setEvent(event.type, checked === true)}
                                    />
                                    <div>
                                        <p className="text-sm font-medium">{event.label}</p>
                                        <p className="text-sm text-muted-foreground">{event.description}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                        {!form.emailEvents[ADMIN_EVENT.ORDER_PLACED] && (
                            <div className="mt-3">
                                <Notice tone="warning">New order emails are off. You will only see new orders in the admin panel.</Notice>
                            </div>
                        )}
                    </Section>

                    <div className="sticky bottom-0 z-10 flex flex-col gap-3 rounded-md border bg-card/95 p-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-muted-foreground">
                            {isDirty ? 'You have unsaved changes.' : 'All changes saved.'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => testMutation.mutate()}
                                disabled={isDirty || testMutation.isPending || !data.smtpConfigured}
                                title={isDirty ? 'Save your changes before sending a test' : undefined}
                            >
                                <Send className="size-4" />
                                {testMutation.isPending ? 'Sending…' : 'Send test email'}
                            </Button>
                            <Button type="button" variant="ghost" disabled={!isDirty || saveMutation.isPending} onClick={() => { setForm(saved); setRecipientError('') }}>
                                Discard
                            </Button>
                            <ButtonLoading
                                type="button"
                                text="Save settings"
                                loading={saveMutation.isPending}
                                disabled={!isDirty || saveMutation.isPending}
                                onClick={() => saveMutation.mutate(form)}
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default NotificationSettingsPage

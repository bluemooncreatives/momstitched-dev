'use client'
import UserPanelLayout from '@/components/Application/Website/UserPanelLayout'
import WebsiteBreadcrumb from '@/components/Application/Website/WebsiteBreadcrumb'
import OrderSummaryCard, { OrderSummaryCardSkeleton, formatINR } from '@/components/Application/Website/OrderSummaryCard'
import { USER_ORDERS, USER_PROFILE, WEBSITE_SHOP, WEBSITE_WISHLIST } from '@/routes/WebsiteRoute'
import Link from 'next/link'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, CheckCircle2, Circle, Heart, IndianRupee, MapPin, Package, PackageCheck, RotateCcw, ShoppingBag, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'

const breadCrumbData = {
    title: 'Dashboard',
    links: [{ label: 'Dashboard' }]
}

const CARD = 'rounded-[var(--radius)] border border-[var(--dark-red)]/20 bg-background'

const getGreeting = (date = new Date()) => {
    const hour = date.getHours()
    if (hour < 5) return 'Good evening'
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
}

const formatMemberSince = (value) => {
    const date = value ? new Date(value) : null
    if (!date || Number.isNaN(date.getTime())) return null
    return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

const fetchDashboard = async ({ signal }) => {
    const { data } = await axios.get('/api/dashboard/user', { signal })
    if (!data?.success) throw new Error(data?.message || 'Failed to load your dashboard.')
    return data.data
}

const StatCard = ({ icon: Icon, label, value, hint, loading }) => (
    <div className={`${CARD} flex items-center justify-between gap-4 p-5`}>
        <div className="min-w-0">
            <p className="text-sm font-medium text-foreground/60">{label}</p>
            {loading ? (
                <Skeleton className="mt-2 h-8 w-16" />
            ) : (
                <p className="mt-2 truncate text-2xl font-semibold text-[var(--brand-primary)] tabular-nums sm:text-3xl">{value}</p>
            )}
            {hint && <p className="mt-1 text-xs text-foreground/50">{hint}</p>}
        </div>
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--dark-red)] shadow-[var(--shadow-brand)]">
            <Icon className="size-5 text-white" />
        </div>
    </div>
)

const ProfileCompletionCard = ({ completion, loading }) => {
    const percent = completion?.percent ?? 0
    const missing = completion?.missing ?? []

    return (
        <div className={`${CARD} p-5`}>
            <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-[var(--brand-primary)]">Profile completion</h3>
                {loading ? <Skeleton className="h-5 w-10" /> : (
                    <span className="text-base font-semibold text-[var(--brand-primary)] tabular-nums">{percent}%</span>
                )}
            </div>
            {loading ? <Skeleton className="mt-3 h-2 w-full rounded-full" /> : (
                <Progress
                    value={percent}
                    aria-label="Profile completion"
                    className="mt-3 h-2 bg-[var(--brand-cream)]/60 [&>[data-slot=progress-indicator]]:bg-[var(--dark-red)]"
                />
            )}

            {loading ? (
                <div className="mt-4 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-32" />
                </div>
            ) : missing.length === 0 ? (
                <p className="mt-4 flex items-center gap-2 text-sm text-emerald-700">
                    <CheckCircle2 className="size-4" /> Your profile is complete.
                </p>
            ) : (
                <>
                    <ul className="mt-4 space-y-2">
                        {missing.map((item) => (
                            <li key={item.key} className="flex items-center gap-2 text-sm text-foreground/70">
                                <Circle className="size-3.5 text-foreground/30" /> {item.label}
                            </li>
                        ))}
                    </ul>
                    <Button asChild variant="link" className="mt-3 h-auto p-0 text-sm font-semibold text-[var(--dark-red)]">
                        <Link href={USER_PROFILE} className="inline-flex items-center gap-1">
                            Complete profile <ArrowRight className="size-3.5" />
                        </Link>
                    </Button>
                </>
            )}
        </div>
    )
}

const SavedAddressCard = ({ address, loading }) => (
    <div className={`${CARD} flex flex-col p-5`}>
        <div className="flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 text-base font-semibold text-[var(--brand-primary)]">
                <MapPin className="size-4" /> Saved address
            </h3>
            {!loading && address && (
                <Link href={USER_PROFILE} className="text-sm font-semibold text-[var(--dark-red)] underline-offset-4 hover:underline">
                    Edit
                </Link>
            )}
        </div>

        {loading ? (
            <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full max-w-[240px]" />
                <Skeleton className="h-4 w-40" />
            </div>
        ) : !address ? (
            <div className="mt-4 flex flex-1 flex-col items-start">
                <p className="text-sm text-foreground/60">
                    Save a default address to fill in checkout faster.
                </p>
                <Button asChild variant="brand-outline" className="mt-4 h-9 px-4 text-sm font-semibold">
                    <Link href={USER_PROFILE}>Add address</Link>
                </Button>
            </div>
        ) : (
            <address className="mt-4 space-y-0.5 text-sm not-italic leading-relaxed text-foreground/80">
                {address.name && <p className="font-semibold text-foreground">{address.name}</p>}
                {address.address && <p className="break-words">{address.address}</p>}
                {address.landmark && <p className="break-words text-foreground/60">Near {address.landmark}</p>}
                {(address.city || address.state || address.pincode) && (
                    <p>{[address.city, address.state].filter(Boolean).join(', ')}{address.pincode ? ` – ${address.pincode}` : ''}</p>
                )}
                {address.country && <p>{address.country}</p>}
                {address.phone && <p className="pt-1 text-foreground/60">Phone: {address.phone}</p>}
                {!address.isComplete && (
                    <p className="pt-2 text-xs font-medium text-amber-700">
                        Some address details are missing. <Link href={USER_PROFILE} className="underline underline-offset-2">Complete it</Link>
                    </p>
                )}
            </address>
        )}
    </div>
)

const MyAccount = () => {
    const { data, isPending, isError, isFetching, refetch } = useQuery({
        queryKey: ['user-dashboard'],
        queryFn: fetchDashboard,
        // Order status changes land here — refresh when the customer comes back.
        staleTime: 30 * 1000,
        refetchOnWindowFocus: true,
    })

    const loading = isPending
    const stats = data?.stats
    const recentOrders = data?.recentOrders ?? []
    const firstName = data?.user?.name?.trim().split(/\s+/)[0]
    const memberSince = formatMemberSince(data?.user?.memberSince)

    return (
        <div>
            <WebsiteBreadcrumb props={breadCrumbData} />
            <UserPanelLayout>
                <div className="space-y-6">

                    {/* Greeting */}
                    <div className={`${CARD} flex flex-col gap-4 bg-[var(--brand-warm-bg)]/30 p-5 sm:flex-row sm:items-center sm:justify-between`}>
                        <div className="min-w-0">
                            {loading ? (
                                <>
                                    <Skeleton className="h-7 w-56" />
                                    <Skeleton className="mt-2 h-4 w-40" />
                                </>
                            ) : (
                                <>
                                    <h2 className="truncate text-xl font-semibold text-[var(--brand-primary)] sm:text-2xl">
                                        {getGreeting()}{firstName ? `, ${firstName}` : ''}
                                    </h2>
                                    <p className="mt-1 text-sm text-foreground/60">
                                        {memberSince ? `Member since ${memberSince} · ` : ''}Here&apos;s what&apos;s happening with your orders.
                                    </p>
                                </>
                            )}
                        </div>
                        <div className="flex shrink-0 gap-2">
                            <Button asChild variant="brand-outline" className="h-9 flex-1 px-4 text-sm font-semibold sm:flex-none">
                                <Link href={WEBSITE_WISHLIST}><Heart className="size-4" /> Wishlist</Link>
                            </Button>
                            <Button asChild variant="brand" className="h-9 flex-1 px-4 text-sm font-semibold sm:flex-none">
                                <Link href={WEBSITE_SHOP}><ShoppingBag className="size-4" /> Shop</Link>
                            </Button>
                        </div>
                    </div>

                    {isError && !data ? (
                        <div className={`${CARD} flex flex-col items-center px-6 py-12 text-center`}>
                            <p className="text-lg font-semibold text-destructive">Couldn&apos;t load your dashboard</p>
                            <p className="mt-1 text-sm text-foreground/60">Please check your connection and try again.</p>
                            <Button type="button" variant="brand" className="mt-5 h-10 px-6" onClick={() => refetch()} disabled={isFetching}>
                                <RotateCcw className="size-4" /> Retry
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* Stats */}
                            <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 xl:grid-cols-4">
                                <StatCard icon={Package} label="Total orders" value={stats?.totalOrders ?? 0} loading={loading} />
                                <StatCard icon={Truck} label="Active" value={stats?.activeOrders ?? 0} hint="Placed, processing or shipped" loading={loading} />
                                <StatCard icon={PackageCheck} label="Delivered" value={stats?.deliveredOrders ?? 0} loading={loading} />
                                <StatCard icon={IndianRupee} label="Total spent" value={formatINR(stats?.totalSpent)} hint="Excludes cancelled orders" loading={loading} />
                            </div>

                            {/* Profile + address */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <ProfileCompletionCard completion={data?.profileCompletion} loading={loading} />
                                <SavedAddressCard address={data?.savedAddress} loading={loading} />
                            </div>

                            {/* Recent orders */}
                            <div className={CARD}>
                                <div className="flex items-center justify-between border-b border-[var(--dark-red)]/20 px-5 py-4">
                                    <h3 className="flex items-center gap-2 text-lg font-semibold text-[var(--brand-primary)]">
                                        <Package className="size-4" /> Recent orders
                                    </h3>
                                    {recentOrders.length > 0 && (
                                        <Button asChild variant="link" className="h-auto p-0 text-sm font-medium text-foreground/60 hover:text-[var(--brand-primary)] hover:no-underline">
                                            <Link href={USER_ORDERS} className="flex items-center gap-1">
                                                View all <ArrowRight className="size-3" />
                                            </Link>
                                        </Button>
                                    )}
                                </div>

                                {loading ? (
                                    <div className="divide-y divide-border/60">
                                        {Array.from({ length: 3 }).map((_, i) => <OrderSummaryCardSkeleton key={i} />)}
                                    </div>
                                ) : recentOrders.length === 0 ? (
                                    <div className="px-5 py-12 text-center">
                                        <p className="text-lg font-semibold text-[var(--brand-primary)]">No orders yet</p>
                                        <p className="mt-1 text-sm text-foreground/60">
                                            Start shopping and your orders will appear here.
                                        </p>
                                        <Button asChild variant="brand" className="mt-5 h-11 px-8 text-base font-semibold">
                                            <Link href={WEBSITE_SHOP}>Shop Now</Link>
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border/60">
                                        {recentOrders.map((order) => <OrderSummaryCard key={order._id} order={order} />)}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </UserPanelLayout>
        </div>
    )
}

export default MyAccount

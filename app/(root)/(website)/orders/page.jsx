'use client'
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Package, RotateCcw, Search, X } from 'lucide-react'
import UserPanelLayout from '@/components/Application/Website/UserPanelLayout'
import WebsiteBreadcrumb from '@/components/Application/Website/WebsiteBreadcrumb'
import OrderSummaryCard, { OrderSummaryCardSkeleton } from '@/components/Application/Website/OrderSummaryCard'
import ShopPagination from '@/components/Application/Website/ShopPagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import useDebounce from '@/hooks/useDebounce'
import { ORDER_TABS, ORDER_TAB_VALUES } from '@/lib/orderStatusGroups'
import { cn } from '@/lib/utils'
import { WEBSITE_SHOP } from '@/routes/WebsiteRoute'

const breadCrumbData = {
    title: 'Orders',
    links: [{ label: 'Orders' }]
}

const PAGE_SIZE = 10
const MAX_SEARCH_LENGTH = 80
const CARD = 'rounded-[var(--radius)] border border-[var(--dark-red)]/20 bg-background'

const toPositiveInt = (value, fallback) => {
    const n = parseInt(value, 10)
    return Number.isFinite(n) && n > 0 ? n : fallback
}

const fetchOrders = async ({ tab, q, page }, signal) => {
    const { data } = await axios.get('/api/user-order', { params: { tab, q, page, limit: PAGE_SIZE }, signal })
    if (!data?.success) throw new Error(data?.message || 'Failed to load orders.')
    return data.data
}

const EmptyState = ({ title, description, action }) => (
    <div className="px-5 py-16 text-center">
        <p className="text-lg font-semibold text-[var(--brand-primary)]">{title}</p>
        <p className="mx-auto mt-2 max-w-xs text-sm text-foreground/60">{description}</p>
        {action && <div className="mt-6">{action}</div>}
    </div>
)

const OrdersContent = () => {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // The URL is the source of truth so refresh / shared links keep the view.
    const rawTab = searchParams.get('tab')
    const tab = ORDER_TAB_VALUES.includes(rawTab) ? rawTab : 'all'
    const q = (searchParams.get('q') || '').trim().slice(0, MAX_SEARCH_LENGTH)
    const page = toPositiveInt(searchParams.get('page'), 1)

    const [searchInput, setSearchInput] = useState(q)
    const debouncedSearch = useDebounce(searchInput, 350)
    const listTopRef = useRef(null)

    const updateParams = useCallback((patch) => {
        const params = new URLSearchParams(searchParams.toString())
        Object.entries(patch).forEach(([key, value]) => {
            const isDefault = value === null || value === '' || (key === 'tab' && value === 'all') || (key === 'page' && value === 1)
            if (isDefault) params.delete(key)
            else params.set(key, String(value))
        })
        const qs = params.toString()
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    }, [router, pathname, searchParams])

    // Typing settles → push the search into the URL and restart at page 1.
    useEffect(() => {
        const next = debouncedSearch.trim().slice(0, MAX_SEARCH_LENGTH)
        if (next !== q) updateParams({ q: next, page: null })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch])

    const { data, isPending, isFetching, isError, isPlaceholderData, refetch } = useQuery({
        queryKey: ['user-orders', { tab, q, page }],
        queryFn: ({ signal }) => fetchOrders({ tab, q, page }, signal),
        // Keep the current rows visible while the next tab / page / search loads.
        placeholderData: keepPreviousData,
        staleTime: 30 * 1000,
        refetchOnWindowFocus: true,
    })

    // The server clamps an out-of-range page (stale link, orders filtered away);
    // mirror that in the URL so pagination and the address bar agree.
    useEffect(() => {
        if (data && !isPlaceholderData && data.page !== page) {
            updateParams({ page: data.page })
        }
    }, [data, isPlaceholderData, page, updateParams])

    const selectTab = (value) => {
        if (value === tab) return
        updateParams({ tab: value, page: null })
    }

    const clearSearch = () => {
        setSearchInput('')
        if (q) updateParams({ q: null, page: null })
    }

    const goToPage = (index) => {
        updateParams({ page: index + 1 })
        requestAnimationFrame(() => listTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    }

    const counts = data?.counts
    const orders = data?.orders ?? []
    const total = data?.total ?? 0
    const currentPage = data?.page ?? page
    const firstIndex = total ? (currentPage - 1) * PAGE_SIZE + 1 : 0
    const lastIndex = Math.min(currentPage * PAGE_SIZE, total)
    const activeTabLabel = ORDER_TABS.find((t) => t.value === tab)?.label

    let list
    if (isPending) {
        list = (
            <div className="divide-y divide-border/60">
                {Array.from({ length: 4 }).map((_, i) => <OrderSummaryCardSkeleton key={i} />)}
            </div>
        )
    } else if (isError && !data) {
        list = (
            <EmptyState
                title="Couldn't load your orders"
                description="Please check your connection and try again."
                action={(
                    <Button type="button" variant="brand" className="h-10 px-6" onClick={() => refetch()} disabled={isFetching}>
                        <RotateCcw className="size-4" /> Retry
                    </Button>
                )}
            />
        )
    } else if (!q && counts?.all === 0) {
        list = (
            <EmptyState
                title="No orders yet"
                description="You haven't placed any orders. Explore our collections and find something you love."
                action={(
                    <Button asChild variant="brand" className="h-11 px-8 text-base font-semibold">
                        <Link href={WEBSITE_SHOP}>Shop Now</Link>
                    </Button>
                )}
            />
        )
    } else if (total === 0) {
        list = q ? (
            <EmptyState
                title="No matching orders"
                description={`Nothing in ${tab === 'all' ? 'your orders' : `“${activeTabLabel}”`} matches “${q}”. Try an order ID or a product name.`}
                action={(
                    <Button type="button" variant="brand-outline" className="h-10 px-6" onClick={clearSearch}>
                        Clear search
                    </Button>
                )}
            />
        ) : (
            <EmptyState
                title={`No ${activeTabLabel?.toLowerCase()} orders`}
                description="Orders will show up here as their status changes."
                action={(
                    <Button type="button" variant="brand-outline" className="h-10 px-6" onClick={() => selectTab('all')}>
                        View all orders
                    </Button>
                )}
            />
        )
    } else {
        list = (
            <div className={cn('divide-y divide-border/60 transition-opacity', isPlaceholderData && 'opacity-60')} aria-busy={isFetching}>
                {orders.map((order) => <OrderSummaryCard key={order._id} order={order} />)}
            </div>
        )
    }

    return (
        <div className={CARD}>
            {/* Header + search */}
            <div className="flex flex-col gap-4 border-b border-[var(--dark-red)]/20 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--brand-primary)]">
                    <Package className="size-4" /> My Orders
                </h2>
                <div className="relative w-full sm:max-w-xs">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground/40" />
                    <Input
                        type="search"
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                        onKeyDown={(event) => { if (event.key === 'Escape') clearSearch() }}
                        maxLength={MAX_SEARCH_LENGTH}
                        placeholder="Search order ID or product"
                        aria-label="Search orders by order ID or product name"
                        className="h-10 pl-9 pr-9 [&::-webkit-search-cancel-button]:hidden"
                    />
                    {searchInput && (
                        <button
                            type="button"
                            onClick={clearSearch}
                            aria-label="Clear search"
                            className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-foreground/50 transition hover:bg-muted hover:text-foreground"
                        >
                            <X className="size-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div ref={listTopRef} className="scroll-mt-28 border-b border-[var(--dark-red)]/20">
                <div role="tablist" aria-label="Filter orders by status" className="no-scrollbar flex gap-1 overflow-x-auto px-3 py-2">
                    {ORDER_TABS.map(({ value, label }) => {
                        const selected = value === tab
                        return (
                            <button
                                key={value}
                                type="button"
                                role="tab"
                                aria-selected={selected}
                                onClick={() => selectTab(value)}
                                className={cn(
                                    'flex shrink-0 items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-sm font-semibold transition-colors',
                                    selected
                                        ? 'bg-[var(--dark-red)] text-white'
                                        : 'text-foreground/60 hover:bg-[var(--brand-warm-bg)] hover:text-[var(--brand-primary)]'
                                )}
                            >
                                {label}
                                {counts ? (
                                    <span className={cn(
                                        'min-w-6 rounded-full px-1.5 py-0.5 text-center text-[11px] tabular-nums',
                                        selected ? 'bg-white/20 text-white' : 'bg-muted text-foreground/60'
                                    )}>
                                        {counts[value] ?? 0}
                                    </span>
                                ) : (
                                    <Skeleton className="h-4 w-6 rounded-full" />
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>

            {list}

            {/* Footer: range + pagination */}
            {!isPending && total > 0 && (
                <div className="flex flex-col items-center gap-3 border-t border-[var(--dark-red)]/20 px-5 py-4 sm:flex-row sm:justify-between">
                    <p className="text-[13px] text-foreground/60 tabular-nums">
                        Showing {firstIndex}–{lastIndex} of {total} {total === 1 ? 'order' : 'orders'}
                    </p>
                    <ShopPagination
                        page={currentPage - 1}
                        totalPages={data?.totalPages ?? 1}
                        onPageChange={goToPage}
                        disabled={isFetching}
                        siblings={0}
                    />
                </div>
            )}
        </div>
    )
}

const OrdersFallback = () => (
    <div className={CARD} aria-hidden>
        <div className="flex items-center justify-between border-b border-[var(--dark-red)]/20 px-5 py-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="hidden h-10 w-64 sm:block" />
        </div>
        <div className="flex gap-2 border-b border-[var(--dark-red)]/20 px-3 py-2">
            {ORDER_TABS.map(({ value }) => <Skeleton key={value} className="h-9 w-24" />)}
        </div>
        <div className="divide-y divide-border/60">
            {Array.from({ length: 4 }).map((_, i) => <OrderSummaryCardSkeleton key={i} />)}
        </div>
    </div>
)

const Orders = () => {
    return (
        <div>
            <WebsiteBreadcrumb props={breadCrumbData} />
            <UserPanelLayout>
                {/* useSearchParams needs a Suspense boundary for static rendering. */}
                <Suspense fallback={<OrdersFallback />}>
                    <OrdersContent />
                </Suspense>
            </UserPanelLayout>
        </div>
    )
}

export default Orders

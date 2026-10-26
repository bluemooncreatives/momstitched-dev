import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import imgPlaceholder from '@/public/assets/images/img-placeholder.webp'
import { Skeleton } from '@/components/ui/skeleton'
import { ORDER_STATUS_META } from '@/lib/orderStatusGroups'
import { WEBSITE_ORDER_DETAILS } from '@/routes/WebsiteRoute'
import { cn } from '@/lib/utils'

export const formatINR = (n) => Number(n || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })

export const formatOrderDate = (value) => {
    const date = value ? new Date(value) : null
    if (!date || Number.isNaN(date.getTime())) return ''
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export const OrderStatusBadge = ({ status, className }) => {
    const meta = ORDER_STATUS_META[status] || ORDER_STATUS_META.pending
    return (
        <span className={cn('inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em]', meta.className, className)}>
            {meta.label}
        </span>
    )
}

// One order row (summary shape from lib/services/userOrderService). Stacks on
// phones, single line from sm up.
const OrderSummaryCard = ({ order }) => {
    const extra = Math.max(0, order.productCount - order.products.length)
    const firstName = order.products[0]?.name || 'Order'
    const title = order.productCount > 1 ? `${firstName} + ${order.productCount - 1} more` : firstName

    return (
        <Link
            href={WEBSITE_ORDER_DETAILS(order.order_id)}
            className="group flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-[var(--brand-warm-bg)]/30 sm:flex-row sm:items-center sm:gap-5"
        >
            <div className="flex shrink-0 -space-x-3">
                {order.products.map((product, index) => (
                    <div
                        key={index}
                        className="relative h-14 w-11 overflow-hidden rounded-md border-2 border-background bg-[var(--product-card-bg)] shadow-sm"
                    >
                        <Image src={product.image || imgPlaceholder.src} alt={product.name} fill sizes="44px" className="object-cover" />
                    </div>
                ))}
                {extra > 0 && (
                    <div className="flex h-14 w-11 items-center justify-center rounded-md border-2 border-background bg-muted text-xs font-semibold text-muted-foreground">
                        +{extra}
                    </div>
                )}
            </div>

            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground" title={title}>{title}</p>
                <p className="mt-0.5 text-[13px] text-muted-foreground">
                    <span className="font-medium text-[var(--dark-red)]">#{order.order_id}</span>
                    {' · '}{formatOrderDate(order.createdAt)}
                    {' · '}{order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                </p>
            </div>

            <div className="flex items-center justify-between gap-4 sm:justify-end">
                <OrderStatusBadge status={order.displayStatus} />
                <span className="text-sm font-semibold text-[var(--brand-primary)] tabular-nums">{formatINR(order.totalAmount)}</span>
                <ChevronRight className="hidden size-4 text-foreground/30 transition-transform group-hover:translate-x-0.5 sm:block" />
            </div>
        </Link>
    )
}

export const OrderSummaryCardSkeleton = () => (
    <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-5" aria-hidden>
        <div className="flex -space-x-3">
            <Skeleton className="h-14 w-11 rounded-md" />
            <Skeleton className="h-14 w-11 rounded-md" />
        </div>
        <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3 max-w-[260px]" />
            <Skeleton className="h-3 w-1/2 max-w-[200px]" />
        </div>
        <div className="flex items-center justify-between gap-4 sm:justify-end">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-4 w-16" />
        </div>
    </div>
)

export default OrderSummaryCard

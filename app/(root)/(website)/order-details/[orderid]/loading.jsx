import WebsiteBreadcrumb from '@/components/Application/Website/WebsiteBreadcrumb'
import { Skeleton } from '@/components/ui/skeleton'

const breadcrumb = {
    title: 'Order Details',
    links: [{ label: 'Order Details' }]
}

const CARD = 'overflow-hidden rounded-2xl border border-border/60 bg-background shadow-sm'

// Mirrors the order-details page: top bar, header + tracker card, items and
// shipping on the left, summary/payment on the right.
const OrderDetailsLoading = () => {
    return (
        <div className="font-neue" aria-busy="true" aria-label="Loading order details">
            <WebsiteBreadcrumb props={breadcrumb} />

            <section className="website-gutter py-10 lg:py-14">
                <div className="mx-auto w-full max-w-5xl" aria-hidden>
                    <div className="mb-6 flex items-center justify-between gap-4">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-7 w-28 rounded-full" />
                    </div>

                    <div className={CARD}>
                        <div className="flex flex-col gap-4 border-b border-border/60 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <div className="flex items-start gap-3">
                                <Skeleton className="size-11 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-48" />
                                    <Skeleton className="h-3.5 w-36" />
                                </div>
                            </div>
                            <Skeleton className="h-4 w-28" />
                        </div>
                        <div className="px-5 py-6 sm:px-6">
                            <div className="flex items-center justify-between gap-2">
                                {Array.from({ length: 4 }).map((_, index) => (
                                    <div key={index} className="flex flex-1 flex-col items-center gap-2">
                                        <Skeleton className="size-9 rounded-full" />
                                        <Skeleton className="h-3 w-16" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_360px]">
                        <div className="min-w-0 space-y-6">
                            <div className={CARD}>
                                <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
                                    <Skeleton className="h-5 w-20" />
                                    <Skeleton className="h-5 w-16 rounded-full" />
                                </div>
                                <div className="divide-y divide-border/50">
                                    {Array.from({ length: 2 }).map((_, index) => (
                                        <div key={index} className="flex gap-4 p-5">
                                            <Skeleton className="h-[96px] w-[72px] shrink-0 rounded-md" />
                                            <div className="flex flex-1 flex-col">
                                                <Skeleton className="h-4 w-3/4" />
                                                <Skeleton className="mt-2 h-4 w-20 rounded-full" />
                                                <div className="mt-auto flex justify-between pt-3">
                                                    <Skeleton className="h-3.5 w-24" />
                                                    <Skeleton className="h-4 w-16" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={`${CARD} space-y-2 p-5`}>
                                <Skeleton className="h-5 w-36" />
                                <Skeleton className="mt-3 h-3.5 w-40" />
                                <Skeleton className="h-3.5 w-full max-w-sm" />
                                <Skeleton className="h-3.5 w-48" />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className={`${CARD} space-y-3 p-5`}>
                                <Skeleton className="h-5 w-32" />
                                {Array.from({ length: 4 }).map((_, index) => (
                                    <div key={index} className="flex justify-between">
                                        <Skeleton className="h-3.5 w-20" />
                                        <Skeleton className="h-3.5 w-16" />
                                    </div>
                                ))}
                                <Skeleton className="mt-2 h-10 w-full" />
                            </div>
                            <div className={`${CARD} space-y-3 p-5`}>
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-3.5 w-36" />
                                <Skeleton className="h-3.5 w-28" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default OrderDetailsLoading

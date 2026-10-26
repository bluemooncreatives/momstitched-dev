import ProductBoxSkeleton from '@/components/Application/Website/ProductBoxSkeleton'
import { Skeleton } from '@/components/ui/skeleton'

// Mirrors ShopClient (hero → filter sidebar + 3×3 grid) so the real page swaps
// in without layout shift. Only shown on navigation into /shop — filter/sort
// changes keep the current page mounted.
const ShopLoading = () => {
    return (
        <div aria-busy="true" aria-label="Loading products">
            <section className="relative isolate h-[172px] overflow-hidden sm:h-[180px] lg:h-[280px]">
                <div className="absolute inset-0 bg-[var(--dark-red-2)]" />
                <div className="absolute inset-x-0 top-14 z-10 flex justify-center sm:top-5 lg:top-6">
                    <div
                        className="pointer-events-none select-none font-neue font-semibold uppercase tracking-[0.02em] text-white/90"
                        style={{
                            fontSize: "clamp(7.5rem, 34vw, 30rem)",
                            lineHeight: 0.78,
                            WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 38%, rgba(0,0,0,0) 100%)",
                            maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 38%, rgba(0,0,0,0) 100%)",
                        }}
                        aria-hidden
                    >
                        Shop
                    </div>
                </div>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-16 bg-gradient-to-b from-transparent via-background/50 to-background sm:h-36" />
            </section>

            <section className="website-gutter bg-background pt-4 pb-10 sm:py-10 lg:py-14">
                <div className="grid w-full gap-6 lg:grid-cols-[290px_1fr] lg:gap-8">
                    <aside className="hidden w-full lg:block" aria-hidden>
                        <div className="space-y-6 rounded-[var(--radius)] border border-border/60 p-5">
                            {Array.from({ length: 4 }).map((_, group) => (
                                <div key={group} className="space-y-3">
                                    <Skeleton className="h-4 w-24" />
                                    {Array.from({ length: 4 }).map((__, row) => (
                                        <div key={row} className="flex items-center gap-2">
                                            <Skeleton className="size-4 rounded-sm" />
                                            <Skeleton className="h-3.5 w-28" />
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </aside>

                    <div className="w-full">
                        <div className="flex items-center justify-between gap-3" aria-hidden>
                            <Skeleton className="h-9 w-28 lg:hidden" />
                            <Skeleton className="hidden h-4 w-32 lg:block" />
                            <Skeleton className="h-9 w-44" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-7 md:grid-cols-3 md:gap-5 lg:gap-6" aria-hidden>
                            {Array.from({ length: 9 }).map((_, index) => (
                                <ProductBoxSkeleton key={index} />
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default ShopLoading

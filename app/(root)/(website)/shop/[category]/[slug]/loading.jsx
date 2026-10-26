import { Skeleton } from '@/components/ui/skeleton'

// Mirrors ProductDetails' gallery + buy box. Shown when opening a product;
// switching color/size on the same product keeps the page mounted and uses
// the inline swatch spinner instead.
const ProductLoading = () => {
    return (
        <section
            className="website-gutter bg-[linear-gradient(180deg,rgba(62,0,13,0.03),transparent_18%)] py-8 lg:py-12"
            aria-busy="true"
            aria-label="Loading product"
        >
            <div className="w-full font-neue" aria-hidden>
                <div className="mb-6 flex items-center gap-2 lg:mb-8">
                    <Skeleton className="h-3.5 w-12" />
                    <Skeleton className="h-3.5 w-10" />
                    <Skeleton className="h-3.5 w-20" />
                    <Skeleton className="h-3.5 w-32" />
                </div>

                <div className="grid items-start gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12 xl:gap-16">
                    {/* Gallery */}
                    <div className="flex flex-col-reverse gap-3 xl:flex-row xl:gap-4">
                        <div className="flex gap-3 xl:w-[84px] xl:flex-col">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <Skeleton key={index} className="aspect-[4/5] w-[72px] shrink-0 rounded-[var(--radius-sm)] xl:w-full" />
                            ))}
                        </div>
                        <Skeleton className="aspect-[4/5] w-full flex-1 rounded-[var(--radius-lg)]" />
                    </div>

                    {/* Info panel */}
                    <div className="flex flex-col">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="mt-3 h-9 w-4/5" />
                        <Skeleton className="mt-2 h-9 w-1/2" />
                        <Skeleton className="mt-4 h-4 w-40" />
                        <div className="mt-5 flex items-end gap-3">
                            <Skeleton className="h-8 w-28" />
                            <Skeleton className="h-5 w-16" />
                        </div>
                        <Skeleton className="mt-2 h-3 w-32" />
                        <div className="mt-5 space-y-2">
                            <Skeleton className="h-3.5 w-full" />
                            <Skeleton className="h-3.5 w-11/12" />
                            <Skeleton className="h-3.5 w-2/3" />
                        </div>

                        <div className="my-6 h-px w-full bg-border/60" />

                        <Skeleton className="h-3 w-28" />
                        <div className="mt-3 flex gap-2.5">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <Skeleton key={index} className="size-9 rounded-full" />
                            ))}
                        </div>

                        <Skeleton className="mt-6 h-3 w-24" />
                        <div className="mt-3 flex flex-wrap gap-2">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <Skeleton key={index} className="h-9 w-[52px] rounded-[var(--radius-sm)]" />
                            ))}
                        </div>

                        <div className="mt-6 flex gap-3">
                            <Skeleton className="h-12 w-32 shrink-0 rounded-[var(--radius-sm)]" />
                            <Skeleton className="h-12 flex-1 rounded-[var(--radius-sm)]" />
                            <Skeleton className="size-12 shrink-0 rounded-[var(--radius-sm)]" />
                        </div>

                        <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <Skeleton key={index} className="h-14 rounded-[var(--radius-sm)]" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ProductLoading

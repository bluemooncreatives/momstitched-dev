'use client'
import Filter from '@/components/Application/Website/Filter'
import Sorting from '@/components/Application/Website/Sorting'
import { WEBSITE_SHOP } from '@/routes/WebsiteRoute'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import axios from 'axios'
import { useSearchParams } from 'next/navigation'
import { useInfiniteQuery } from '@tanstack/react-query'
import ProductBox from '@/components/Application/Website/ProductBox'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
const Shop = () => {
    const searchParams = useSearchParams()
    const searchParamString = searchParams.toString()
    const [limit, setLimit] = useState(9)
    const [sorting, setSorting] = useState('default_sorting')
    const [isMobileFilter, setIsMobileFilter] = useState(false)
    const [isDesktop, setIsDesktop] = useState(false)

    useEffect(() => {
        const mediaQuery = window.matchMedia('(min-width: 1025px)')

        const onChange = (event) => {
            setIsDesktop(event.matches)
        }

        setIsDesktop(mediaQuery.matches)
        mediaQuery.addEventListener('change', onChange)

        return () => {
            mediaQuery.removeEventListener('change', onChange)
        }
    }, [])

    const fetchProduct = useCallback(async (pageParam) => {
        const { data: getProduct } = await axios.get('/api/shop', {
            params: {
                page: pageParam,
                limit,
                sort: sorting,
                ...(searchParamString ? Object.fromEntries(new URLSearchParams(searchParamString)) : {}),
            }
        })
        if (!getProduct.success) {
            throw new Error(getProduct.message || 'Failed to load products.')
        }
        return getProduct.data
    }, [limit, sorting, searchParamString])

    const { error, data, isFetching, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
        queryKey: ['products', limit, sorting, searchParamString],
        queryFn: ({ pageParam }) => fetchProduct(pageParam),
        initialPageParam: 0,
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: 1,
        getNextPageParam: (lastPage) => {
            return lastPage?.nextPage ?? undefined
        }
    })

    const allProducts = useMemo(() => data?.pages?.flatMap((page) => page.products) || [], [data?.pages])
    const showEmptyState = !isFetching && !error && allProducts.length === 0
    const resultCount = !isFetching && !error ? allProducts.length : null

    return (
        <div>
            <section className="relative isolate h-[280px] overflow-hidden sm:h-[220px] lg:h-[280px]">
                <div className="absolute inset-0 bg-[var(--dark-red-2)]" />
                <div className="absolute inset-x-0 top-3 z-10 flex justify-center sm:top-5 lg:top-6">
                    <div
                        className="pointer-events-none select-none font-neue font-semibold uppercase tracking-[0.02em] text-white/90"
                        style={{
                            fontSize: "clamp(7.5rem, 34vw, 30rem)",
                            lineHeight: 0.78,
                            WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 38%, rgba(0,0,0,0) 100%)",
                            maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 38%, rgba(0,0,0,0) 100%)",
                            textShadow: "0 12px 32px rgba(0,0,0,0.18)",
                        }}
                        aria-hidden
                    >
                        Shop
                    </div>
                </div>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-36 bg-gradient-to-b from-transparent via-white/50 to-white" />
            </section>

            <section className='website-gutter bg-white py-10 lg:py-14'>
                <div className="grid w-full gap-6 lg:grid-cols-[290px_1fr] lg:gap-8">
                    {isDesktop ? (
                        <aside className='w-full'>
                            <div className='sticky top-6'>
                                <Filter />
                            </div>
                        </aside>
                    ) : (
                        <Sheet open={isMobileFilter} onOpenChange={setIsMobileFilter}>
                            <SheetContent side='left' className="block bg-white">
                                <SheetHeader className="border-b px-5">
                                    <SheetTitle>Filter</SheetTitle>
                                    <SheetDescription>Refine your results quickly.</SheetDescription>
                                </SheetHeader>
                                <div className='h-[calc(100vh-82px)] overflow-auto px-5 py-4'>
                                    <Filter />
                                </div>
                            </SheetContent>
                        </Sheet>
                    )}

                    <div className='w-full'>
                        <div>
                            <Sorting
                                limit={limit}
                                setLimit={setLimit}
                                sorting={sorting}
                                setSorting={setSorting}
                                mobileFilterOpen={isMobileFilter}
                                setMobileFilterOpen={setIsMobileFilter}
                                resultCount={resultCount}
                            />
                        </div>

                        {(isLoading || isFetching) && <div className='font-neue py-6 text-center text-sm text-muted-foreground'>Loading products...</div>}
                        {error && <div className='font-neue py-6 text-center text-sm text-destructive'>Failed to load products. Please try again.</div>}

                        {showEmptyState ? (
                            <div className="mt-8 rounded-lg border border-border/60 bg-white p-10 text-center shadow-sm">
                                <h3 className="font-neue text-xl font-semibold">No products found</h3>
                                <p className="font-neue mt-2 text-sm text-muted-foreground">
                                    Try adjusting your filters or start a fresh search.
                                </p>
                                {searchParams.size > 0 && (
                                    <Button asChild className="mt-4 rounded-md bg-[var(--dark-red)] hover:bg-[var(--dark-red-2)]">
                                        <Link href={WEBSITE_SHOP}>Clear Filters</Link>
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className='grid grid-cols-2 gap-4 pt-7 md:grid-cols-3 md:gap-5 lg:gap-6'>
                                {allProducts.map((product) => (
                                    <ProductBox key={product._id} product={product} />
                                ))}
                            </div>
                        )}

                        <div className='mt-9 flex flex-col items-center gap-4'>
                            {hasNextPage ? (
                                <ButtonLoading
                                    type="button"
                                    loading={isFetching}
                                    text="Load More"
                                    onClick={fetchNextPage}
                                    className="h-10 rounded-md bg-[var(--dark-red)] px-7 text-[11px] font-semibold uppercase tracking-[0.24em] hover:bg-[var(--dark-red-2)]"
                                />
                            ) : (
                                !isFetching && !showEmptyState && <span className="text-sm text-muted-foreground">No more data to load.</span>
                            )}
                            {!showEmptyState && (
                                <p className="font-neue text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                                    Showing {allProducts.length} results
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Shop

'use client'
import { useEffect, useMemo } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useDispatch, useSelector } from 'react-redux'
import { Heart, LogIn, RotateCcw, ShoppingBag } from 'lucide-react'
import WebsiteBreadcrumb from '@/components/Application/Website/WebsiteBreadcrumb'
import ProductBox from '@/components/Application/Website/ProductBox'
import ProductBoxSkeleton from '@/components/Application/Website/ProductBoxSkeleton'
import { BrandButton, BrandOutlineButton } from '@/components/Application/Website/BrandButton'
import { Skeleton } from '@/components/ui/skeleton'
import { GUEST_OWNER, MAX_WISHLIST_ITEMS } from '@/lib/wishlist'
import { WEBSITE_LOGIN, WEBSITE_SHOP, WEBSITE_WISHLIST } from '@/routes/WebsiteRoute'
import { pruneWishlist } from '@/store/wishlistActions'

const breadCrumbData = {
    title: 'Wishlist',
    links: [{ label: 'Wishlist' }]
}

const GRID = 'grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6'

const SkeletonGrid = ({ count }) => (
    <div className={GRID} aria-hidden>
        {Array.from({ length: count }).map((_, index) => <ProductBoxSkeleton key={index} />)}
    </div>
)

const fetchWishlistProducts = async (productIds, signal) => {
    const { data } = await axios.post('/api/wishlist/products', { productIds }, { signal })
    if (!data?.success) throw new Error(data?.message || 'Failed to load your wishlist.')
    return data.data
}

const WishlistPageClient = () => {
    const dispatch = useDispatch()
    const { items, hydrated, status, owner } = useSelector((state) => state.wishlistStore)
    const authHydrated = useSelector((state) => state.authStore.hydrated)
    const authUser = useSelector((state) => state.authStore.auth)

    const ids = useMemo(() => items.map((item) => item.productId), [items])
    // Order-independent key: re-sorting or re-saving the same set reuses the cache.
    const idsKey = useMemo(() => [...ids].sort().join(','), [ids])
    const listReady = hydrated && status !== 'syncing'

    const { data, isPending, isError, isFetching, isPlaceholderData, refetch } = useQuery({
        queryKey: ['wishlist-products', idsKey],
        queryFn: ({ signal }) => fetchWishlistProducts(idsKey.split(','), signal),
        enabled: listReady && ids.length > 0,
        // Removing an item changes the key; keep showing the previous cards
        // (filtered below) instead of flashing skeletons.
        placeholderData: keepPreviousData,
        staleTime: 60 * 1000,
    })

    // Products deleted from the store since they were saved → prune them.
    useEffect(() => {
        if (!data?.missing?.length || isPlaceholderData || status !== 'ready') return
        dispatch(pruneWishlist(data.missing))
    }, [data, isPlaceholderData, status, dispatch])

    const productById = useMemo(
        () => new Map((data?.products || []).map((product) => [String(product._id).toLowerCase(), product])),
        [data]
    )
    const missing = useMemo(() => new Set(data?.missing || []), [data])

    // Render in saved order (newest first), only for ids still on the list.
    const products = ids.map((id) => productById.get(id)).filter(Boolean)
    // Ids added meanwhile (e.g. from another tab) that haven't resolved yet.
    const unresolvedCount = ids.filter((id) => !productById.has(id) && !missing.has(id)).length

    const isGuest = owner === GUEST_OWNER
    const showGuestHint = isGuest && authHydrated && !authUser
    const count = ids.length

    let body
    if (!listReady || (count > 0 && isPending)) {
        body = <SkeletonGrid count={Math.min(Math.max(count, 4), 8)} />
    } else if (count === 0) {
        body = (
            <div className="mx-auto flex max-w-xl flex-col items-center rounded-lg border border-border/60 bg-background px-6 py-14 text-center shadow-sm">
                <div className="flex size-16 items-center justify-center rounded-full bg-[var(--brand-cream)]/50 text-[var(--brand-primary)]">
                    <Heart className="size-8" strokeWidth={1.5} />
                </div>
                <h2 className="font-neue mt-5 text-xl font-semibold">Your wishlist is empty</h2>
                <p className="font-neue mt-2 max-w-sm text-sm text-muted-foreground">
                    Tap the heart on any piece you love to save it here for later.
                </p>
                <div className="mt-6 w-full max-w-xs">
                    <BrandButton asChild>
                        <Link href={WEBSITE_SHOP}><ShoppingBag className="mr-2 size-4" />Browse Shop</Link>
                    </BrandButton>
                </div>
            </div>
        )
    } else if (isError && products.length === 0) {
        body = (
            <div className="mx-auto flex max-w-xl flex-col items-center rounded-lg border border-border/60 bg-background px-6 py-14 text-center shadow-sm">
                <h2 className="font-neue text-xl font-semibold text-destructive">Something went wrong</h2>
                <p className="font-neue mt-2 max-w-sm text-sm text-muted-foreground">
                    We couldn&apos;t load your saved items right now. Please try again.
                </p>
                <div className="mt-6 w-full max-w-xs">
                    <BrandButton type="button" onClick={() => refetch()} disabled={isFetching}>
                        <RotateCcw className="mr-2 size-4" />Retry
                    </BrandButton>
                </div>
            </div>
        )
    } else {
        body = (
            <div className={GRID}>
                {products.map((product, index) => (
                    <ProductBox key={product._id} product={product} priority={index < 4} />
                ))}
                {unresolvedCount > 0 && Array.from({ length: unresolvedCount }).map((_, index) => (
                    <ProductBoxSkeleton key={`pending-${index}`} />
                ))}
            </div>
        )
    }

    return (
        <div>
            <WebsiteBreadcrumb props={breadCrumbData} />

            <section className="website-gutter bg-background pt-4 pb-10 font-neue sm:py-10 lg:py-14">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-[var(--brand-primary)]">My Wishlist</h1>
                        {listReady ? (
                            <p className="mt-1 text-sm text-muted-foreground">
                                {count} {count === 1 ? 'saved item' : 'saved items'}
                                {count >= MAX_WISHLIST_ITEMS - 10 && ` · up to ${MAX_WISHLIST_ITEMS} allowed`}
                            </p>
                        ) : (
                            <Skeleton className="mt-2 h-4 w-28" />
                        )}
                    </div>
                    {count > 0 && listReady && (
                        <BrandOutlineButton asChild className="w-full text-[13px] tracking-normal sm:w-auto sm:px-6">
                            <Link href={WEBSITE_SHOP}>Continue Shopping</Link>
                        </BrandOutlineButton>
                    )}
                </div>

                {showGuestHint && count > 0 && (
                    <div className="mb-6 flex flex-col gap-3 rounded-[var(--radius)] border border-[var(--dark-red)]/20 bg-[var(--brand-warm-bg)]/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-foreground/80">
                            Saved on this device only. Sign in to keep your wishlist across devices.
                        </p>
                        <Link
                            href={`${WEBSITE_LOGIN}?callback=${encodeURIComponent(WEBSITE_WISHLIST)}`}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--dark-red)] underline-offset-4 hover:underline"
                        >
                            <LogIn className="size-4" /> Sign in
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <p className="mb-6 rounded-[var(--radius)] border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800">
                        We couldn&apos;t sync these items to your account yet. We&apos;ll try again automatically when you&apos;re back online.
                    </p>
                )}

                {body}
            </section>
        </div>
    )
}

export default WishlistPageClient

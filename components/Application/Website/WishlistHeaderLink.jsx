'use client'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { useSelector } from 'react-redux'
import { WEBSITE_WISHLIST } from '@/routes/WebsiteRoute'
import { cn } from '@/lib/utils'

const WishlistHeaderLink = ({ className, iconClassName }) => {
    const hydrated = useSelector((state) => state.wishlistStore.hydrated)
    const count = useSelector((state) => state.wishlistStore.items.length)
    // Badge only after the snapshot loads, so SSR and first paint agree.
    const shownCount = hydrated ? count : 0

    return (
        <Link
            href={WEBSITE_WISHLIST}
            aria-label={shownCount > 0 ? `Wishlist, ${shownCount} ${shownCount === 1 ? 'item' : 'items'}` : 'Wishlist'}
            className={cn('relative flex items-center justify-center rounded-md transition hover:bg-muted/40', className)}
        >
            <Heart className={iconClassName} strokeWidth={1.75} />
            {shownCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--dark-red)] px-1 text-[9px] font-semibold text-white tabular-nums sm:-right-2 sm:-top-2 sm:h-5 sm:min-w-5 sm:text-[10px]">
                    {shownCount > 99 ? '99+' : shownCount}
                </span>
            )}
        </Link>
    )
}

export default WishlistHeaderLink

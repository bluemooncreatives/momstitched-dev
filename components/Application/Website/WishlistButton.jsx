'use client'
import { Heart } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { cn } from '@/lib/utils'
import { selectIsWishlisted, selectWishlistReady, toggleWishlist } from '@/store/wishlistActions'

const VARIANTS = {
    // Floating circle on a product image.
    overlay: 'size-9 rounded-full border border-border/40 bg-background/85 shadow-sm backdrop-blur-sm hover:bg-background',
    // Square button beside the buy-box CTA.
    outline: 'h-12 w-12 shrink-0 rounded-[var(--radius-sm)] border border-border/70 bg-background hover:border-[var(--dark-red)]/60',
}

const WishlistButton = ({ productId, productName = 'this product', variant = 'overlay', className }) => {
    const dispatch = useDispatch()
    const id = String(productId || '').toLowerCase()
    const hydrated = useSelector((state) => state.wishlistStore.hydrated)
    const ready = useSelector(selectWishlistReady)
    const isWishlisted = useSelector(selectIsWishlisted(id))
    // Until the snapshot is loaded we don't know the real state — render the
    // outline heart (matches SSR) instead of guessing "not saved".
    const active = hydrated && isWishlisted

    const handleClick = (event) => {
        // Cards wrap their image in a link; a heart tap must not navigate.
        event.preventDefault()
        event.stopPropagation()
        if (!ready) return
        dispatch(toggleWishlist(id))
    }

    if (!id) return null

    return (
        <button
            type="button"
            onClick={handleClick}
            aria-pressed={active}
            aria-disabled={!ready}
            aria-busy={hydrated && !ready}
            aria-label={active ? `Remove ${productName} from wishlist` : `Add ${productName} to wishlist`}
            title={active ? 'Remove from wishlist' : 'Add to wishlist'}
            className={cn(
                'flex items-center justify-center transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dark-red)]/40',
                VARIANTS[variant] || VARIANTS.overlay,
                active ? 'text-[var(--dark-red)]' : 'text-foreground/70 hover:text-[var(--dark-red)]',
                !ready && 'cursor-wait opacity-70',
                className
            )}
        >
            <Heart
                className={cn(variant === 'outline' ? 'size-5' : 'size-4', 'transition-transform duration-200', active && 'scale-110 fill-[var(--dark-red)]')}
                strokeWidth={1.75}
            />
        </button>
    )
}

export default WishlistButton

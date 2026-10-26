'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSelector } from 'react-redux'
import { ShoppingBag } from 'lucide-react'
import { USER_DASHBOARD, USER_ORDERS, USER_PROFILE, WEBSITE_CART, WEBSITE_CHECKOUT } from '@/routes/WebsiteRoute'
import { cn } from '@/lib/utils'

// Pages where the bar would duplicate or get in the way of the page's own CTA.
const HIDDEN_PREFIXES = [WEBSITE_CART, WEBSITE_CHECKOUT, USER_DASHBOARD, USER_ORDERS, USER_PROFILE, '/order-details', '/auth']

const isTextEntry = (element) =>
    element instanceof HTMLElement &&
    (element.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName))

const fmt = (n) => Number(n || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })

/**
 * Bottom cart summary for phones/tablets (< lg) while browsing. Hidden when
 * the cart is empty, on cart/checkout/account pages, and while the shopper is
 * typing (on mobile a fixed bar rides up above the keyboard and covers the
 * field). Renders an in-flow spacer so it never hides the end of the page.
 */
const MobileCartBar = () => {
    const pathname = usePathname() || ''
    const rehydrated = useSelector((state) => state._persist?.rehydrated)
    const products = useSelector((state) => state.cartStore.products)
    const [mounted, setMounted] = useState(false)
    const [typing, setTyping] = useState(false)

    useEffect(() => setMounted(true), [])

    useEffect(() => {
        const onFocusIn = (event) => setTyping(isTextEntry(event.target))
        const onFocusOut = () => setTyping(false)
        document.addEventListener('focusin', onFocusIn)
        document.addEventListener('focusout', onFocusOut)
        return () => {
            document.removeEventListener('focusin', onFocusIn)
            document.removeEventListener('focusout', onFocusOut)
        }
    }, [])

    const lineCount = products.length
    const subtotal = products.reduce((sum, product) => sum + (Number(product.sellingPrice) || 0) * (Number(product.qty) || 0), 0)
    const hiddenHere = HIDDEN_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
    const visible = mounted && rehydrated && lineCount > 0 && !hiddenHere

    if (!visible) return null

    return (
        <>
            {/* Spacer keeps the footer's last row reachable above the bar. */}
            <div aria-hidden className="h-[76px] lg:hidden" />

            <div
                className={cn(
                    'fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] transition-transform duration-300 lg:hidden',
                    typing ? 'pointer-events-none translate-y-full' : 'translate-y-0'
                )}
                aria-hidden={typing}
            >
                <div className="flex items-center gap-3 rounded-[var(--radius)] border border-black/10 bg-background/95 px-4 py-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.15)] backdrop-blur supports-[backdrop-filter]:bg-background/85">
                    <div className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--brand-cream)]/60 text-[var(--brand-primary)]">
                        <ShoppingBag className="size-5" strokeWidth={1.75} />
                        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--dark-red)] px-1 text-[10px] font-semibold text-white tabular-nums">
                            {lineCount}
                        </span>
                    </div>
                    <div className="min-w-0 flex-1 font-neue" aria-live="polite">
                        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                            {lineCount} {lineCount === 1 ? 'item' : 'items'} in cart
                        </p>
                        <p className="truncate text-base font-semibold text-foreground tabular-nums">{fmt(subtotal)}</p>
                    </div>
                    <Link
                        href={WEBSITE_CART}
                        tabIndex={typing ? -1 : undefined}
                        className="inline-flex h-10 shrink-0 items-center justify-center rounded-sm bg-[var(--dark-red)] px-5 font-neue text-[13px] font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[var(--dark-red-2)]"
                    >
                        View Cart
                    </Link>
                </div>
            </div>
        </>
    )
}

export default MobileCartBar

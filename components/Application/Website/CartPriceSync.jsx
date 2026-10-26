'use client'
import { useCallback, useEffect, useRef } from 'react'
import axios from 'axios'
import { usePathname } from 'next/navigation'
import { useDispatch, useSelector, useStore } from 'react-redux'
import { syncCartPrices } from '@/store/reducer/cartReducer'
import { showToast } from '@/lib/showToast'
import { WEBSITE_CHECKOUT } from '@/routes/WebsiteRoute'

// A persisted cart can sit in localStorage for days; prices change and pieces
// get discontinued. Re-check at most this often while the shopper browses.
const RECHECK_AFTER_MS = 2 * 60 * 1000
const DEBOUNCE_MS = 600

const DISPLAY_FIELDS = ['name', 'url', 'size', 'color', 'mrp', 'sellingPrice']

const cartKeyOf = (products) => products.map((p) => String(p.variantId)).sort().join(',')

/**
 * Re-prices the cart in the background:
 *  - after the persisted cart rehydrates,
 *  - when a line is added that hasn't been checked yet,
 *  - on navigation / returning to the tab once the last check is stale.
 * Lines that were deleted from the catalogue are removed, changed prices are
 * applied, and the shopper is told about either. Checkout runs its own
 * authoritative verification, so this stays idle there.
 */
const CartPriceSync = () => {
    const dispatch = useDispatch()
    const store = useStore()
    const pathname = usePathname()
    const rehydrated = useSelector((state) => state._persist?.rehydrated)
    const cartKey = useSelector((state) => cartKeyOf(state.cartStore.products))

    const disabled = pathname?.startsWith(WEBSITE_CHECKOUT)
    const lastCheck = useRef({ at: 0, verifiedIds: new Set() })
    const inFlight = useRef(false)
    const rerun = useRef(false)
    // Latest maybeCheck, so a check that finishes can immediately re-run itself.
    const maybeCheckRef = useRef(null)

    const runCheck = useCallback(async () => {
        if (inFlight.current) {
            rerun.current = true
            return
        }

        const lines = store.getState().cartStore.products
        if (!lines.length) return

        const payload = lines.map(({ productId, variantId, qty }) => ({ productId, variantId, qty }))
        const checkedVariantIds = payload.map((line) => String(line.variantId))
        const checkedSet = new Set(checkedVariantIds)

        inFlight.current = true
        try {
            const { data } = await axios.post('/api/cart-verification', payload)
            // A failed request says nothing about availability — never drop lines on error.
            if (!data?.success || !Array.isArray(data.data)) return

            const verifiedById = new Map(data.data.map((line) => [String(line.variantId), line]))
            const current = store.getState().cartStore.products

            const removed = []
            let priceChanges = 0
            let anyChange = false
            for (const line of current) {
                const key = String(line.variantId)
                if (!checkedSet.has(key)) continue
                const fresh = verifiedById.get(key)
                if (!fresh) {
                    removed.push(line.name)
                    anyChange = true
                    continue
                }
                if (Number(fresh.sellingPrice) !== Number(line.sellingPrice)) priceChanges++
                if (DISPLAY_FIELDS.some((field) => fresh[field] !== line[field]) || (fresh.media && fresh.media !== line.media)) {
                    anyChange = true
                }
            }

            // Skip no-op dispatches so redux-persist doesn't rewrite storage.
            if (anyChange) {
                dispatch(syncCartPrices({ checkedVariantIds, verified: data.data }))
            }

            lastCheck.current = { at: Date.now(), verifiedIds: new Set(verifiedById.keys()) }

            if (removed.length) {
                showToast(
                    'warning',
                    removed.length === 1
                        ? `"${removed[0]}" is no longer available and was removed from your cart.`
                        : `${removed.length} items are no longer available and were removed from your cart.`
                )
            }
            if (priceChanges) {
                showToast(
                    'info',
                    priceChanges === 1
                        ? 'A price in your cart has changed. Your cart now shows the latest price.'
                        : `${priceChanges} prices in your cart have changed. Your cart now shows the latest prices.`
                )
            }
        } catch {
            // Offline / server hiccup — try again on the next trigger.
        } finally {
            inFlight.current = false
            if (rerun.current) {
                rerun.current = false
                maybeCheckRef.current?.()
            }
        }
    }, [dispatch, store])

    // Check when something is unverified or the last result is stale.
    const maybeCheck = useCallback(() => {
        const lines = store.getState().cartStore.products
        if (!lines.length) return
        const { at, verifiedIds } = lastCheck.current
        const stale = Date.now() - at > RECHECK_AFTER_MS
        const hasUnchecked = lines.some((line) => !verifiedIds.has(String(line.variantId)))
        if (stale || hasUnchecked) runCheck()
    }, [runCheck, store])

    maybeCheckRef.current = maybeCheck

    // Rehydration, line changes and navigation (debounced so a burst of
    // add-to-cart clicks becomes one request).
    useEffect(() => {
        if (!rehydrated || disabled || !cartKey) return
        const timer = setTimeout(() => maybeCheckRef.current(), DEBOUNCE_MS)
        return () => clearTimeout(timer)
    }, [rehydrated, disabled, cartKey, pathname])

    // Returning to a tab that sat in the background.
    useEffect(() => {
        if (!rehydrated || disabled) return
        const onVisible = () => {
            if (document.visibilityState === 'visible') maybeCheckRef.current()
        }
        document.addEventListener('visibilitychange', onVisible)
        window.addEventListener('online', onVisible)
        return () => {
            document.removeEventListener('visibilitychange', onVisible)
            window.removeEventListener('online', onVisible)
        }
    }, [rehydrated, disabled])

    return null
}

export default CartPriceSync

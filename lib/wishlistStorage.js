import { GUEST_OWNER, WISHLIST_STORAGE_KEY, normalizeWishlistItems } from '@/lib/wishlist'

// localStorage can be missing (SSR), blocked (privacy mode / disabled cookies)
// or full — every access is guarded so the wishlist degrades to in-memory only.

export const parseWishlistSnapshot = (raw) => {
    if (!raw) return null
    try {
        const parsed = JSON.parse(raw)
        if (!parsed || typeof parsed.owner !== 'string' || !parsed.owner) return null
        return { owner: parsed.owner, items: normalizeWishlistItems(parsed.items) }
    } catch {
        return null
    }
}

export const serializeWishlistSnapshot = ({ owner, items }) => JSON.stringify({
    owner,
    items: items.map(({ productId, addedAt }) => ({ productId, addedAt })),
})

// null  → nothing stored (fresh browser, or cleared by a logout)
// undefined → storage is unavailable, so the caller should trust in-memory state
export const readWishlistSnapshot = () => {
    try {
        return parseWishlistSnapshot(window.localStorage.getItem(WISHLIST_STORAGE_KEY))
    } catch {
        return undefined
    }
}

export const writeWishlistSnapshot = (snapshot) => {
    try {
        const next = serializeWishlistSnapshot(snapshot)
        // Skip identical writes so tabs don't ping-pong `storage` events.
        if (window.localStorage.getItem(WISHLIST_STORAGE_KEY) === next) return
        window.localStorage.setItem(WISHLIST_STORAGE_KEY, next)
    } catch {
        // Storage unavailable/full — the in-memory list still works for this tab.
    }
}

// Called on logout so the next visitor on this browser starts with an empty
// guest list instead of the previous account's saved items.
export const clearWishlistSnapshot = () => {
    try {
        window.localStorage.removeItem(WISHLIST_STORAGE_KEY)
    } catch {
        // ignore
    }
}

export const emptyGuestSnapshot = () => ({ owner: GUEST_OWNER, items: [] })

// Fired when another tab signed in or out; AuthHydrator re-resolves the session.
export const AUTH_RECHECK_EVENT = 'momstitched:auth-recheck'

// Single source of truth for wishlist rules. Imported by the Redux slice, the
// client sync layer AND the API routes so the client cap and the server guard
// can never drift apart.
export const MAX_WISHLIST_ITEMS = 100

// localStorage key holding the wishlist snapshot ({ owner, items }). Kept out of
// redux-persist's root key so other tabs can react to it via the `storage` event
// and so logout can clear it independently of the cart.
export const WISHLIST_STORAGE_KEY = 'momstitched:wishlist'

// Owner tag for a signed-out (or admin) visitor's local-only wishlist.
export const GUEST_OWNER = 'guest'

const OBJECT_ID_RE = /^[a-f0-9]{24}$/i

// Earliest plausible timestamp (store launch); anything older, or further in
// the future than device/server clock skew can explain, is treated as corrupt
// and replaced with "now".
const MIN_ADDED_AT = Date.UTC(2024, 0, 1)
const MAX_CLOCK_SKEW_MS = 24 * 60 * 60 * 1000

export const isObjectIdString = (value) => typeof value === 'string' && OBJECT_ID_RE.test(value)

export const normalizeAddedAt = (value, now = Date.now()) => {
    const ms = typeof value === 'number' ? value : Date.parse(value)
    if (!Number.isFinite(ms) || ms < MIN_ADDED_AT || ms > now + MAX_CLOCK_SKEW_MS) return now
    return ms
}

// Coerce any incoming list (localStorage, another tab, request body) into the
// canonical shape: [{ productId, addedAt }], unique by product, newest first,
// capped at MAX_WISHLIST_ITEMS. Garbage entries are dropped rather than thrown on.
export const normalizeWishlistItems = (items, now = Date.now()) => {
    if (!Array.isArray(items)) return []

    const byId = new Map()
    for (const item of items) {
        const productId = String(item?.productId ?? '').trim().toLowerCase()
        if (!isObjectIdString(productId)) continue

        const addedAt = normalizeAddedAt(item?.addedAt, now)
        const existing = byId.get(productId)
        // Duplicates keep the earliest save time.
        if (!existing || addedAt < existing.addedAt) {
            byId.set(productId, { productId, addedAt })
        }
    }

    return Array.from(byId.values())
        .sort((a, b) => b.addedAt - a.addedAt)
        .slice(0, MAX_WISHLIST_ITEMS)
}

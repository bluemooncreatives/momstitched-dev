import { createSlice } from "@reduxjs/toolkit";
import { MAX_WISHLIST_ITEMS, normalizeWishlistItems } from "@/lib/wishlist";

// NOT persisted through redux-persist — WishlistSync owns a dedicated
// localStorage snapshot so other tabs can follow along and logout can wipe it.
const initialState = {
    // [{ productId, addedAt }] newest first.
    items: [],
    // GUEST_OWNER for a local-only list, otherwise the customer's user id.
    owner: null,
    // false until the first snapshot has been loaded on the client. Keeps hearts
    // and the header badge from rendering a wrong state during SSR/first paint.
    hydrated: false,
    // 'ready' | 'syncing' (account fetch / sign-in merge in flight) | 'error'
    status: 'ready',
}

export const wishlistReducer = createSlice({
    name: 'wishlistStore',
    initialState,
    reducers: {
        hydrateWishlist: (state, action) => {
            const { owner, items, status } = action.payload
            state.owner = owner
            state.items = normalizeWishlistItems(items)
            state.hydrated = true
            if (status) state.status = status
        },
        setWishlistStatus: (state, action) => {
            state.status = action.payload
        },
        addToWishlist: (state, action) => {
            const { productId, addedAt } = action.payload
            if (state.items.length >= MAX_WISHLIST_ITEMS) return
            if (state.items.some((item) => item.productId === productId)) return
            state.items = normalizeWishlistItems([{ productId, addedAt }, ...state.items])
        },
        removeFromWishlist: (state, action) => {
            const ids = new Set([].concat(action.payload.productId))
            state.items = state.items.filter((item) => !ids.has(item.productId))
        },
    }
})

export const {
    hydrateWishlist,
    setWishlistStatus,
    addToWishlist,
    removeFromWishlist,
} = wishlistReducer.actions
export default wishlistReducer.reducer

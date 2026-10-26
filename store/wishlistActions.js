import axios from "axios";
import { showToast } from "@/lib/showToast";
import { GUEST_OWNER, MAX_WISHLIST_ITEMS } from "@/lib/wishlist";
import { AUTH_RECHECK_EVENT } from "@/lib/wishlistStorage";
import { addToWishlist, removeFromWishlist } from "./reducer/wishlistReducer";

// Products whose server request is still pending. A second click on the same
// heart is ignored until the first settles, otherwise add/remove requests could
// land out of order and leave the server disagreeing with the UI.
const inFlight = new Set()

// Incremented on every local change. WishlistSync compares it before adopting a
// background server refresh so a slower GET can't undo a click made meanwhile.
let mutationSeq = 0
export const getWishlistMutationSeq = () => mutationSeq

const FULL_MESSAGE = `Your wishlist can hold up to ${MAX_WISHLIST_ITEMS} items. Remove one to add another.`

const requestError = (data) => Object.assign(new Error(data?.message || 'Could not update your wishlist.'), {
    statusCode: data?.statusCode,
})

const handleRequestError = (error) => {
    if (error?.statusCode === 401) {
        // Cookie expired or was cleared in another tab — let AuthHydrator re-resolve.
        window.dispatchEvent(new Event(AUTH_RECHECK_EVENT))
        showToast('error', 'Your session has expired. Please sign in again.')
        return
    }
    showToast('error', error?.message || 'Could not update your wishlist.')
}

export const selectIsWishlisted = (productId) => (state) =>
    state.wishlistStore.items.some((item) => item.productId === productId)

export const selectWishlistReady = (state) =>
    state.wishlistStore.hydrated && state.wishlistStore.status === 'ready'

export const toggleWishlist = (rawProductId) => async (dispatch, getState) => {
    const productId = String(rawProductId || '').toLowerCase()
    const { hydrated, status, items, owner } = getState().wishlistStore
    if (!productId || !hydrated || status !== 'ready' || inFlight.has(productId)) return

    const existing = items.find((item) => item.productId === productId)
    const isAccount = Boolean(owner) && owner !== GUEST_OWNER

    if (!existing && items.length >= MAX_WISHLIST_ITEMS) {
        showToast('error', FULL_MESSAGE)
        return
    }

    mutationSeq++

    if (existing) {
        dispatch(removeFromWishlist({ productId }))
        showToast('success', 'Removed from wishlist.')
    } else {
        dispatch(addToWishlist({ productId, addedAt: Date.now() }))
        showToast('success', 'Added to wishlist.')
    }

    if (!isAccount) return

    inFlight.add(productId)
    try {
        const { data } = await axios.post(
            existing ? '/api/wishlist/remove' : '/api/wishlist/add',
            { productId }
        )
        if (!data?.success) throw requestError(data)
    } catch (error) {
        // Roll back — unless the user signed out meanwhile and the list was replaced.
        if (getState().wishlistStore.owner === owner) {
            mutationSeq++
            dispatch(existing ? addToWishlist(existing) : removeFromWishlist({ productId }))
        }
        handleRequestError(error)
    } finally {
        inFlight.delete(productId)
    }
}

// Drop saved items whose product no longer exists (reported by the resolver).
export const pruneWishlist = (productIds) => async (dispatch, getState) => {
    const ids = productIds.map((id) => String(id).toLowerCase())
    const { items, owner } = getState().wishlistStore
    const present = ids.filter((id) => items.some((item) => item.productId === id))
    if (!present.length) return

    mutationSeq++
    dispatch(removeFromWishlist({ productId: present }))
    showToast(
        'info',
        present.length === 1
            ? '1 saved item is no longer available and was removed from your wishlist.'
            : `${present.length} saved items are no longer available and were removed from your wishlist.`
    )

    if (owner && owner !== GUEST_OWNER) {
        // Best effort — the server also prunes these on its next read.
        axios.post('/api/wishlist/remove', { productIds: present }).catch(() => { })
    }
}

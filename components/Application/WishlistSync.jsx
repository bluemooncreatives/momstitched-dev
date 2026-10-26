'use client'
import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { useDispatch, useSelector, useStore } from 'react-redux'
import { GUEST_OWNER, MAX_WISHLIST_ITEMS, WISHLIST_STORAGE_KEY } from '@/lib/wishlist'
import {
    AUTH_RECHECK_EVENT,
    emptyGuestSnapshot,
    parseWishlistSnapshot,
    readWishlistSnapshot,
    writeWishlistSnapshot,
} from '@/lib/wishlistStorage'
import { hydrateWishlist, setWishlistStatus } from '@/store/reducer/wishlistReducer'
import { getWishlistMutationSeq } from '@/store/wishlistActions'
import { showToast } from '@/lib/showToast'

// Whose wishlist this tab should be showing: null while auth is unresolved,
// the customer's id when signed in, otherwise the local guest list. Admins
// browsing the storefront keep a local-only list (the wishlist API is
// customer-only).
const selectAuthOwner = (state) => {
    const { hydrated, auth } = state.authStore
    if (!hydrated) return null
    return auth?.role === 'user' && auth?._id ? String(auth._id) : GUEST_OWNER
}

/**
 * Keeps the wishlist store, its localStorage snapshot, other tabs and the
 * account copy on the server in agreement:
 *  - first paint comes straight from the snapshot (no network wait);
 *  - once auth resolves, a guest list is merged into the account on sign-in,
 *    a customer's list is refreshed from the server, and a previous account's
 *    list is never shown to a signed-out visitor;
 *  - changes are written through to the snapshot, and snapshot changes from
 *    other tabs are adopted (or trigger an auth re-check when another tab
 *    signed in / out).
 */
const WishlistSync = () => {
    const dispatch = useDispatch()
    const store = useStore()
    const authOwner = useSelector(selectAuthOwner)
    const { items, owner, hydrated, status } = useSelector((state) => state.wishlistStore)
    const [retryKey, setRetryKey] = useState(0)
    const reconcileSeq = useRef(0)

    // Current snapshot — localStorage when available, else this tab's memory.
    const currentSnapshot = () => {
        const stored = readWishlistSnapshot()
        if (stored !== undefined) return stored || emptyGuestSnapshot()
        const { owner: memOwner, items: memItems } = store.getState().wishlistStore
        return memOwner ? { owner: memOwner, items: memItems } : emptyGuestSnapshot()
    }

    // 1. Instant first paint from the snapshot.
    useEffect(() => {
        dispatch(hydrateWishlist({ ...currentSnapshot(), status: 'ready' }))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch])

    // 2. Reconcile whenever the signed-in identity changes (or a retry is due).
    useEffect(() => {
        if (!authOwner) return

        const seq = ++reconcileSeq.current
        const controller = new AbortController()
        const isStale = () => seq !== reconcileSeq.current

        const run = async () => {
            const snapshot = currentSnapshot()

            if (authOwner === GUEST_OWNER) {
                // Signed out: keep a guest list, but drop one that belonged to an
                // account (expired session / no explicit logout on a shared device).
                dispatch(hydrateWishlist({
                    owner: GUEST_OWNER,
                    items: snapshot.owner === GUEST_OWNER ? snapshot.items : [],
                    status: 'ready',
                }))
                return
            }

            const guestItems = snapshot.owner === GUEST_OWNER ? snapshot.items : []

            if (guestItems.length) {
                // Fresh sign-in with a guest list → merge it into the account.
                // Hearts are locked ('syncing') because the merge rewrites the
                // list; the snapshot keeps the guest items until the server
                // confirms, so a closed tab or failure simply merges next time.
                dispatch(hydrateWishlist({ owner: authOwner, items: guestItems, status: 'syncing' }))
                try {
                    const { data } = await axios.post('/api/wishlist/merge', { items: guestItems }, { signal: controller.signal })
                    if (isStale()) return
                    if (!data?.success) throw new Error(data?.message)

                    dispatch(hydrateWishlist({ owner: authOwner, items: data.data.items, status: 'ready' }))
                    if (data.data.dropped > 0) {
                        showToast(
                            'warning',
                            `Your wishlist is limited to ${MAX_WISHLIST_ITEMS} items, so ${data.data.dropped} saved ${data.data.dropped === 1 ? 'item' : 'items'} couldn't be added.`
                        )
                    }
                } catch (error) {
                    if (axios.isCancel(error) || isStale()) return
                    dispatch(setWishlistStatus('error'))
                }
                return
            }

            // Already this account's list (or nothing to merge): show the cached
            // copy now and refresh from the server in the background.
            dispatch(hydrateWishlist({
                owner: authOwner,
                items: snapshot.owner === authOwner ? snapshot.items : [],
                status: 'ready',
            }))

            const mutationSeqAtStart = getWishlistMutationSeq()
            try {
                const { data } = await axios.get('/api/wishlist', { signal: controller.signal })
                if (isStale() || !data?.success) return
                // A heart was clicked while this was in flight; that change has
                // already been sent to the server, so local state is newer.
                if (getWishlistMutationSeq() !== mutationSeqAtStart) return
                dispatch(hydrateWishlist({ owner: authOwner, items: data.data.items, status: 'ready' }))
            } catch {
                // Offline / server error: the cached copy stays in place.
            }
        }

        run()
        return () => controller.abort()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authOwner, retryKey, dispatch])

    // 3. A failed sign-in merge is retried when the connection or tab comes back.
    const statusRef = useRef(status)
    statusRef.current = status
    useEffect(() => {
        const retry = () => {
            if (statusRef.current === 'error' && document.visibilityState === 'visible') {
                setRetryKey((key) => key + 1)
            }
        }
        window.addEventListener('online', retry)
        document.addEventListener('visibilitychange', retry)
        return () => {
            window.removeEventListener('online', retry)
            document.removeEventListener('visibilitychange', retry)
        }
    }, [])

    // 4. Write-through. Skipped while a merge is pending/failed so the guest
    // snapshot survives until the account has actually absorbed it.
    useEffect(() => {
        if (!hydrated || !owner || status !== 'ready') return
        writeWishlistSnapshot({ owner, items })
    }, [hydrated, owner, items, status])

    // 5. Follow other tabs.
    useEffect(() => {
        const onStorage = (event) => {
            if (event.key !== null && event.key !== WISHLIST_STORAGE_KEY) return

            // key === null means localStorage.clear(); newValue null means removed (logout).
            const snapshot = parseWishlistSnapshot(event.key === null ? null : event.newValue) || emptyGuestSnapshot()
            const current = store.getState().wishlistStore
            if (current.status === 'syncing') return

            if (snapshot.owner === current.owner) {
                // 'ready' also clears a failed-merge state here: the snapshot is
                // only written as the account's once a merge has succeeded.
                dispatch(hydrateWishlist({ owner: snapshot.owner, items: snapshot.items, status: 'ready' }))
                return
            }

            // Another tab signed in or out. Re-resolve the session here; the
            // reconcile effect then picks up the snapshot that tab wrote.
            window.dispatchEvent(new Event(AUTH_RECHECK_EVENT))
        }

        window.addEventListener('storage', onStorage)
        return () => window.removeEventListener('storage', onStorage)
    }, [dispatch, store])

    return null
}

export default WishlistSync

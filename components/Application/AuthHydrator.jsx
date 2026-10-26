'use client'
import { useEffect } from 'react'
import axios from 'axios'
import { useDispatch, useStore } from 'react-redux'
import { login, logout } from '@/store/reducer/authReducer'
import { AUTH_RECHECK_EVENT } from '@/lib/wishlistStorage'

/**
 * Resolves the signed-in user from the server once on app load and mirrors it into
 * the Redux auth store. This is what makes the navbar / dashboard sidebar show the
 * real name + avatar reliably — Redux `authStore` is intentionally NOT persisted,
 * and Google sign-in never dispatched `login` on the client, so without this the
 * client believed nobody was logged in after every refresh.
 */
const AuthHydrator = () => {
    const dispatch = useDispatch()
    const store = useStore()

    useEffect(() => {
        let controller = new AbortController()

        // `recheck` = another tab signed in/out (or a request came back 401), so
        // a "not signed in" answer is trusted even if this tab still holds a user.
        const hydrate = async (recheck = false) => {
            try {
                const { data } = await axios.get('/api/auth/me', { signal: controller.signal })
                if (data?.success && data?.data) {
                    dispatch(login(data.data))
                } else {
                    // Only mark logged-out if nobody logged in while this request was
                    // in flight (an explicit login dispatch is authoritative).
                    if (recheck || !store.getState().authStore?.auth) {
                        dispatch(logout())
                    }
                }
            } catch (error) {
                if (axios.isCancel(error) || error?.name === 'CanceledError') return
                // A network failure during a re-check says nothing about the session.
                if (!recheck && !store.getState().authStore?.auth) {
                    dispatch(logout())
                }
            }
        }

        const onRecheck = () => {
            controller.abort()
            controller = new AbortController()
            hydrate(true)
        }

        hydrate()
        window.addEventListener(AUTH_RECHECK_EVENT, onRecheck)
        return () => {
            controller.abort()
            window.removeEventListener(AUTH_RECHECK_EVENT, onRecheck)
        }
    }, [dispatch, store])

    return null
}

export default AuthHydrator

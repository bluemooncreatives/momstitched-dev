import { showToast } from "@/lib/showToast"
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"

export const NOTIFICATION_QUERY_KEY = ['admin-notifications']
const POLL_INTERVAL = 30 * 1000

// API routes answer auth failures with HTTP 200 + success:false, so unwrap
// the envelope and surface statusCode for callers that need to react to it.
const request = async (config) => {
    const { data: response } = await axios(config)
    if (!response.success) {
        const error = new Error(response.message || 'Request failed.')
        error.statusCode = response.statusCode
        throw error
    }
    return response
}

const isUnauthorized = (error) => [401, 403].includes(error?.statusCode)

const fetchNotifications = async ({ limit, status = 'all', type = 'all', before }) => {
    const params = new URLSearchParams({ limit: String(limit), status, type })
    if (before) params.set('before', before)
    const response = await request({ url: `/api/notifications?${params}`, method: 'GET' })
    return response.data
}

/**
 * Latest notifications + unread count for the topbar bell. Polls while the tab
 * is visible, refetches on focus, and stops polling once the session expires
 * so a logged-out tab doesn't hammer the API.
 */
export const useNotificationBell = (limit = 8) => useQuery({
    queryKey: [...NOTIFICATION_QUERY_KEY, 'bell', limit],
    queryFn: () => fetchNotifications({ limit }),
    staleTime: 15 * 1000,
    refetchInterval: (query) => (isUnauthorized(query.state.error) ? false : POLL_INTERVAL),
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    retry: (count, error) => !isUnauthorized(error) && count < 2,
})

/** Paginated feed for the notifications page. */
export const useNotificationFeed = ({ status, type, limit = 20 }) => useInfiniteQuery({
    queryKey: [...NOTIFICATION_QUERY_KEY, 'feed', status, type, limit],
    queryFn: ({ pageParam }) => fetchNotifications({ limit, status, type, before: pageParam }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => (lastPage?.hasMore ? lastPage.nextCursor : undefined),
    refetchInterval: (query) => (isUnauthorized(query.state.error) ? false : POLL_INTERVAL * 2),
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    retry: (count, error) => !isUnauthorized(error) && count < 2,
})

/**
 * Read/unread/delete mutations. Read-state changes are applied optimistically
 * to every cached list (bell + feed) and rolled back if the server rejects them.
 */
export const useNotificationActions = () => {
    const queryClient = useQueryClient()

    const patchCaches = (updater) => {
        queryClient.setQueriesData({ queryKey: NOTIFICATION_QUERY_KEY }, (data) => {
            if (!data) return data
            if (Array.isArray(data.pages)) {
                return { ...data, pages: data.pages.map(updater) }
            }
            return updater(data)
        })
    }

    const applyReadState = (page, { ids, all, read }) => {
        if (!page?.items) return page
        const idSet = new Set(ids || [])
        let delta = 0
        const items = page.items.map((item) => {
            if (!(all || idSet.has(item._id)) || item.isRead === read) return item
            delta += read ? -1 : 1
            return { ...item, isRead: read }
        })
        return { ...page, items, unreadCount: all && read ? 0 : Math.max(0, (page.unreadCount || 0) + delta) }
    }

    const settle = () => queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEY })

    const markMutation = useMutation({
        mutationFn: ({ ids, all, read = true }) => request({
            url: '/api/notifications/mark',
            method: 'PUT',
            data: { ids, all, read },
        }),
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: NOTIFICATION_QUERY_KEY })
            const snapshot = queryClient.getQueriesData({ queryKey: NOTIFICATION_QUERY_KEY })
            patchCaches((page) => applyReadState(page, { read: true, ...variables }))
            return { snapshot }
        },
        onError: (error, _variables, context) => {
            context?.snapshot?.forEach(([key, data]) => queryClient.setQueryData(key, data))
            showToast('error', error.message)
        },
        onSettled: settle,
    })

    const deleteMutation = useMutation({
        mutationFn: ({ ids, scope }) => request({
            url: '/api/notifications/delete',
            method: 'DELETE',
            data: { ids, scope },
        }),
        onSuccess: (response) => showToast('success', response.message),
        onError: (error) => showToast('error', error.message),
        onSettled: settle,
    })

    return {
        markRead: (ids) => markMutation.mutate({ ids, read: true }),
        markUnread: (ids) => markMutation.mutate({ ids, read: false }),
        markAllRead: () => markMutation.mutate({ all: true, read: true }),
        remove: (ids, options) => deleteMutation.mutate({ ids }, options),
        clearRead: (options) => deleteMutation.mutate({ scope: 'read' }, options),
        isMarking: markMutation.isPending,
        isDeleting: deleteMutation.isPending,
    }
}

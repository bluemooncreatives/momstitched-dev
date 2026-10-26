// Single registry of every event that notifies the admin team. Shared by the
// server (model enum, email toggles) and the admin UI (labels, filters), so it
// must stay free of server-only imports.

export const ADMIN_EVENT = Object.freeze({
    ORDER_PLACED: 'order_placed',
    CONTACT_RECEIVED: 'contact_received',
    REVIEW_RECEIVED: 'review_received',
    CUSTOMER_REGISTERED: 'customer_registered',
    SHIPMENT_DELIVERED: 'shipment_delivered',
    SHIPMENT_ISSUE: 'shipment_issue',
    SHIPMENT_SYNC_FAILED: 'shipment_sync_failed',
    SYSTEM_TEST: 'system_test',
})

// `emailDefault` is what a fresh install uses until an admin changes it in
// Notification Settings. In-app notifications are always recorded.
export const ADMIN_EVENT_LIST = [
    {
        type: ADMIN_EVENT.ORDER_PLACED,
        label: 'New order placed',
        description: 'Every order a customer places, with items, payment and shipping details.',
        emailDefault: true,
    },
    {
        type: ADMIN_EVENT.CONTACT_RECEIVED,
        label: 'Contact form message',
        description: 'A visitor submits the contact form.',
        emailDefault: true,
    },
    {
        type: ADMIN_EVENT.REVIEW_RECEIVED,
        label: 'New product review',
        description: 'A customer posts a rating or review on a product.',
        emailDefault: false,
    },
    {
        type: ADMIN_EVENT.CUSTOMER_REGISTERED,
        label: 'New customer signup',
        description: 'Someone creates an account with email or Google.',
        emailDefault: false,
    },
    {
        type: ADMIN_EVENT.SHIPMENT_DELIVERED,
        label: 'Shipment delivered',
        description: 'The courier marks an order as delivered.',
        emailDefault: false,
    },
    {
        type: ADMIN_EVENT.SHIPMENT_ISSUE,
        label: 'Shipment problem',
        description: 'The courier reports a return to origin (RTO) or cancels a shipment.',
        emailDefault: true,
    },
    {
        type: ADMIN_EVENT.SHIPMENT_SYNC_FAILED,
        label: 'Tracking sync failure',
        description: 'The daily courier tracking sync could not update some shipments.',
        emailDefault: true,
    },
]

// Types that can be stored. SYSTEM_TEST is not user-configurable, so it is
// absent from ADMIN_EVENT_LIST but still a valid notification type.
export const ADMIN_EVENT_TYPES = Object.values(ADMIN_EVENT)

export const ADMIN_EVENT_LABEL = Object.fromEntries([
    ...ADMIN_EVENT_LIST.map((event) => [event.type, event.label]),
    [ADMIN_EVENT.SYSTEM_TEST, 'Test notification'],
])

export const defaultEmailEvents = () =>
    Object.fromEntries(ADMIN_EVENT_LIST.map((event) => [event.type, event.emailDefault]))

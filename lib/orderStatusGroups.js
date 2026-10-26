// Customer-facing order groupings, shared by the account dashboard stats, the
// Orders page tabs and their API so the numbers always agree.
//
// The courier sync only updates `shipment.shipmentStatus` (it never flips the
// order's own `status`), so an order whose shipment reports DELIVERED counts as
// delivered even if an admin hasn't marked it yet. `unverified` (payment not
// confirmed) belongs to no group and only appears under "All".

export const IN_PROGRESS_STATUSES = ['pending', 'processing', 'shipped']

// Excluded from "total spent": nothing was (or will be) charged for these.
export const NON_SPENDING_STATUSES = ['cancelled', 'unverified']

export const ORDER_TABS = [
    { value: 'all', label: 'All' },
    { value: 'in_progress', label: 'In progress' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
]

export const ORDER_TAB_VALUES = ORDER_TABS.map((tab) => tab.value)

// MongoDB match fragments per tab (no user/deletedAt — callers add those).
export const ORDER_TAB_FILTERS = {
    all: {},
    in_progress: {
        status: { $in: IN_PROGRESS_STATUSES },
        'shipment.shipmentStatus': { $ne: 'DELIVERED' },
    },
    delivered: {
        status: { $ne: 'cancelled' },
        $or: [{ status: 'delivered' }, { 'shipment.shipmentStatus': 'DELIVERED' }],
    },
    cancelled: { status: 'cancelled' },
}

// Status to show the customer for one order, applying the same rule.
export const getDisplayOrderStatus = (order) => {
    const status = order?.status || 'pending'
    if (status !== 'cancelled' && order?.shipment?.shipmentStatus === 'DELIVERED') return 'delivered'
    return status
}

export const ORDER_STATUS_META = {
    pending: { label: 'Order placed', className: 'border-amber-500/30 bg-amber-500/10 text-amber-700' },
    processing: { label: 'Processing', className: 'border-blue-500/30 bg-blue-500/10 text-blue-700' },
    shipped: { label: 'Shipped', className: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-700' },
    delivered: { label: 'Delivered', className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700' },
    cancelled: { label: 'Cancelled', className: 'border-red-500/30 bg-red-500/10 text-red-700' },
    unverified: { label: 'Payment unverified', className: 'border-orange-500/30 bg-orange-500/10 text-orange-700' },
}

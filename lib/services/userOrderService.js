import mongoose from 'mongoose'
import { escapeRegex } from '@/lib/helperFunction'
import { NON_SPENDING_STATUSES, ORDER_TAB_FILTERS, ORDER_TAB_VALUES, getDisplayOrderStatus } from '@/lib/orderStatusGroups'
import OrderModel from '@/models/Order.model'
import '@/models/Product.model'
import '@/models/ProductVariant.model'
import '@/models/Media.model'

export const toUserObjectId = (userId) =>
    mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : null

// Orders are matched strictly by owner; the order's contact email is
// user-supplied and is never used for access.
const ownerMatch = (userObjectId) => ({ user: userObjectId, deletedAt: null })

const MAX_PREVIEW_ITEMS = 3

// Compact list-row shape: no addresses/payment ids, at most 3 thumbnails.
const toOrderSummary = (order) => {
    const products = order.products || []
    return {
        _id: String(order._id),
        order_id: order.order_id,
        status: order.status,
        displayStatus: getDisplayOrderStatus(order),
        totalAmount: order.totalAmount || 0,
        createdAt: order.createdAt,
        itemCount: products.reduce((sum, item) => sum + (item?.qty || 0), 0),
        productCount: products.length,
        products: products.slice(0, MAX_PREVIEW_ITEMS).map((item) => ({
            name: item?.productId?.name || item?.name || 'Product',
            slug: item?.productId?.slug || null,
            qty: item?.qty || 0,
            image: item?.variantId?.media?.[0]?.secure_url || null,
        })),
    }
}

const findOrderSummaries = (filter, { skip = 0, limit }) => OrderModel.find(filter)
    // _id tiebreaker keeps pagination stable for orders created in the same ms.
    .sort({ createdAt: -1, _id: -1 })
    .skip(skip)
    .limit(limit)
    .select('order_id status shipment.shipmentStatus totalAmount createdAt products')
    .populate('products.productId', 'name slug')
    .populate({
        path: 'products.variantId',
        select: 'media',
        populate: { path: 'media', select: 'secure_url' }
    })
    .lean()
    .then((orders) => orders.map(toOrderSummary))

const countFacet = (match) => [{ $match: match }, { $count: 'n' }]
const facetCount = (facet, key) => facet?.[key]?.[0]?.n || 0

export const normalizeOrderSearch = (value) =>
    String(value ?? '').trim().replace(/^#+/, '').trim().slice(0, 80)

// Order id or any product name on the order (the name snapshot stored at
// purchase time, so renamed/deleted products are still findable).
const searchMatch = (q) => {
    if (!q) return {}
    const regex = { $regex: escapeRegex(q), $options: 'i' }
    return { $or: [{ order_id: regex }, { 'products.name': regex }] }
}

export const getUserDashboardStats = async (userObjectId) => {
    const [facet] = await OrderModel.aggregate([
        { $match: ownerMatch(userObjectId) },
        {
            $facet: {
                total: [{ $count: 'n' }],
                active: countFacet(ORDER_TAB_FILTERS.in_progress),
                delivered: countFacet(ORDER_TAB_FILTERS.delivered),
                spent: [
                    { $match: { status: { $nin: NON_SPENDING_STATUSES } } },
                    { $group: { _id: null, sum: { $sum: '$totalAmount' } } },
                ],
            }
        }
    ])

    return {
        totalOrders: facetCount(facet, 'total'),
        activeOrders: facetCount(facet, 'active'),
        deliveredOrders: facetCount(facet, 'delivered'),
        totalSpent: facet?.spent?.[0]?.sum || 0,
    }
}

export const getRecentUserOrders = (userObjectId, limit = 5) =>
    findOrderSummaries(ownerMatch(userObjectId), { limit })

export const listUserOrders = async (userObjectId, { tab = 'all', q = '', page = 1, limit = 10 } = {}) => {
    const activeTab = ORDER_TAB_VALUES.includes(tab) ? tab : 'all'
    const search = normalizeOrderSearch(q)
    const baseMatch = { $and: [ownerMatch(userObjectId), searchMatch(search)] }

    // Tab counts honour the search, so each tab shows how many results it holds.
    const [facet] = await OrderModel.aggregate([
        { $match: baseMatch },
        {
            $facet: Object.fromEntries(
                ORDER_TAB_VALUES.map((value) => [value, countFacet(ORDER_TAB_FILTERS[value])])
            )
        }
    ])
    const counts = Object.fromEntries(ORDER_TAB_VALUES.map((value) => [value, facetCount(facet, value)]))

    const total = counts[activeTab]
    const totalPages = Math.max(1, Math.ceil(total / limit))
    // A stale link (?page=9 after orders were filtered away) lands on the last page.
    const currentPage = Math.min(Math.max(1, page), totalPages)

    const orders = total === 0
        ? []
        : await findOrderSummaries(
            { $and: [baseMatch, ORDER_TAB_FILTERS[activeTab]] },
            { skip: (currentPage - 1) * limit, limit }
        )

    return { orders, counts, total, totalPages, page: currentPage, limit, tab: activeTab, q: search }
}

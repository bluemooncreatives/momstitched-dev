import { connectDB } from '@/lib/databaseConnection'
import OrderModel from '@/models/Order.model'
import '@/models/Product.model'
import '@/models/ProductVariant.model'
import '@/models/Media.model'

const toPlainObject = (data) => JSON.parse(JSON.stringify(data))

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Attach any guest orders (user: null) that were placed with this email to the
 * now-verified account. Call this only once the account owner has proven control
 * of the email (email verification, OTP login, or Google sign-in) so we never
 * leak someone else's order onto an account that merely typed their address.
 *
 * Email is matched case-insensitively so a guest who checked out as "Jane@X.com"
 * still gets linked to an account registered as "jane@x.com".
 */
export const claimGuestOrders = async (userId, email) => {
    if (!userId || !email) return { matchedCount: 0, modifiedCount: 0 }

    await connectDB()

    const emailRegex = new RegExp(`^${escapeRegex(email.trim())}$`, 'i')

    const result = await OrderModel.updateMany(
        { email: emailRegex, user: null, deletedAt: null },
        { $set: { user: userId } }
    )

    return { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount }
}

export const getOrderDetailsByOrderId = async (orderId) => {
    if (!orderId) return null

    await connectDB()

    const order = await OrderModel.findOne({ order_id: orderId, deletedAt: null })
        .populate('products.productId', 'name slug')
        .populate({
            path: 'products.variantId',
            populate: { path: 'media', select: 'secure_url alt' }
        })
        .lean()

    return order ? toPlainObject(order) : null
}

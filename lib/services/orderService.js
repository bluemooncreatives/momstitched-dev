import { connectDB } from '@/lib/databaseConnection'
import OrderModel from '@/models/Order.model'
import '@/models/Product.model'
import '@/models/ProductVariant.model'
import '@/models/Media.model'

const toPlainObject = (data) => JSON.parse(JSON.stringify(data))

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

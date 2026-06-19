import { orderStatus } from "@/lib/utils"
import mongoose from "mongoose"
const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },

    city: {
        type: String,
        required: true
    },
    pincode: {
        type: String,
        required: true
    },
    landmark: {
        type: String,
        required: true
    },
    ordernote: {
        type: String,
        required: false
    },

    products: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            variantId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant', required: true },
            name: { type: String, required: true },
            qty: { type: Number, required: true },
            mrp: { type: Number, required: true },
            sellingPrice: { type: Number, required: true },
        }
    ],
    subtotal: {
        type: Number,
        required: true
    },
    couponDiscountAmount: {
        type: Number,
        required: true,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['cod', 'full', 'partial'],
        required: true,
        default: 'full'
    },
    partialPaymentPercentage: {
        type: Number,
        enum: [30, 50, 100],
        default: 100
    },
    paidAmount: {
        type: Number,
        required: true,
        default: 0
    },
    remainingAmount: {
        type: Number,
        default: 0
    },
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'partial_paid', 'fully_paid'],
        default: 'unpaid'
    },
    status: {
        type: String,
        enum: orderStatus,
        default: 'pending'
    },
    payment_id: {
        type: String,
        required: false
    },
    order_id: {
        type: String,
        required: true
    },
    deletedAt: {
        type: Date,
        default: null,
        index: true
    },
}, { timestamps: true })

orderSchema.index({ order_id: 1 })
orderSchema.index({ user: 1, deletedAt: 1 })

const OrderModel = mongoose.models.Order || mongoose.model('Order', orderSchema, 'orders')
export default OrderModel

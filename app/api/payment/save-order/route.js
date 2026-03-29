import { orderNotification } from "@/email/orderNotification";
import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { sendMail } from "@/lib/sendMail";
import { zSchema } from "@/lib/zodSchema";
import { isAuthenticated } from "@/lib/authentication";
import OrderModel from "@/models/Order.model";
import UserModel from "@/models/User.model";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils";
import { z } from "zod";

export async function POST(request) {
    try {
        await connectDB()
        const payload = await request.json()

        const productSchema = z.object({
            productId: z.string().length(24, 'Invalid product id format'),
            variantId: z.string().length(24, 'Invalid variant id format'),
            name: z.string().min(1),
            qty: z.number().min(1),
            mrp: z.number().nonnegative(),
            sellingPrice: z.number().nonnegative()
        })

        const orderSchema = zSchema.pick({
            name: true, email: true, phone: true, country: true, state: true, city: true, pincode: true, landmark: true, ordernote: true
        }).extend({
            userId: z.string().optional(),
            razorpay_payment_id: z.string().optional(),
            razorpay_order_id: z.string().optional(),
            razorpay_signature: z.string().optional(),
            order_id: z.string().optional(),
            subtotal: z.number().nonnegative(),
            discount: z.number().nonnegative(),
            couponDiscountAmount: z.number().nonnegative(),
            totalAmount: z.number().nonnegative(),
            products: z.array(productSchema).min(1, 'Products are required.'),
            paymentMethod: z.enum(['cod', 'full', 'partial']).optional(),
            partialPaymentPercentage: z.number().optional(),
            paidAmount: z.number().nonnegative().optional(),
            remainingAmount: z.number().nonnegative().optional()
        })


        const validate = orderSchema.safeParse(payload)
        if (!validate.success) {
            return response(false, 400, 'Invalid or missing fields.', { error: validate.error })
        }

        const validatedData = validate.data
        const auth = await isAuthenticated('user', request)

        const roundToTwo = (value) => Number(Number(value || 0).toFixed(2))
        const hasRazorpayPayload = Boolean(
            validatedData.razorpay_payment_id && validatedData.razorpay_order_id && validatedData.razorpay_signature
        )

        // Backward compatible fallback: old frontend sent only Razorpay fields without paymentMethod.
        const paymentMethod = validatedData.paymentMethod || (hasRazorpayPayload ? 'full' : null)
        if (!paymentMethod) {
            return response(false, 400, 'Payment method is required.')
        }
        const totalAmount = roundToTwo(validatedData.totalAmount)

        let partialPaymentPercentage = paymentMethod === 'partial'
            ? Number(validatedData.partialPaymentPercentage || 0)
            : 100

        if (paymentMethod === 'partial' && ![30, 50].includes(partialPaymentPercentage)) {
            return response(false, 400, 'Invalid partial payment percentage. Allowed values are 30 or 50.')
        }

        let expectedPaidAmount = 0
        let expectedRemainingAmount = totalAmount
        if (paymentMethod === 'full') {
            expectedPaidAmount = totalAmount
            expectedRemainingAmount = 0
        } else if (paymentMethod === 'partial') {
            expectedPaidAmount = Math.round((totalAmount * partialPaymentPercentage) / 100)
            expectedRemainingAmount = roundToTwo(totalAmount - expectedPaidAmount)
        }

        const paidAmount = roundToTwo(validatedData.paidAmount ?? expectedPaidAmount)
        const remainingAmount = roundToTwo(validatedData.remainingAmount ?? expectedRemainingAmount)

        if (Math.abs(paidAmount - expectedPaidAmount) > 0.01 || Math.abs(remainingAmount - expectedRemainingAmount) > 0.01) {
            return response(false, 400, 'Payment amount mismatch. Please review the selected payment mode and retry.')
        }

        // Use authenticated user (custom JWT or NextAuth) when available.
        let resolvedUserId = auth.isAuth ? auth.userId : validatedData.userId

        if (!resolvedUserId && validatedData.email) {
            const linkedUser = await UserModel.findOne({ email: validatedData.email }).select('_id').lean()
            if (linkedUser?._id) {
                resolvedUserId = linkedUser._id
            }
        }

        let paymentVerification = paymentMethod === 'cod'
        let orderId = validatedData.order_id || null
        let paymentId = null

        if (paymentMethod !== 'cod') {
            if (!hasRazorpayPayload) {
                return response(false, 400, 'Missing payment verification fields.')
            }

            const verification = validatePaymentVerification({
                order_id: validatedData.razorpay_order_id,
                payment_id: validatedData.razorpay_payment_id
            }, validatedData.razorpay_signature, process.env.RAZORPAY_KEY_SECRET)

            if (!verification) {
                return response(false, 400, 'Payment verification failed.')
            }

            paymentVerification = true
            orderId = validatedData.razorpay_order_id
            paymentId = validatedData.razorpay_payment_id
        }

        if (!orderId) {
            return response(false, 400, 'Order id is missing.')
        }

        const paymentStatus = paymentMethod === 'cod'
            ? 'unpaid'
            : paymentMethod === 'partial'
                ? 'partial_paid'
                : 'fully_paid'

        await OrderModel.create({
            user: resolvedUserId,
            name: validatedData.name,
            email: validatedData.email,
            phone: validatedData.phone,
            country: validatedData.country,
            state: validatedData.state,
            city: validatedData.city,
            pincode: validatedData.pincode,
            landmark: validatedData.landmark,
            ordernote: validatedData.ordernote,
            products: validatedData.products,
            discount: validatedData.discount,
            couponDiscountAmount: validatedData.couponDiscountAmount,
            totalAmount,
            subtotal: validatedData.subtotal,
            paymentMethod,
            partialPaymentPercentage,
            paidAmount,
            remainingAmount,
            paymentStatus,
            payment_id: paymentId,
            order_id: orderId,
            status: paymentVerification ? 'pending' : 'unverified'
        })

        try {
            const mailData = {
                order_id: orderId,
                orderDetailsUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/order-details/${orderId}`
            }

            await sendMail('Order placed successfully.', validatedData.email, orderNotification(mailData))

        } catch (error) {
            console.log(error)
        }

        const successMessage = paymentMethod === 'cod'
            ? 'Order placed successfully! Pay on delivery.'
            : paymentMethod === 'partial'
                ? `Order placed! Paid ${paidAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}. Remaining ${remainingAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} on delivery.`
                : 'Order placed successfully!'

        return response(true, 200, successMessage)

    } catch (error) {
        return catchError(error)
    }

}
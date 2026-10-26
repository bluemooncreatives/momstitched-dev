import { adminAlert } from "@/email/adminAlert"
import { ADMIN_EVENT } from "@/lib/adminNotificationEvents"
import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { adminUrl, notifyAdmins } from "@/lib/services/notificationService"
import { zSchema } from "@/lib/zodSchema"
import ProductModel from "@/models/Product.model"
import ReviewModel from "@/models/Review.model"
import UserModel from "@/models/User.model"
import { isValidObjectId } from "mongoose"
import { ADMIN_REVIEW_SHOW } from "@/routes/AdminPanelRoute"

export async function POST(request) {
    try {
        const auth = await isAuthenticated('user', request)
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()

        const schema = zSchema.pick({
            product: true,
            userId: true,
            rating: true,
            title: true,
            review: true
        })

        const validate = schema.safeParse(payload)
        if (!validate.success) {
            return response(false, 400, 'Invalid or missing fields.', validate.error)
        }

        const { product, title, review } = validate.data
        const rating = Number(validate.data.rating)

        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return response(false, 400, 'Rating must be between 1 and 5.')
        }
        if (!isValidObjectId(product)) {
            return response(false, 400, 'Invalid product.')
        }

        const productData = await ProductModel.findOne({ _id: product, deletedAt: null }).select('name slug').lean()
        if (!productData) {
            return response(false, 404, 'Product not found.')
        }

        // The review always belongs to the signed-in account, never to a
        // client-supplied user id.
        const newReview = new ReviewModel({
            product: product,
            user: auth.userId,
            rating: rating,
            title: title,
            review: review,
        })

        await newReview.save()

        const reviewer = await UserModel.findById(auth.userId).select('name email').lean()
        const reviewerName = reviewer?.name || 'A customer'
        const stars = `${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}`

        await notifyAdmins({
            type: ADMIN_EVENT.REVIEW_RECEIVED,
            dedupeKey: `${ADMIN_EVENT.REVIEW_RECEIVED}:${newReview._id}`,
            title: `${rating}★ review on ${productData.name}`,
            message: `${reviewerName}: “${title}”`,
            link: ADMIN_REVIEW_SHOW,
            meta: { reviewId: newReview._id.toString(), productId: product, rating },
            email: {
                subject: `New ${rating}★ review on ${productData.name}`,
                html: adminAlert({
                    label: 'New Review',
                    title: `${rating}★ review on ${productData.name}`,
                    intro: `${reviewerName} just reviewed one of your products.`,
                    rows: [
                        { label: 'Rating', value: `${stars} (${rating}/5)` },
                        { label: 'Title', value: title },
                        { label: 'Review', value: review },
                        { label: 'Customer', value: reviewer?.email ? `${reviewerName} · ${reviewer.email}` : reviewerName },
                    ],
                    ctaLabel: 'Moderate reviews',
                    ctaUrl: adminUrl(ADMIN_REVIEW_SHOW),
                }),
            },
        })

        return response(true, 200, 'Your review submitted successfully.')

    } catch (error) {
        return catchError(error)
    }
}

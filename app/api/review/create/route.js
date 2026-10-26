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
import { NEW_REVIEWS_PUBLISHED } from "@/lib/reviewModeration"
import { revalidateReviewCaches } from "@/lib/services/reviewCacheService"

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
            isPublished: NEW_REVIEWS_PUBLISHED,
        })

        await newReview.save()

        // A live review changes the product's public rating straight away.
        if (NEW_REVIEWS_PUBLISHED) {
            revalidateReviewCaches()
        }

        const reviewer = await UserModel.findById(auth.userId).select('name email').lean()
        const reviewerName = reviewer?.name || 'A customer'
        const stars = `${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}`

        await notifyAdmins({
            type: ADMIN_EVENT.REVIEW_RECEIVED,
            dedupeKey: `${ADMIN_EVENT.REVIEW_RECEIVED}:${newReview._id}`,
            title: `${rating}★ review on ${productData.name}${NEW_REVIEWS_PUBLISHED ? '' : ' (awaiting approval)'}`,
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
                        { label: 'Status', value: NEW_REVIEWS_PUBLISHED ? 'Live on the storefront' : 'Draft — publish it to show it on the storefront' },
                    ],
                    ctaLabel: 'Moderate reviews',
                    ctaUrl: adminUrl(ADMIN_REVIEW_SHOW),
                }),
            },
        })

        return response(
            true,
            200,
            NEW_REVIEWS_PUBLISHED
                ? 'Your review submitted successfully.'
                : 'Thanks! Your review has been submitted and will appear once it is approved.',
            { isPublished: NEW_REVIEWS_PUBLISHED }
        )

    } catch (error) {
        return catchError(error)
    }
}

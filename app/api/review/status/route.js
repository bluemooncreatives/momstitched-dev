import mongoose from "mongoose"
import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { revalidateReviewCaches } from "@/lib/services/reviewCacheService"
import ReviewModel from "@/models/Review.model"

const MAX_IDS = 500

// Keep only well-formed, unique ObjectIds so a malformed payload can't throw a
// CastError halfway through a bulk update.
const sanitizeIds = (rawIds) => {
    if (!Array.isArray(rawIds)) return []
    return [...new Set(rawIds.map(String))]
        .filter((id) => mongoose.isValidObjectId(id))
        .slice(0, MAX_IDS)
}

// PUT — publish or unpublish reviews. Body: { ids: [id, ...], isPublished: boolean }.
// Trashed reviews are skipped: they are already off the storefront, and
// restoring one brings it back with whatever status it had.
export async function PUT(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json().catch(() => ({}))

        if (typeof payload?.isPublished !== 'boolean') {
            return response(false, 400, 'isPublished must be true or false.')
        }

        const ids = sanitizeIds(payload.ids)
        if (ids.length === 0) {
            return response(false, 400, 'Invalid or empty id list.')
        }

        const { isPublished } = payload
        const result = await ReviewModel.updateMany(
            { _id: { $in: ids }, deletedAt: null },
            { $set: { isPublished } }
        )

        if (!result.matchedCount) {
            return response(false, 404, 'No matching reviews found.')
        }

        if (result.modifiedCount) {
            revalidateReviewCaches()
        }

        const noun = result.matchedCount === 1 ? 'Review' : `${result.matchedCount} reviews`
        return response(
            true,
            200,
            isPublished ? `${noun} published.` : `${noun} moved to drafts.`,
            { matched: result.matchedCount, modified: result.modifiedCount }
        )
    } catch (error) {
        return catchError(error)
    }
}

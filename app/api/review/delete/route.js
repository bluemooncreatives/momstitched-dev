import mongoose from "mongoose";
import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { isAuthenticated } from "@/lib/authentication";
import { revalidateReviewCaches } from "@/lib/services/reviewCacheService";
import ReviewModel from "@/models/Review.model";

// Keep only well-formed, unique ObjectIds so a malformed payload can't throw a CastError.
const sanitizeIds = (rawIds) => {
    if (!Array.isArray(rawIds)) return []
    return [...new Set(rawIds.map(String))].filter((id) => mongoose.isValidObjectId(id))
}

export async function PUT(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()

        const ids = sanitizeIds(payload.ids)
        const deleteType = payload.deleteType

        if (ids.length === 0) {
            return response(false, 400, 'Invalid or empty id list.')
        }

        if (!['SD', 'RSD'].includes(deleteType)) {
            return response(false, 400, 'Invalid delet operation. Delete type should be SD or RSD for this route.')
        }

        const data = await ReviewModel.find({ _id: { $in: ids } }).lean()
        if (!data.length) {
            return response(false, 404, 'Data not found.')
        }

        if (deleteType === 'SD') {
            await ReviewModel.updateMany({ _id: { $in: ids } }, { $set: { deletedAt: new Date().toISOString() } });
        } else {
            await ReviewModel.updateMany({ _id: { $in: ids } }, { $set: { deletedAt: null } });
        }

        // Trashing or restoring a live review changes the public rating.
        revalidateReviewCaches()

        return response(true, 200, deleteType === 'SD' ? 'Data moved into trash.' : "Data restored.")

    } catch (error) {
        return catchError(error)
    }
}


export async function DELETE(request) {

    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()

        const ids = sanitizeIds(payload.ids)
        const deleteType = payload.deleteType

        if (ids.length === 0) {
            return response(false, 400, 'Invalid or empty id list.')
        }

        if (deleteType !== 'PD') {
            return response(false, 400, 'Invalid delet operation. Delete type should be PD for this route.')
        }

        // Permanent delete only applies to reviews already in the trash.
        const trashedFilter = { _id: { $in: ids }, deletedAt: { $ne: null } }
        const data = await ReviewModel.find(trashedFilter).select('_id').lean()
        if (!data.length) {
            return response(false, 404, 'Data not found.')
        }

        // Trashed reviews are already off the storefront — no cache to refresh.
        await ReviewModel.deleteMany(trashedFilter)

        return response(true, 200, 'Data deleted permanently')
    } catch (error) {
        return catchError(error)
    }
}

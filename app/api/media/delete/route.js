import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { revalidateCatalogue } from "@/lib/catalogueCache";
import { permanentlyDeleteMedia } from "@/lib/mediaLibrary";
import MediaModel from "@/models/Media.model";
import { isAuthenticated } from "@/lib/authentication";
import { isValidObjectId } from "mongoose";

const readIds = (payload) => {
    const ids = payload?.ids
    if (!Array.isArray(ids) || ids.length === 0 || !ids.every(isValidObjectId)) return null
    return [...new Set(ids.map(String))]
}

export async function PUT(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()

        const ids = readIds(payload)
        const deleteType = payload.deleteType

        if (!ids) {
            return response(false, 400, 'Invalid or empty id list.')
        }

        if (!['SD', 'RSD'].includes(deleteType)) {
            return response(false, 400, 'Invalid delet operation. Delete type should be SD or RSD for this route.')
        }

        // Rows mid-way through a permanent delete can't be trashed or restored.
        const filter = { _id: { $in: ids }, deletingAt: null }
        const media = await MediaModel.find(filter).select('_id').lean()
        if (!media.length) {
            return response(false, 404, 'Data not found.')
        }

        if (deleteType === 'SD') {
            await MediaModel.updateMany(filter, { $set: { deletedAt: new Date().toISOString() } });
        } else {
            await MediaModel.updateMany(filter, { $set: { deletedAt: null } });
        }

        // Trashed images drop out of the storefront; restored ones come back.
        revalidateCatalogue()

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

        const ids = readIds(payload)
        if (!ids) {
            return response(false, 400, 'Invalid or empty id list.')
        }

        if (payload.deleteType !== 'PD') {
            return response(false, 400, 'Invalid delet operation. Delete type should be PD for this route.')
        }

        const { deleted, skipped, failed } = await permanentlyDeleteMedia(ids)
        if (deleted.length) revalidateCatalogue()

        const result = { deleted, skipped, failed }

        if (!deleted.length) {
            const reason = failed.length
                ? 'The image host could not delete the selected media. Nothing was removed — please try again.'
                : skipped[0]?.reason || 'Nothing was deleted.'
            return response(false, failed.length ? 502 : 409, reason, result)
        }

        const notes = []
        if (skipped.length) notes.push(`${skipped.length} skipped (${skipped[0].reason.replace(/\.$/, '')})`)
        if (failed.length) notes.push(`${failed.length} could not be deleted by the image host and stay in the trash`)
        const message = notes.length
            ? `Deleted ${deleted.length} permanently. ${notes.join('; ')}.`
            : 'Data deleted permanently'

        return response(true, 200, message, result)
    } catch (error) {
        return catchError(error)
    }
}

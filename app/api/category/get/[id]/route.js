import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { isAuthenticated } from "@/lib/authentication";
import { isValidObjectId } from "mongoose";
import CategoryModel from "@/models/Category.model";
import "@/models/Media.model";

export async function GET(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()

        const getParams = await params
        const id = getParams.id

        const filter = {
            deletedAt: null
        }

        if (!isValidObjectId(id)) {
            return response(false, 400, 'Invalid object id.')
        }

        filter._id = id

        const getCategory = await CategoryModel.findOne(filter)
            .populate('coverImage', '_id secure_url alt deletedAt deletingAt')
            .lean()

        if (!getCategory) {
            return response(false, 404, 'Category not found.')
        }

        // The populated cover is null if its media was permanently deleted;
        // trashed covers come back with deletedAt so the form can flag them.
        return response(true, 200, 'Category found.', getCategory)

    } catch (error) {
        return catchError(error)
    }
}
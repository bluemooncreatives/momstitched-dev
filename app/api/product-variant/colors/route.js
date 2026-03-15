import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import ProductVariantModel from "@/models/ProductVariant.model";

const CACHE_HEADERS = {
    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
}

export async function GET() {
    try {

        await connectDB()

        const getColor = await ProductVariantModel.distinct('color', { deletedAt: null })

        if (!getColor) {
            return response(false, 404, 'Color not found.', {}, { headers: CACHE_HEADERS })
        }

        return response(true, 200, 'Color found.', getColor, { headers: CACHE_HEADERS })

    } catch (error) {
        return catchError(error)
    }
}
import { isAuthenticated } from "@/lib/authentication"
import { revalidateCatalogue } from "@/lib/catalogueCache"
import { categoryUpdateSchema } from "@/lib/categoryConfig"
import { categorySaveProblem, coverFields } from "@/lib/categorySave"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import CategoryModel from "@/models/Category.model"

export async function PUT(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()

        const validate = categoryUpdateSchema.safeParse(payload)
        if (!validate.success) {
            return response(false, 400, validate.error.issues[0]?.message || 'Invalid or missing fields.', validate.error)
        }

        const data = validate.data

        const getCategory = await CategoryModel.findOne({ deletedAt: null, _id: data._id })
        if (!getCategory) {
            return response(false, 404, 'Data not found.')
        }

        const problem = await categorySaveProblem(
            { ...data, coverImage: Object.prototype.hasOwnProperty.call(payload, 'coverImage') ? data.coverImage : getCategory.coverImage },
            getCategory.coverImage
        )
        if (problem) return response(false, problem.status, problem.message)

        // Only fields the client actually sent are written, so a caller that
        // doesn't know about covers or landing copy can't wipe them via defaults.
        const sent = (key) => Object.prototype.hasOwnProperty.call(payload, key)

        getCategory.name = data.name
        // Keeps the outgoing slug in routeSlugs so /category/{old} redirects here.
        getCategory.changeSlug(data.slug)
        if (sent('coverImage')) getCategory.set(coverFields(data))
        if (sent('intro')) getCategory.intro = data.intro
        if (sent('faqs')) getCategory.faqs = data.faqs
        await getCategory.save()

        // Name/slug/cover/copy ripple to shop filters, homepage tiles, footer,
        // product breadcrumbs and canonical URLs, landing pages and the sitemap.
        revalidateCatalogue()

        return response(true, 200, 'Category updated successfully.')

    } catch (error) {
        return catchError(error)
    }
}

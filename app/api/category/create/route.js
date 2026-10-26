import { isAuthenticated } from "@/lib/authentication"
import { revalidateCatalogue } from "@/lib/catalogueCache"
import { categorySchema } from "@/lib/categoryConfig"
import { categorySaveProblem, coverFields } from "@/lib/categorySave"
import { connectDB } from "@/lib/databaseConnection"
import { catchError,  response } from "@/lib/helperFunction"
import CategoryModel from "@/models/Category.model"

export async function POST(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()

        const validate = categorySchema.safeParse(payload)
        if (!validate.success) {
            return response(false, 400, validate.error.issues[0]?.message || 'Invalid or missing fields.', validate.error)
        }

        const data = validate.data

        const problem = await categorySaveProblem(data)
        if (problem) return response(false, problem.status, problem.message)

        const newCategory = new CategoryModel({
            name: data.name,
            slug: data.slug,
            ...coverFields(data),
            intro: data.intro,
            faqs: data.faqs,
        })

        await newCategory.save()

        // Shop filters, homepage tiles, footer, landing pages and the sitemap.
        revalidateCatalogue()

        return response(true, 200, 'Category added successfully.', { _id: newCategory._id })

    } catch (error) {
        return catchError(error)
    }
}

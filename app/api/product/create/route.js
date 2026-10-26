import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { zSchema } from "@/lib/zodSchema"
import { validatePricing } from "@/lib/pricing"
import { revalidateCatalogue } from "@/lib/catalogueCache"
import { productSaveProblem } from "@/lib/productSave"
import ProductModel from "@/models/Product.model"
import { encode } from "entities"

export async function POST(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()
        if (payload && payload.sizeGuide === '') {
            payload.sizeGuide = null
        }

        const schema = zSchema.pick({
            name: true,
            parentSku: true,
            slug: true,
            category: true,
            sizeGuide: true,
            mrp: true,
            sellingPrice: true,
            discountPercentage: true,
            description: true,
            media: true
        })


        const validate = schema.safeParse(payload)
        if (!validate.success) {
            return response(false, 400, 'Invalid or missing fields.', validate.error)
        }

        const productData = validate.data

        // Server is authoritative on pricing: enforce SP <= MRP and derive the
        // discount, ignoring whatever the client sent.
        const pricing = validatePricing(productData.mrp, productData.sellingPrice)
        if (!pricing.ok) {
            return response(false, 400, pricing.message)
        }

        const problem = await productSaveProblem(productData)
        if (problem) return response(false, problem.status, problem.message)

        const newProduct = new ProductModel({
            name: productData.name,
            parentSku: productData.parentSku,
            slug: productData.slug,
            category: productData.category,
            sizeGuide: productData.sizeGuide ?? null,
            mrp: productData.mrp,
            sellingPrice: productData.sellingPrice,
            discountPercentage: pricing.discountPercentage,
            description: encode(productData.description),
            media: productData.media,
        })

        await newProduct.save()

        revalidateCatalogue()

        return response(true, 200, 'Product added successfully.', { _id: newProduct._id })

    } catch (error) {
        return catchError(error)
    }
}
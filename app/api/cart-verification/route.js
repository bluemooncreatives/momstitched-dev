import mongoose from "mongoose";
import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { MAX_CART_QTY, MIN_CART_QTY } from "@/lib/cartConstants";
import ProductVariantModel from "@/models/ProductVariant.model";
import "@/models/Product.model";
import "@/models/Media.model";
import { liveMediaPopulate } from "@/lib/productMedia";

// Generous upper bound on distinct lines; stops a tampered payload from turning
// this public endpoint into an expensive query.
const MAX_CART_LINES = 100

const clampQty = (value) => {
    const n = Math.floor(Number(value))
    if (!Number.isFinite(n)) return MIN_CART_QTY
    return Math.min(MAX_CART_QTY, Math.max(MIN_CART_QTY, n))
}

// Re-prices cart lines against the live catalogue. Lines whose variant or
// product was deleted (hard or soft) are omitted — callers treat a missing line
// as "no longer available". Response `data` stays a plain array of cart lines.
export async function POST(request) {
    try {
        await connectDB()
        const payload = await request.json().catch(() => [])

        const cartItems = (Array.isArray(payload) ? payload : [])
            .filter((cartItem) => mongoose.Types.ObjectId.isValid(cartItem?.variantId))
            .slice(0, MAX_CART_LINES)

        const variantIds = [...new Set(cartItems.map((cartItem) => String(cartItem.variantId)))]
        const variants = variantIds.length > 0
            ? await ProductVariantModel.find({ _id: { $in: variantIds }, deletedAt: null })
                .populate({ path: 'product', match: { deletedAt: null }, select: 'name slug' })
                // Main image = first live image in saved order.
                .populate(liveMediaPopulate('secure_url'))
                .lean()
            : []

        const variantById = new Map(
            variants
                .filter((variant) => variant.product) // product soft-deleted → populate match yields null
                .map((variant) => [variant._id.toString(), variant])
        )

        const seen = new Set()
        const verifiedCartData = cartItems.map((cartItem) => {
            const key = String(cartItem.variantId)
            const variant = variantById.get(key)
            if (!variant || seen.has(key)) {
                return
            }
            seen.add(key)
            return {
                productId: variant.product._id,
                variantId: variant._id,
                name: variant.product.name,
                url: variant.product.slug,
                size: variant.size,
                color: variant.color,
                mrp: variant.mrp,
                sellingPrice: variant.sellingPrice,
                media: variant?.media?.[0]?.secure_url,
                qty: clampQty(cartItem.qty),
            }
        }).filter(Boolean)


        return response(true, 200, 'Verified Cart Data.', verifiedCartData)

    } catch (error) {
        return catchError(error)
    }
}

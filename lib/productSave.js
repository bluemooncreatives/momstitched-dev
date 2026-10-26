import { findUnavailableMedia, unavailableMediaMessage } from '@/lib/mediaLibrary'
import CategoryModel from '@/models/Category.model'
import ProductModel from '@/models/Product.model'

// Shared create/update checks: live category, live images, and a slug that no
// other product owns now or used before (its old URLs still redirect there).
export const productSaveProblem = async ({ _id, slug, category, media }) => {
    const liveCategory = await CategoryModel.exists({ _id: category, deletedAt: null })
    if (!liveCategory) return { status: 400, message: 'Please choose an active category.' }

    const unavailable = await findUnavailableMedia(media)
    if (unavailable.length) return { status: 400, message: unavailableMediaMessage(unavailable.length) }

    const slugOwner = await ProductModel.exists({
        ...(_id ? { _id: { $ne: _id } } : {}),
        $or: [{ slug }, { routeSlugs: slug }],
    })
    if (slugOwner) {
        return { status: 409, message: 'This slug is already used by another product (now or as an old URL). Choose a different one.' }
    }
    return null
}

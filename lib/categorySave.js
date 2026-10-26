import { findUnavailableMedia } from '@/lib/mediaLibrary'
import CategoryModel from '@/models/Category.model'

// Shared create/update checks. A newly chosen cover must be live media; an
// unchanged cover may stay even if it was trashed since (the storefront falls
// back, and restoring the media restores the cover).
export const categorySaveProblem = async ({ _id, name, slug, coverImage }, previousCover = null) => {
    const exclude = _id ? { _id: { $ne: _id } } : {}

    const slugOwner = await CategoryModel.exists({ ...exclude, $or: [{ slug }, { routeSlugs: slug }] })
    if (slugOwner) {
        return { status: 409, message: 'This slug is already used by another category (now or as an old URL). Choose a different one.' }
    }

    const nameOwner = await CategoryModel.exists({ ...exclude, name })
    if (nameOwner) return { status: 409, message: 'A category with this name already exists.' }

    if (coverImage && String(coverImage) !== String(previousCover || '')) {
        const unavailable = await findUnavailableMedia([coverImage])
        if (unavailable.length) return { status: 400, message: 'The chosen cover image is in the trash or no longer exists. Pick another one.' }
    }
    return null
}

// Normalised cover fields: removing the cover also clears its alt/position.
export const coverFields = ({ coverImage, coverAlt, coverPosition }) => coverImage
    ? { coverImage, coverAlt: coverAlt || '', coverPosition: coverPosition || 'center' }
    : { coverImage: null, coverAlt: '', coverPosition: 'center' }

import { z } from 'zod'

// Ordered product/variant images. The array order IS the display order: index 0
// is the main image (cards, cart, social previews), the rest follow in order.
// Shared by the admin form (client) and the API routes (server).

export const MAX_PRODUCT_MEDIA = 15

export const mediaLimitMessage = `You can add up to ${MAX_PRODUCT_MEDIA} images.`

// Dedupe while keeping the first occurrence, so order survives.
export const dedupeIds = (ids = []) => {
    const seen = new Set()
    return ids.map(String).filter((id) => (seen.has(id) ? false : seen.add(id)))
}

export const mediaIdsSchema = z
    .array(z.string().regex(/^[a-f\d]{24}$/i, 'Invalid media id.'))
    .transform(dedupeIds)
    .refine((ids) => ids.length >= 1, 'Please select at least one image.')
    .refine((ids) => ids.length <= MAX_PRODUCT_MEDIA, mediaLimitMessage)

// Mongoose populate for storefront reads. Populate maps documents back onto the
// saved id array, so order is kept; `match` drops trashed / deleting media.
export const liveMediaPopulate = (select = 'secure_url alt') => ({
    path: 'media',
    match: { deletedAt: null, deletingAt: null },
    select,
})

/**
 * $lookup stage that resolves `media` ids IN SAVED ORDER. A plain
 * `$lookup ... $in` returns documents in collection order, which silently
 * changes which photo is the "main" one.
 */
export const orderedMediaLookup = ({ ids = '$media', as = 'media', liveOnly = true, project = { _id: 1, secure_url: 1, alt: 1 }, limit } = {}) => ({
    $lookup: {
        from: 'medias',
        let: { mediaIds: { $ifNull: [ids, []] } },
        pipeline: [
            {
                $match: {
                    $expr: {
                        $and: [
                            { $in: ['$_id', '$$mediaIds'] },
                            ...(liveOnly
                                ? [
                                    { $eq: [{ $ifNull: ['$deletedAt', null] }, null] },
                                    { $eq: [{ $ifNull: ['$deletingAt', null] }, null] },
                                ]
                                : []),
                        ],
                    },
                },
            },
            { $addFields: { __order: { $indexOfArray: ['$$mediaIds', '$_id'] } } },
            { $sort: { __order: 1 } },
            ...(limit ? [{ $limit: limit }] : []),
            { $project: project },
        ],
        as,
    },
})

// Draft/Live moderation rules for product reviews, shared by every storefront
// query, the admin panel and the create route so "what counts as live" is
// defined exactly once.
//
// Reviews written before moderation existed have no `isPublished` field; they
// were already public, so anything that isn't explicitly `false` is live.

// Whether a newly submitted customer review goes straight to the storefront.
// Flip to false to hold every new review as a draft until an admin publishes it.
export const NEW_REVIEWS_PUBLISHED = true

// For find()/countDocuments()/$match on the reviews collection.
export const LIVE_REVIEW_FILTER = { deletedAt: null, isPublished: { $ne: false } }

// For $lookup sub-pipelines that match with $expr.
export const LIVE_REVIEW_EXPR = { $ne: ['$isPublished', false] }

export const isReviewLive = (review) => review?.isPublished !== false

// Admin list filter: 'live' | 'draft' | anything else = all.
export const reviewStatusFilter = (status) => {
    if (status === 'live') return { isPublished: { $ne: false } }
    if (status === 'draft') return { isPublished: false }
    return {}
}

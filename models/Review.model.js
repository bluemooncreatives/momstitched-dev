import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    rating: {
        type: Number,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    review: {
        type: String,
        required: true,
    },

    // Draft/Live moderation. Drafts stay in the admin panel but are excluded
    // from every storefront list and rating. Legacy rows without the field are
    // treated as live (see lib/reviewModeration.js).
    isPublished: {
        type: Boolean,
        default: true,
    },

    deletedAt: {
        type: Date,
        default: null,
        index: true
    },

}, { timestamps: true })

reviewSchema.index({ product: 1, deletedAt: 1, isPublished: 1 })
reviewSchema.index({ user: 1, product: 1, deletedAt: 1 })

const ReviewModel = mongoose.models.Review || mongoose.model('Review', reviewSchema, 'reviews')
export default ReviewModel

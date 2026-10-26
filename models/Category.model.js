import mongoose from "mongoose";
import { COVER_POSITIONS } from "@/lib/categoryConfig";

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    // Previous slugs; /category/{old} 308s to the current slug. See changeSlug().
    routeSlugs: {
        type: [{ type: String, lowercase: true, trim: true }],
        default: [],
        index: true,
    },

    // Storefront tile / landing hero image. Kept even if the media is later
    // trashed (the storefront then falls back), so restoring it restores the cover.
    coverImage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Media',
        default: null,
    },
    coverAlt: {
        type: String,
        trim: true,
        default: '',
    },
    coverPosition: {
        type: String,
        enum: COVER_POSITIONS,
        default: 'center',
    },

    // Landing page (/category/{slug}) copy. Paragraphs are separated by blank lines.
    intro: {
        type: String,
        trim: true,
        default: '',
    },
    faqs: {
        type: [{
            _id: false,
            q: { type: String, trim: true, required: true },
            a: { type: String, trim: true, required: true },
        }],
        default: [],
    },

    deletedAt: {
        type: Date,
        default: null,
        index: true
    },

}, { timestamps: true })

categorySchema.methods.changeSlug = function (nextSlug) {
    const next = String(nextSlug).trim().toLowerCase()
    if (next === this.slug) return
    this.routeSlugs = [...new Set([...(this.routeSlugs || []), this.slug])].filter((slug) => slug && slug !== next)
    this.slug = next
}

const CategoryModel = mongoose.models.Category || mongoose.model('Category', categorySchema, 'categories')
export default CategoryModel

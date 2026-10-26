import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema({
    asset_id: {
        type: String,
        required: true,
        trim: true
    },
    // One library row per Cloudinary asset — makes re-registering an upload
    // (a retry after a network blip) idempotent instead of duplicating it.
    public_id: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    // Facts copied from Cloudinary's own record at registration time.
    bytes: Number,
    width: Number,
    height: Number,
    format: {
        type: String,
        trim: true
    },
    path: {
        type: String,
        required: true,
        trim: true
    },
    thumbnail_url: {
        type: String,
        required: true,
        trim: true
    },
    secure_url: {
        type: String,
        required: true,
        trim: true
    },

    alt: {
        type: String,
        trim: true
    },
    title: {
        type: String,
        trim: true
    },
    deletedAt: {
        type: Date,
        default: null,
        index: true
    },
    // Set while a permanent delete is talking to Cloudinary. The row is only
    // removed once Cloudinary confirms; until then it is hidden everywhere.
    deletingAt: {
        type: Date,
        default: null
    },

}, { timestamps: true })


const MediaModel = mongoose.models.Media || mongoose.model('Media', mediaSchema, 'medias')
export default MediaModel
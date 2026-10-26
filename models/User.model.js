import mongoose, { mongo } from "mongoose";
import bcrypt from 'bcryptjs'
const userSchema = new mongoose.Schema({
    role: {
        type: String,
        required: true,
        enum: ['user', 'admin'],
        default: 'user'
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: false,
        trim: true,
        select: false
    },
    googleId: {
        type: String,
        trim: true,
        sparse: true
    },
    googleProfile: {
        givenName: {
            type: String,
            trim: true,
        },
        familyName: {
            type: String,
            trim: true,
        },
        locale: {
            type: String,
            trim: true,
        },
        picture: {
            type: String,
            trim: true,
        },
        emailVerified: {
            type: Boolean,
            default: false,
        },
        raw: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    avatar: {
        url: {
            type: String,
            trim: true
        },
        public_id: {
            type: String,
            trim: true
        },
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    phone: {
        type: String,
        trim: true,
    },
    // Saved "default" shipping address — a convenience copy used to prefill
    // checkout. The authoritative shipping address for any order is the
    // denormalised snapshot stored on that Order, never this live record.
    address: {
        type: String,
        trim: true,
    },
    landmark: {
        type: String,
        trim: true,
    },
    city: {
        type: String,
        trim: true,
    },
    state: {
        type: String,
        trim: true,
    },
    pincode: {
        type: String,
        trim: true,
    },
    country: {
        type: String,
        trim: true,
    },
    // Saved products. Capped at MAX_WISHLIST_ITEMS (lib/wishlist.js) by the
    // wishlist service. Hidden by default so the list never rides along on
    // unrelated user queries (admin customer table, auth lookups, …).
    wishlist: {
        type: [{
            _id: false,
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            addedAt: { type: Date, default: Date.now },
        }],
        default: [],
        select: false,
    },
    // Bumped on every wishlist write. The merge (read → union → write) uses it as
    // an optimistic-concurrency token so two tabs signing in at once can't
    // clobber each other's changes.
    wishlistVersion: {
        type: Number,
        default: 0,
        select: false,
    },
    deletedAt: {
        type: Date,
        default: null,
        index: true
    },
}, { timestamps: true })

userSchema.index({ email: 1, deletedAt: 1 })

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10)
    next();
})


userSchema.methods = {
    comparePassword: async function (password) {
        return await bcrypt.compare(password, this.password)
    }
}

const UserModel = mongoose.models.User || mongoose.model('User', userSchema, 'users')
export default UserModel

import mongoose from "mongoose";

// One-time secrets sent to (or derived from) a user's inbox. Each record is
// scoped to a purpose so a code issued for one flow can never be redeemed in
// another (e.g. a password-reset code can't be used to log in).
export const OTP_PURPOSES = ['login', 'reset-password', 'reset-token']

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    purpose: {
        type: String,
        required: true,
        enum: OTP_PURPOSES
    },
    // HMAC of the code/token — the plaintext is only ever in the email/response.
    codeHash: {
        type: String,
        required: true
    },
    // Wrong guesses against this code. Capped in lib/otp.js to stop brute force.
    attempts: {
        type: Number,
        default: 0
    },
    // How many codes have been sent in this window (carried across resends).
    sendCount: {
        type: Number,
        default: 1
    },
    lastSentAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 10 * 60 * 1000)
    }
}, { timestamps: true })

otpSchema.index({ email: 1, purpose: 1 }, { unique: true })
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const OTPModel = mongoose.models.OTP || mongoose.model('OTP', otpSchema, 'otps')
export default OTPModel

import crypto from 'crypto'
import OTPModel from '@/models/Otp.model'

export const OTP_TTL_MS = 10 * 60 * 1000
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000
export const OTP_MAX_SENDS = 5
export const OTP_MAX_ATTEMPTS = 5
export const RESET_TOKEN_TTL_MS = 15 * 60 * 1000

// Keyed hash so a leaked `otps` collection can't be reversed offline — a plain
// SHA-256 of a 6-digit code is brute-forced instantly.
const hashSecret = (value) => crypto
    .createHmac('sha256', process.env.SECRET_KEY)
    .update(String(value))
    .digest('hex')

const safeEqual = (a, b) => {
    const bufA = Buffer.from(a, 'hex')
    const bufB = Buffer.from(b, 'hex')
    return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB)
}

// crypto.randomInt is a CSPRNG and unbiased over [0, 1_000_000).
export const generateOTP = () => crypto.randomInt(0, 1_000_000).toString().padStart(6, '0')

/**
 * Create (or replace) the code for `email` + `purpose`.
 * Enforces a per-code resend cooldown and a cap on sends within the code's
 * lifetime; both counters survive resends so they can't be reset by spamming.
 *
 * @param {object} opts
 * @param {boolean} [opts.requirePending] Only re-issue when a live code already
 *   exists — used by the login resend, which must not bypass the password step.
 * @returns {Promise<{ ok: true, otp: string } | { ok: false, reason: 'cooldown'|'limit'|'no_pending', retryAfter?: number }>}
 */
export const issueOtp = async ({ email, purpose, requirePending = false }) => {
    const now = Date.now()
    const existing = await OTPModel.findOne({ email, purpose, expiresAt: { $gt: new Date(now) } }).lean()

    if (requirePending && !existing) {
        return { ok: false, reason: 'no_pending' }
    }

    if (existing) {
        const sinceLastSend = now - new Date(existing.lastSentAt || existing.createdAt).getTime()
        if (sinceLastSend < OTP_RESEND_COOLDOWN_MS) {
            return { ok: false, reason: 'cooldown', retryAfter: Math.ceil((OTP_RESEND_COOLDOWN_MS - sinceLastSend) / 1000) }
        }
        if ((existing.sendCount || 1) >= OTP_MAX_SENDS) {
            return { ok: false, reason: 'limit' }
        }
    }

    const otp = generateOTP()
    await OTPModel.findOneAndUpdate(
        { email, purpose },
        {
            $set: {
                codeHash: hashSecret(otp),
                attempts: 0,
                sendCount: existing ? (existing.sendCount || 1) + 1 : 1,
                lastSentAt: new Date(now),
                expiresAt: new Date(now + OTP_TTL_MS),
            }
        },
        { upsert: true, setDefaultsOnInsert: true }
    )

    return { ok: true, otp }
}

/**
 * Check a code and consume it on success. An attempt is reserved atomically
 * before comparing, so concurrent guesses can't exceed OTP_MAX_ATTEMPTS, and the
 * code is deleted conditionally so it can only be redeemed once.
 *
 * @returns {Promise<{ ok: true } | { ok: false, reason: 'invalid'|'too_many_attempts' }>}
 */
export const verifyOtp = async ({ email, purpose, otp }) => {
    const record = await OTPModel.findOneAndUpdate(
        { email, purpose, expiresAt: { $gt: new Date() }, attempts: { $lt: OTP_MAX_ATTEMPTS } },
        { $inc: { attempts: 1 } },
        { new: true }
    ).lean()

    if (!record) {
        // The exhausted record is left in place (until it expires) so its send
        // counters keep throttling new codes — deleting it would reset them.
        const exhausted = await OTPModel.exists({ email, purpose, expiresAt: { $gt: new Date() } })
        return { ok: false, reason: exhausted ? 'too_many_attempts' : 'invalid' }
    }

    if (!safeEqual(record.codeHash, hashSecret(otp))) {
        return { ok: false, reason: record.attempts >= OTP_MAX_ATTEMPTS ? 'too_many_attempts' : 'invalid' }
    }

    const { deletedCount } = await OTPModel.deleteOne({ _id: record._id, codeHash: record.codeHash })
    return deletedCount === 1 ? { ok: true } : { ok: false, reason: 'invalid' }
}

export const otpErrorMessage = (reason, retryAfter) => {
    switch (reason) {
        case 'cooldown': return `Please wait ${retryAfter} seconds before requesting another code.`
        case 'limit': return 'Too many codes requested. Please try again in a few minutes.'
        case 'no_pending': return 'Your sign-in session has expired. Please sign in again.'
        case 'too_many_attempts': return 'Too many incorrect attempts. Please request a new code.'
        default: return 'Invalid or expired code.'
    }
}

/**
 * Proof that the user just verified a password-reset code. Random 256-bit
 * token, stored hashed, single-use, short-lived. Replaces any earlier token.
 */
export const issueResetToken = async (email) => {
    const token = crypto.randomBytes(32).toString('hex')
    await OTPModel.findOneAndUpdate(
        { email, purpose: 'reset-token' },
        {
            $set: {
                codeHash: hashSecret(token),
                attempts: 0,
                sendCount: 1,
                lastSentAt: new Date(),
                expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
            }
        },
        { upsert: true, setDefaultsOnInsert: true }
    )
    return token
}

// Atomically redeem a reset token. Returns true at most once per token.
export const consumeResetToken = async (email, token) => {
    const record = await OTPModel.findOneAndDelete({
        email,
        purpose: 'reset-token',
        codeHash: hashSecret(token),
        expiresAt: { $gt: new Date() },
    })
    return Boolean(record)
}

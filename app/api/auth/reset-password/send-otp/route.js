import { otpEmail } from "@/email/otpEmail";
import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { issueOtp, otpErrorMessage } from "@/lib/otp";
import { sendMail } from "@/lib/sendMail";
import { zSchema } from "@/lib/zodSchema";
import UserModel from "@/models/User.model";

export async function POST(request) {
    try {
        await connectDB()
        const payload = await request.json()
        const validationSchema = zSchema.pick({
            email: true
        })

        const validatedData = validationSchema.safeParse(payload)
        if (!validatedData.success) {
            return response(false, 401, 'Invalid or missing input field.', validatedData.error)
        }

        const { email } = validatedData.data

        const getUser = await UserModel.findOne({ deletedAt: null, email }).lean()
        if (!getUser) {
            return response(false, 404, 'User not found.')
        }

        // Also serves "Resend OTP" on the reset screen; cooldown + send cap apply.
        const issued = await issueOtp({ email, purpose: 'reset-password' })
        // Re-submitting within the cooldown: the code already sent is still valid.
        if (!issued.ok && issued.reason === 'cooldown') {
            return response(true, 200, 'A code was sent recently. Please check your email.')
        }
        if (!issued.ok) {
            return response(false, 429, otpErrorMessage(issued.reason, issued.retryAfter), { retryAfter: issued.retryAfter })
        }

        const otpSendStatus = await sendMail('Reset your password — MomStitched', email, otpEmail(issued.otp, { name: getUser.name, purpose: 'reset' }))

        if (!otpSendStatus.success) {
            return response(false, 400, 'Failed to send otp.')
        }

        return response(true, 200, 'We have sent a reset code to your email.')

    } catch (error) {
        return catchError(error)
    }
}

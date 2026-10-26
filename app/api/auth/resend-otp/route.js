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
        const validationSchema = zSchema.pick({ email: true })
        const validatedData = validationSchema.safeParse(payload)
        if (!validatedData.success) {
            return response(false, 401, 'Invalid or missing input field.', validatedData.error)
        }

        const { email } = validatedData.data

        const getUser = await UserModel.findOne({ email, deletedAt: null })
        if (!getUser) {
            return response(false, 404, 'User not found.')
        }

        // Only re-sends a login code that the password step already started —
        // otherwise this endpoint would let anyone skip the password entirely.
        const issued = await issueOtp({ email, purpose: 'login', requirePending: true })
        if (!issued.ok) {
            return response(false, 429, otpErrorMessage(issued.reason, issued.retryAfter), { retryAfter: issued.retryAfter })
        }

        const otpSendStatus = await sendMail('Your MomStitched login code', email, otpEmail(issued.otp, { name: getUser.name, purpose: 'login' }))

        if (!otpSendStatus.success) {
            return response(false, 400, 'Failed to resend otp.')
        }
        return response(true, 200, 'OTP sent successfully.')

    } catch (error) {
        return catchError(error)
    }
}

import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { issueResetToken, otpErrorMessage, verifyOtp } from "@/lib/otp";
import { zSchema } from "@/lib/zodSchema";
import UserModel from "@/models/User.model";

export async function POST(request) {
    try {
        await connectDB()
        const payload = await request.json()
        const validationSchema = zSchema.pick({
            otp: true, email: true
        })

        const validatedData = validationSchema.safeParse(payload)
        if (!validatedData.success) {
            return response(false, 401, 'Invalid or missing input field.', validatedData.error)
        }

        const { email, otp } = validatedData.data

        const verified = await verifyOtp({ email, purpose: 'reset-password', otp })
        if (!verified.ok) {
            return response(false, 400, otpErrorMessage(verified.reason))
        }

        const getUser = await UserModel.findOne({ deletedAt: null, email }).lean()
        if (!getUser) {
            return response(false, 404, 'User not found.')
        }

        // The code is consumed; hand back a single-use token that the
        // update-password step must present. This is the only proof it accepts.
        const resetToken = await issueResetToken(email)

        return response(true, 200, 'Otp verified.', { resetToken })

    } catch (error) {
        return catchError(error)
    }
}

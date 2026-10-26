import { emailVerificationLink } from "@/email/emailVerificationLink";
import { otpEmail } from "@/email/otpEmail";
import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { issueOtp, otpErrorMessage } from "@/lib/otp";
import { sendMail } from "@/lib/sendMail";
import { zSchema } from "@/lib/zodSchema";
import UserModel from "@/models/User.model";
import { SignJWT } from "jose";
import { z } from "zod";

export async function POST(request) {
    try {
        await connectDB()
        const payload = await request.json()

        const validationSchema = zSchema.pick({
            email: true
        }).extend({
            password: z.string()
        })

        const validatedData = validationSchema.safeParse(payload)
        if (!validatedData.success) {
            return response(false, 401, 'Invalid or missing input field.', validatedData.error)
        }

        const { email, password } = validatedData.data

        // get user data 
        const getUser = await UserModel.findOne({ deletedAt: null, email }).select("+password")
        if (!getUser) {
            return response(false, 400, 'Invalid login credentials.')
        }

        // resend email verification link 
        if (!getUser.isEmailVerified) {
            const secret = new TextEncoder().encode(process.env.SECRET_KEY)
            const token = await new SignJWT({ userId: getUser._id.toString() })
                .setIssuedAt()
                .setExpirationTime('1h')
                .setProtectedHeader({ alg: 'HS256' })
                .sign(secret)


            await sendMail(
                'Verify your email — MomStitched',
                email,
                emailVerificationLink(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify-email/${token}`, { name: getUser.name })
            )

            return response(false, 401, 'Your email is not verified. We have sent a verification link to your registered email address.')
        }

        // Account created via Google sign-in has no password yet. Guide the user
        // instead of running bcrypt.compare against an undefined hash (which would
        // throw and surface a confusing error).
        if (!getUser.password) {
            return response(false, 400, 'This account uses Google sign-in. Please continue with “Login with Google”, or set a password using “Forgot password”.')
        }

        // password verification
        const isPasswordVerified = await getUser.comparePassword(password)

        if (!isPasswordVerified) {
            return response(false, 400, 'Invalid login credentials.')
        }


        // otp generation (stored before sending mail to avoid race)
        const issued = await issueOtp({ email, purpose: 'login' })
        // Re-submitting the form within the cooldown: the code already sent is still valid.
        if (!issued.ok && issued.reason === 'cooldown') {
            return response(true, 200, 'A code was sent recently. Please check your email.')
        }
        if (!issued.ok) {
            return response(false, 429, otpErrorMessage(issued.reason, issued.retryAfter), { retryAfter: issued.retryAfter })
        }

        // send OTP email
        const OTPEmailTemplate = otpEmail(issued.otp, { name: getUser.name, purpose: 'login' })
        const otpEmailStatus = await sendMail("Your MomStitched login code", email, OTPEmailTemplate)
        if (!otpEmailStatus.success) {
            return response(false, 500, 'Something went wrong.')
        }

        return response(true, 200, 'Please verify your device.')
    } catch (error) {
        return catchError(error)
    }
}
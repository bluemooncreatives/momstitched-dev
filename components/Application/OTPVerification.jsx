import { zSchema } from '@/lib/zodSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import ButtonLoading from './ButtonLoading'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp'
import { showToast } from '@/lib/showToast'
import axios from 'axios'

// Mirrors OTP_RESEND_COOLDOWN_MS in lib/otp.js.
const RESEND_COOLDOWN_SECONDS = 60

const OTPVerification = ({ email, onSubmit, loading, resendEndpoint = '/api/auth/resend-otp' }) => {

    const [isResendingOtp, setIsResendingOtp] = useState(false)
    // A code was just sent when this screen mounts, so start in cooldown.
    const [resendIn, setResendIn] = useState(RESEND_COOLDOWN_SECONDS)

    useEffect(() => {
        if (resendIn <= 0) return
        const timer = setTimeout(() => setResendIn((seconds) => seconds - 1), 1000)
        return () => clearTimeout(timer)
    }, [resendIn])

    const formSchema = zSchema.pick({
        otp: true, email: true
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            otp: "",
            email: email
        }
    })

    const handleOtpVerification = async (values) => {
        onSubmit(values)
    }

    const resendOTP = async () => {
        try {
            setIsResendingOtp(true)
            const { data: resendOtpResponse } = await axios.post(resendEndpoint,
                { email }
            )
            if (!resendOtpResponse.success) {
                if (resendOtpResponse.data?.retryAfter) setResendIn(resendOtpResponse.data.retryAfter)
                throw new Error(resendOtpResponse.message)
            }
            form.setValue('otp', '')
            setResendIn(RESEND_COOLDOWN_SECONDS)
            showToast('success', resendOtpResponse.message)
        } catch (error) {
            showToast('error', error.message)
        } finally {
            setIsResendingOtp(false)
        }
    }

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleOtpVerification)} >
                    <div className='text-center' >
                        <h1 className='text-2xl font-bold mb-2'>Please complete verification</h1>
                        <p className='text-md'>We have sent an One-time Password (OTP) to your registered email address. The OTP is valid for 10 minutes only.</p>
                    </div>
                    <div className='mb-5 mt-5 flex justify-center'>
                        <FormField
                            control={form.control}
                            name="otp"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-semibold">One-time Password (OTP)</FormLabel>
                                    <FormControl>
                                        <InputOTP maxLength={6} {...field}>
                                            <InputOTPGroup>
                                                <InputOTPSlot className="text-xl size-10" index={0} />
                                                <InputOTPSlot className="text-xl size-10" index={1} />
                                                <InputOTPSlot className="text-xl size-10" index={2} />
                                                <InputOTPSlot className="text-xl size-10" index={3} />
                                                <InputOTPSlot className="text-xl size-10" index={4} />
                                                <InputOTPSlot className="text-xl size-10" index={5} />
                                            </InputOTPGroup>
                                        </InputOTP>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className='mb-3'>
                        <ButtonLoading loading={loading} type="submit" text="Verify" variant="brand" className="h-9 w-full rounded-sm text-base font-semibold uppercase cursor-pointer" />
                        <div className='text-center mt-5'>
                            {isResendingOtp ?
                                <span className='text-md'>Resending....</span>
                                : resendIn > 0 ?
                                    <span className='text-md text-muted-foreground'>Resend OTP in {resendIn}s</span>
                                    :
                                    <button onClick={resendOTP} type='button' className='text-blue-500 cursor-pointer hover:underline'>Resend OTP</button>
                            }

                        </div>
                    </div>

                </form>
            </Form>
        </div>
    )
}

export default OTPVerification
'use client'
import ButtonLoading from '@/components/Application/ButtonLoading'
import WebsiteBreadcrumb from '@/components/Application/Website/WebsiteBreadcrumb'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import useFetch from '@/hooks/useFetch'
import { showToast } from '@/lib/showToast'
import { zSchema } from '@/lib/zodSchema'
import { WEBSITE_ORDER_DETAILS, WEBSITE_PRODUCT_DETAILS, WEBSITE_SHOP } from '@/routes/WebsiteRoute'
import { addIntoCart, clearCart } from '@/store/reducer/cartReducer'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Truck, XCircle } from 'lucide-react'
import { z } from 'zod'
import { Textarea } from '@/components/ui/textarea'
import Script from 'next/script'
import { useRouter } from 'next/navigation'
import { FaShippingFast } from 'react-icons/fa'
import { MdPayment } from 'react-icons/md'

import loading from '@/public/assets/images/loading.svg'
const breadCrumb = {
    title: 'Checkout',
    links: [
        { label: "Checkout" }
    ]
}
const Checkout = () => {
    const router = useRouter()
    const dispatch = useDispatch()
    const cart = useSelector(store => store.cartStore)
    const authStore = useSelector(store => store.authStore)
    const [verifiedCartData, setVerifiedCartData] = useState([])
    const { data: getVerifiedCartData } = useFetch('/api/cart-verification', 'POST', { data: cart.products })
    const { data: profileData } = useFetch('/api/profile/get')

    const [isCouponApplied, setIsCouponApplied] = useState(false)
    const [subtotal, setSubTotal] = useState(0)
    const [couponDiscountPercentage, setCouponDiscountPercentage] = useState(0)
    const [couponDiscountAmount, setCouponDiscountAmount] = useState(0)
    const [totalAmount, setTotalAmount] = useState(0)
    const [couponLoading, setCouponLoading] = useState(false)
    const [couponCode, setCouponCode] = useState('')

    const [paymentMethod, setPaymentMethod] = useState('full')
    const [payableAmount, setPayableAmount] = useState(0)
    const [remainingAmount, setRemainingAmount] = useState(0)

    const [placingOrder, setPlacingOrder] = useState(false)
    const [savingOrder, setSavingOrder] = useState(false)
    useEffect(() => {
        if (getVerifiedCartData && getVerifiedCartData.success) {
            const cartData = getVerifiedCartData.data
            setVerifiedCartData(cartData)
            dispatch(clearCart())
            cartData.forEach(cartItem => {
                dispatch(addIntoCart(cartItem))
            });
        }
    }, [getVerifiedCartData])


    useEffect(() => {
        const cartProducts = cart.products

        const subTotalAmount = cartProducts.reduce((sum, product) => sum + (product.sellingPrice * product.qty), 0)

        // Coupon is the only discount. Always derive it from the live subtotal so it
        // stays correct if the cart changes after a coupon has been applied.
        const newCouponDiscount = Math.round((subTotalAmount * couponDiscountPercentage) / 100)

        setSubTotal(subTotalAmount)
        setCouponDiscountAmount(newCouponDiscount)
        setTotalAmount(subTotalAmount - newCouponDiscount)

        couponForm.setValue('minShoppingAmount', subTotalAmount)

    }, [cart, couponDiscountPercentage])

    useEffect(() => {
        if (paymentMethod === 'cod') {
            setPayableAmount(0)
            setRemainingAmount(totalAmount)
        } else {
            setPayableAmount(totalAmount)
            setRemainingAmount(0)
        }
    }, [paymentMethod, totalAmount])



    // coupon form 

    const couponFormSchema = zSchema.pick({
        code: true,
        minShoppingAmount: true
    })

    const couponForm = useForm({
        resolver: zodResolver(couponFormSchema),
        defaultValues: {
            code: "",
            minShoppingAmount: subtotal
        }
    })

    const applyCoupon = async (values) => {
        setCouponLoading(true)
        try {
            const { data: response } = await axios.post('/api/coupon/apply', values)
            if (!response.success) {
                throw new Error(response.message)
            }

            const discountPercentage = response.data.discountPercentage
            // Store the percentage; the cart effect derives the discount amount + total.
            setCouponDiscountPercentage(discountPercentage)
            showToast('success', response.message)
            setCouponCode(couponForm.getValues('code'))
            setIsCouponApplied(true)

            couponForm.resetField('code', '')
        } catch (error) {
            showToast('error', error.message)
        } finally {
            setCouponLoading(false)
        }
    }

    const removeCoupon = () => {
        setIsCouponApplied(false)
        setCouponCode('')
        setCouponDiscountPercentage(0)
    }


    // place order 
    const orderFormSchema = zSchema.pick({
        name: true,
        email: true,
        phone: true,
        country: true,
        state: true,
        city: true,
        pincode: true,
        landmark: true,
        ordernote: true
    }).extend({
        userId: z.string().optional()
    })

    const orderForm = useForm({
        resolver: zodResolver(orderFormSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            country: '',
            state: '',
            city: '',
            pincode: '',
            landmark: '',
            ordernote: '',
            userId: authStore?.auth?._id,
        }
    })


    useEffect(() => {
        if (authStore) {
            orderForm.setValue('userId', authStore?.auth?._id)
        }
    }, [authStore])

    useEffect(() => {
        if (profileData?.success) {
            const user = profileData.data
            orderForm.setValue('userId', user?._id || '')
            orderForm.setValue('name', user?.name || '')
            orderForm.setValue('email', user?.email || '')
            orderForm.setValue('phone', user?.phone || '')
        }
    }, [profileData])

    // get order id 
    const getOrderId = async (amount) => {
        try {
            const { data: orderIdData } = await axios.post('/api/payment/get-order-id', { amount })
            if (!orderIdData.success) {
                throw new Error(orderIdData.message)
            }

            return { success: true, order_id: orderIdData.data }

        } catch (error) {
            return { success: false, message: error.message }
        }
    }

    const placeOrder = async (formData) => {
 
        setPlacingOrder(true)
        try {
            const products = verifiedCartData.map((cartItem) => ({
                productId: cartItem.productId,
                variantId: cartItem.variantId,
                name: cartItem.name,
                qty: cartItem.qty,
                mrp: cartItem.mrp,
                sellingPrice: cartItem.sellingPrice,
            }))

            if (paymentMethod === 'cod') {
                setSavingOrder(true)
                const codOrderId = `COD_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`

                const { data: orderResponse } = await axios.post('/api/payment/save-order', {
                    ...formData,
                    products,
                    subtotal,
                    couponDiscountAmount,
                    totalAmount,
                    paymentMethod: 'cod',
                    partialPaymentPercentage: 100,
                    paidAmount: 0,
                    remainingAmount: totalAmount,
                    order_id: codOrderId
                })

                if (orderResponse.success) {
                    showToast('success', orderResponse.message)
                    dispatch(clearCart())
                    orderForm.reset()
                    router.push(WEBSITE_ORDER_DETAILS(codOrderId))
                } else {
                    showToast('error', orderResponse.message)
                }

                setSavingOrder(false)
                return
            }

            const generateOrderId = await getOrderId(payableAmount)
            if (!generateOrderId.success) {
                throw new Error(generateOrderId.message)
            }

            const order_id = generateOrderId.order_id

            const razOption = {
                "key": process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                "amount": payableAmount * 100,
                "currency": "INR",
                "name": "E-store",
                "description": 'Full Payment for order',
                "image": "https://res.cloudinary.com/dg7efdu9o/image/upload/v1750052410/logo-black_mb1rve.webp",
                "order_id": order_id,
                "handler": async function (response) {
                    setSavingOrder(true)

                    const { data: paymentResponseData } = await axios.post('/api/payment/save-order', {
                        ...formData,
                        ...response,
                        products,
                        subtotal,
                        couponDiscountAmount,
                        totalAmount,
                        paymentMethod: 'full',
                        partialPaymentPercentage: 100,
                        paidAmount: payableAmount,
                        remainingAmount: 0
                    })

                    if (paymentResponseData.success) {
                        showToast('success', paymentResponseData.message)
                        dispatch(clearCart())
                        orderForm.reset()
                        router.push(WEBSITE_ORDER_DETAILS(response.razorpay_order_id))
                        setSavingOrder(false)
                    } else {
                        showToast('error', paymentResponseData.message)
                        setSavingOrder(false)
                    }
                },
                "prefill": {
                    "name": formData.name,
                    "email": formData.email,
                    "contact": formData.phone
                },

                "theme": {
                    "color": "#7c3aed"
                }
            }

            if (typeof window === 'undefined' || !window.Razorpay) {
                throw new Error('Payment gateway is not ready. Please refresh and try again.')
            }

            const rzp = new window.Razorpay(razOption)
            rzp.on('payment.failed', function (response) {
                showToast('error', response.error.description)
            });

            rzp.open()

        } catch (error) {
            showToast('error', error.message)
        } finally {
            setPlacingOrder(false)
        }
    }

    return (
        <div>

            {savingOrder &&
                <div className='h-screen w-screen fixed top-0 left-0 z-50 bg-black/10'>
                    <div className='h-screen flex justify-center items-center'>
                        <Image src={loading.src} height={80} width={80} alt='Loading' />
                        <h4 className='font-semibold'>Order Confirming...</h4>
                    </div>
                </div>
            }

            <WebsiteBreadcrumb props={breadCrumb} />
            {cart.count === 0
                ?
                <div className='w-screen h-[500px] flex justify-center items-center py-32'>
                    <div className='text-center'>
                        <h4 className='text-4xl font-semibold mb-5'>Your cart is empty!</h4>

                        <Button type="button" asChild>
                            <Link href={WEBSITE_SHOP}>Continue Shopping</Link>
                        </Button>

                    </div>
                </div>
                :
                <div className='flex lg:flex-nowrap flex-wrap gap-10 my-20 lg:px-32 px-4'>
                    <div className='lg:w-[60%] w-full'>
                        <div className='flex font-semibold gap-2 items-center'>
                            <Truck className='size-6' /> Shipping Address:
                        </div>
                        <div className='mt-5'>

                            <Form {...orderForm}>
                                <form className='grid grid-cols-2 gap-5' onSubmit={orderForm.handleSubmit(placeOrder)}>
                                    <div className='mb-3'>
                                        <FormField
                                            control={orderForm.control}
                                            name='name'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input placeholder="Full name*" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        >

                                        </FormField>
                                    </div>
                                    <div className='mb-3'>
                                        <FormField
                                            control={orderForm.control}
                                            name='email'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input type="email" placeholder="Email*" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        >

                                        </FormField>
                                    </div>
                                    <div className='mb-3'>
                                        <FormField
                                            control={orderForm.control}
                                            name='phone'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input placeholder="Phone*" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        >

                                        </FormField>
                                    </div>
                                    <div className='mb-3'>
                                        <FormField
                                            control={orderForm.control}
                                            name='country'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input placeholder="Country*" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        >

                                        </FormField>
                                    </div>
                                    <div className='mb-3'>
                                        <FormField
                                            control={orderForm.control}
                                            name='state'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input placeholder="State*" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        >

                                        </FormField>
                                    </div>
                                    <div className='mb-3'>
                                        <FormField
                                            control={orderForm.control}
                                            name='city'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input placeholder="City*" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        >

                                        </FormField>
                                    </div>
                                    <div className='mb-3'>
                                        <FormField
                                            control={orderForm.control}
                                            name='pincode'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input placeholder="Pincode*" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        >

                                        </FormField>
                                    </div>
                                    <div className='mb-3'>
                                        <FormField
                                            control={orderForm.control}
                                            name='landmark'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input placeholder="Landmark*" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        >

                                        </FormField>
                                    </div>
                                    <div className='mb-3 col-span-2'>
                                        <FormField
                                            control={orderForm.control}
                                            name='ordernote'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Textarea placeholder="Enter order note" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        >

                                        </FormField>
                                    </div>

                                    <div className='col-span-2 mb-3'>
                                        <div className='flex font-semibold gap-2 items-center mb-3'>
                                            <MdPayment size={25} /> Select Payment Method:
                                        </div>
                                        <div className='space-y-3 bg-gray-50 p-4 rounded-lg'>
                                            <label className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === 'full' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
                                                <input
                                                    type="radio"
                                                    name="paymentMethod"
                                                    value="full"
                                                    checked={paymentMethod === 'full'}
                                                    onChange={() => setPaymentMethod('full')}
                                                    className="w-4 h-4 text-primary"
                                                />
                                                <div className='flex-1'>
                                                    <p className='font-medium'>Full Payment</p>
                                                    <p className='text-sm text-gray-500'>Pay {totalAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} now</p>
                                                </div>
                                                <span className='font-semibold text-primary'>{totalAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                                            </label>

                                            <label className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
                                                <input
                                                    type="radio"
                                                    name="paymentMethod"
                                                    value="cod"
                                                    checked={paymentMethod === 'cod'}
                                                    onChange={() => setPaymentMethod('cod')}
                                                    className="w-4 h-4 text-primary"
                                                />
                                                <div className='flex-1'>
                                                    <p className='font-medium'>Cash on Delivery</p>
                                                    <p className='text-sm text-gray-500'>Pay {totalAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} when you receive the order</p>
                                                </div>
                                                <span className='font-semibold text-green-600'>COD</span>
                                            </label>
                                        </div>

                                        {paymentMethod !== 'cod' && (
                                            <div className='mt-4 p-3 bg-primary/10 rounded-lg'>
                                                <div className='flex justify-between text-sm'>
                                                    <span>Pay Now:</span>
                                                    <span className='font-semibold'>{payableAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className='mb-3'>
                                        <ButtonLoading
                                            type="submit"
                                            text={paymentMethod === 'cod' ? 'Place Order (COD)' : `Pay ${payableAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}`}
                                            loading={placingOrder}
                                            className="bg-black rounded-full px-5 cursor-pointer"
                                        />
                                    </div>

                                </form>
                            </Form>
                        </div>

                    </div>
                    <div className='lg:w-[40%] w-full'>
                        <div className='rounded bg-gray-50 p-5 sticky top-5'>
                            <h4 className='text-lg font-semibold mb-5'>Order Summary</h4>
                            <div>

                                <table className='w-full border'>
                                    <tbody>
                                        {verifiedCartData && verifiedCartData?.map(product => (
                                            <tr key={product.variantId}>
                                                <td className='p-3'>
                                                    <div className='flex items-center gap-5'>
                                                        <Image src={product.media} width={60} height={60} alt={product.name} className='rounded' />
                                                        <div>
                                                            <h4 className='font-medium line-clamp-1'>
                                                                <Link href={WEBSITE_PRODUCT_DETAILS(product.url)}>{product.name}</Link>
                                                            </h4>
                                                            <p className='text-sm'>Color: {product.color}</p>
                                                            <p className='text-sm'>Size: {product.size}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className='p-3 text-center'>
                                                    <p className='text-nowrap text-sm'>
                                                        {product.qty} x {product.sellingPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                                    </p>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <table className='w-full'>
                                    <tbody>
                                        <tr>
                                            <td className='font-medium py-2'>Subtotal</td>
                                            <td className='text-end py-2'>
                                                {subtotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                            </td>
                                        </tr>
                                        {couponDiscountAmount > 0 && (
                                            <tr>
                                                <td className='font-medium py-2 text-emerald-600'>Coupon Discount</td>
                                                <td className='text-end py-2 text-emerald-600'>
                                                    - {couponDiscountAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                                </td>
                                            </tr>
                                        )}
                                        <tr>
                                            <td className='font-medium py-2 text-xl'>Total</td>
                                            <td className='text-end py-2'>
                                                {totalAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                <div className='mt-2 mb-5'>
                                    {!isCouponApplied
                                        ?
                                        <Form {...couponForm}>
                                            <form className='flex justify-between gap-5' onSubmit={couponForm.handleSubmit(applyCoupon)}>
                                                <div className='w-[calc(100%-100px)]'>
                                                    <FormField
                                                        control={couponForm.control}
                                                        name='code'
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Input placeholder="Enter coupon code" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    >

                                                    </FormField>
                                                </div>
                                                <div className='w-[100px]'>
                                                    <ButtonLoading type="submit" text="Apply" className="w-full cursor-pointer" loading={couponLoading} />
                                                </div>
                                            </form>
                                        </Form>
                                        :
                                        <div className='flex justify-between py-1 px-5 rounded-lg bg-gray-200'>
                                            <div>
                                                <span className='text-xs'>Coupon:</span>
                                                <p className='text-sm font-semibold'>{couponCode}</p>
                                            </div>
                                            <button type='button' onClick={removeCoupon} className='text-red-500 cursor-pointer'>
                                                <XCircle className='size-6' />
                                            </button>
                                        </div>
                                    }
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            }

            <Script src='https://checkout.razorpay.com/v1/checkout.js' />
        </div>
    )
}

export default Checkout

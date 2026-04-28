'use client'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { zSchema } from '@/lib/zodSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Star } from 'lucide-react'
import ButtonLoading from '../ButtonLoading'
import { useSelector } from 'react-redux'
import { Textarea } from '@/components/ui/textarea'
import axios from 'axios'
import Link from 'next/link'
import { WEBSITE_LOGIN } from '@/routes/WebsiteRoute'
import { showToast } from '@/lib/showToast'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import ReviewList from './ReviewList'
import useFetch from '@/hooks/useFetch'

const StarRatingField = ({ value = 0, onChange }) => {
    return (
        <div className='flex items-center gap-1'>
            {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= Number(value || 0)
                return (
                    <button
                        key={star}
                        type='button'
                        onClick={() => onChange(star)}
                        className='text-2xl text-amber-500 transition-transform hover:scale-110'
                        aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    >
                        <Star className={`size-6 ${isFilled ? 'fill-amber-500 text-amber-500' : 'text-amber-500'}`} />
                    </button>
                )
            })}
        </div>
    )
}

const ProductReveiw = ({ productId }) => {
    const queryClient = useQueryClient()
    const auth = useSelector(store => store.authStore.auth)
    const [loading, setLoading] = useState(false)
    const [currentUrl, setCurrentUrl] = useState('')
    const [isReview, setIsReview] = useState(false)
    const [reviewCount, setReviewCount] = useState()

    const { data: reviewDetails } = useFetch(`/api/review/details?productId=${productId}`)

    useEffect(() => {
        if (reviewDetails && reviewDetails.success) {
            const reviewCountData = reviewDetails.data
            setReviewCount(reviewCountData)
        }
    }, [reviewDetails])

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setCurrentUrl(window.location.href)
        }
    }, [])

    const formSchema = zSchema.pick({
        product: true,
        userId: true,
        rating: true,
        title: true,
        review: true
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            product: productId,
            userId: auth?._id,
            rating: 0,
            title: "",
            review: "",
        },
    })


    useEffect(() => {
        form.setValue('userId', auth?._id)
    }, [auth])

    const handleReviewSubmit = async (values) => {
        setLoading(true)
        try {
            const { data: response } = await axios.post('/api/review/create', values)
            if (!response.success) {
                throw new Error(response.message)
            }

            form.reset()
            showToast('success', response.message)
            queryClient.invalidateQueries({ queryKey: ['product-review', productId] })
        } catch (error) {
            showToast('error', error.message)
        } finally {
            setLoading(false)
        }
    }


    const fetchReview = async (pageParam) => {
        const { data: getReviewData } = await axios.get(`/api/review/get?productId=${productId}&page=${pageParam}`)
        if (!getReviewData.success) {
            return
        }

        return getReviewData.data
    }


    const { error, data, isFetching, fetchNextPage, hasNextPage } = useInfiniteQuery({
        queryKey: ['product-review', productId],
        queryFn: async ({ pageParam }) => await fetchReview(pageParam),
        initialPageParam: 0,
        getNextPageParam: (lastPage) => {
            return lastPage.nextPage
        }
    })



    return (
        <div className="mb-20 rounded-[var(--admin-shell-radius)] border border-border/60 bg-white shadow-sm">
            <div className="border-b border-border/60 px-5 py-4">
                <h2 className="text-xl font-semibold uppercase tracking-[0.04em]">Rating & Reviews</h2>
            </div>
            <div className="p-5 lg:p-6">
                <div className='flex justify-between flex-wrap items-center'>
                    <div className='md:w-1/2 w-full md:flex md:gap-10 md:mb-0 mb-5'>
                        <div className='md:w-[200px] w-full md:mb-0 mb-5'>
                            <h4 className='text-center text-8xl font-semibold'>{reviewCount?.averageRating}</h4>
                            <div className='flex justify-center gap-2 text-amber-500'>
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <Star key={index} className="size-4 fill-amber-500 text-amber-500" />
                                ))}
                            </div>

                            <p className='text-center mt-3'>
                                ({reviewCount?.totalReview} Rating & Reviews)
                            </p>
                        </div>

                        <div className='md:w-[calc(100%-200px)] flex items-center'>
                            <div className='w-full'>

                                {[5, 4, 3, 2, 1].map(rating => (
                                    <div key={rating} className='flex items-center gap-2 mb-2'>
                                        <div className='flex items-center gap-1 text-amber-500'>
                                            <p className='w-3 text-foreground'>{rating}</p>
                                            <Star className="size-3 fill-amber-500 text-amber-500" />
                                        </div>
                                        <Progress value={reviewCount?.percentage[rating]} />
                                        <span className='text-sm'>{reviewCount?.rating[rating]}</span>
                                    </div>
                                ))}



                            </div>
                        </div>

                    </div>

                    <div className='md:w-1/2 w-full md:text-end text-center'>
                        <Button onClick={() => setIsReview(!isReview)} type="button" variant="outline" className="md:w-fit w-full rounded-md border-border/70 py-6 px-10 font-semibold uppercase tracking-[0.18em]">
                            Write Review
                        </Button>
                    </div>
                </div>

                {isReview &&


                    <div className='my-5 rounded-md border border-border/70 bg-muted/20 p-4'>
                        <hr className='mb-5' />
                        <h4 className='mb-3 text-lg font-semibold uppercase tracking-[0.06em]'>Write A Review</h4>
                        {!auth
                            ?
                            <>
                                <p className='mb-2'>Login to submit review.</p>
                                <Button type="button" asChild variant="brand">
                                    <Link href={`${WEBSITE_LOGIN}?callback=${currentUrl}`}>Login</Link>
                                </Button>
                            </>
                            :
                            <>

                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(handleReviewSubmit)} >

                                        <div className='mb-5'>
                                            <FormField
                                                control={form.control}
                                                name="rating"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <StarRatingField value={field.value} onChange={field.onChange} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className='mb-5'>
                                            <FormField
                                                control={form.control}
                                                name="title"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Title</FormLabel>
                                                        <FormControl>
                                                            <Input type="text" placeholder="Review title" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className='mb-5'>
                                            <FormField
                                                control={form.control}
                                                name="review"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Review</FormLabel>
                                                        <FormControl>
                                                            <Textarea placeholder="Write your comment here..." {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className='mb-3'>
                                            <ButtonLoading loading={loading} type="submit" text="Submit Review" variant="brand" className="h-10 cursor-pointer text-[11px] font-semibold uppercase tracking-[0.2em]" />
                                        </div>

                                    </form>
                                </Form>
                            </>
                        }


                    </div>

                }


                <div className='mt-10 border-t border-border/60 pt-5'>
                    <h5 className='text-lg font-semibold uppercase tracking-[0.05em]'>{data?.pages[0]?.totalReview || 0} Reviews</h5>

                    <div className='mt-10'>
                        {data && data.pages.map(page => (
                            page.reviews.map(review => (
                                <div className='mb-5' key={review._id}>
                                    <ReviewList review={review} />
                                </div>
                            ))
                        ))}

                        {hasNextPage &&
                            <ButtonLoading text="Load More" type="button" loading={isFetching} onClick={fetchNextPage} variant="brand" className="h-10 text-[11px] font-semibold uppercase tracking-[0.2em]" />
                        }

                    </div>

                </div>



            </div>
        </div>
    )
}

export default ProductReveiw

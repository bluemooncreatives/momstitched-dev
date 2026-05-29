import Image from 'next/image'
import usericon from '@/public/assets/images/user.png'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Star } from 'lucide-react'

dayjs.extend(relativeTime);
const ReviewList = ({ review }) => {
    return (
        <div className='flex gap-4 rounded-md border border-border/60 bg-background p-4'>
            <div className='w-[55px] shrink-0'>
                <Image
                    src={review?.avatar?.url || usericon.src}
                    width={55}
                    height={55}
                    alt='user icon'
                    className='rounded-md border border-border/60'
                />
            </div>
            <div className='w-[calc(100%-80px)]'>
                <div>
                    <h4 className='text-lg font-semibold'>{review?.title}</h4>
                    <p className='flex flex-wrap gap-2 items-center text-sm'>
                        <span className='font-medium'>{review?.reviewedBy}</span>
                        -
                        <span className='text-muted-foreground'>{dayjs(review?.createdAt).fromNow()}</span>
                        <span className='flex items-center text-xs gap-1'>( {review.rating} <Star className='text-yellow-500 mb-1 size-3.5 fill-yellow-500' />)</span>
                    </p>
                    <p className='mt-3 text-foreground/85'>{review?.review}</p>
                </div>
            </div>
        </div>
    )
}

export default ReviewList
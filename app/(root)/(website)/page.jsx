import HeroSection from '@/components/Application/Website/HeroSection'
import Marquee from '@/components/Application/Website/Marquee'
import CategoryArchiveSection from '@/components/Application/Website/CategoryArchiveSection'
import Image from 'next/image'
import React from 'react'
import FeaturedProduct from '@/components/Application/Website/FeaturedProduct'
import advertisingBanner from '@/public/assets/images/advertising-banner.png'
import Testimonial from '@/components/Application/Website/Testimonial'
import { RotateCcw, Truck, Headset, BadgePercent } from 'lucide-react'
import ShopAllButton from '@/components/Application/Website/ShopAllButton'

const Home = () => {
    return (
        <>
            <section>
                <HeroSection />
            </section>
            <Marquee text="luxury collection" repeatCount={12} />

            <FeaturedProduct />

            <CategoryArchiveSection />

            <section className='sm:pt-20 pt-5 pb-10'>
                <Image
                    src={advertisingBanner.src}
                    height={advertisingBanner.height}
                    width={advertisingBanner.width}
                    alt='Advertisement'

                />
            </section>

            <Testimonial />

            <section className='website-gutter border-t py-10'>
                <div className='grid lg:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-10'>
                    <div className='text-center'>
                        <p className='flex justify-center items-center mb-3'>
                            <RotateCcw className='size-7' />
                        </p>
                        <h3 className='text-xl font-semibold'>7-Days Returns</h3>
                        <p>Risk-free shopping with easy returns.</p>
                    </div>
                    <div className='text-center'>
                        <p className='flex justify-center items-center mb-3'>
                            <Truck className='size-7' />
                        </p>
                        <h3 className='text-xl font-semibold'>Free Shipping</h3>
                        <p>No extra costs, just the price you see.</p>
                    </div>
                    <div className='text-center'>
                        <p className='flex justify-center items-center mb-3'>
                            <Headset className='size-7' />
                        </p>
                        <h3 className='text-xl font-semibold'>24/7 Support</h3>
                        <p>24/7 support, alway here just for you.</p>
                    </div>
                    <div className='text-center'>
                        <p className='flex justify-center items-center mb-3'>
                            <BadgePercent className='size-7' />
                        </p>
                        <h3 className='text-xl font-semibold'>Member Discounts</h3>
                        <p>Special offers for our loyal customers.</p>
                    </div>
                </div>
                <div className='mt-10 flex justify-center'>
                    <ShopAllButton colorScheme="dark-red" radius="md" />
                </div>
            </section>

        </>
    )
}

export default Home

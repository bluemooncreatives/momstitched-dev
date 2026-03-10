import HeroSection from '@/components/Application/Website/HeroSection'
import Marquee from '@/components/Application/Website/Marquee'
import CategorySection from '@/components/Application/Website/CategorySection'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import FeaturedProduct from '@/components/Application/Website/FeaturedProduct'
import advertisingBanner from '@/public/assets/images/advertising-banner.png'
import Testimonial from '@/components/Application/Website/Testimonial'
import { WEBSITE_SHOP } from '@/routes/WebsiteRoute'

import { GiReturnArrow } from "react-icons/gi";
import { FaShippingFast } from "react-icons/fa";
import { BiSupport } from "react-icons/bi";
import { TbRosetteDiscountFilled } from "react-icons/tb";

const Home = () => {
    return (
        <>
            <section>
                <HeroSection />
            </section>
            <Marquee text="luxury collection" repeatCount={12} />

            <FeaturedProduct />

            <CategorySection />

            <section className='sm:pt-20 pt-5 pb-10'>
                <Image
                    src={advertisingBanner.src}
                    height={advertisingBanner.height}
                    width={advertisingBanner.width}
                    alt='Advertisement'

                />
            </section>

            <Testimonial />

            <section className='lg:px-32 px-4  border-t py-10'>
                <div className='grid lg:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-10'>
                    <div className='text-center'>
                        <p className='flex justify-center items-center mb-3'>
                            <GiReturnArrow size={30} />
                        </p>
                        <h3 className='text-xl font-semibold'>7-Days Returns</h3>
                        <p>Risk-free shopping with easy returns.</p>
                    </div>
                    <div className='text-center'>
                        <p className='flex justify-center items-center mb-3'>
                            <FaShippingFast size={30} />
                        </p>
                        <h3 className='text-xl font-semibold'>Free Shipping</h3>
                        <p>No extra costs, just the price you see.</p>
                    </div>
                    <div className='text-center'>
                        <p className='flex justify-center items-center mb-3'>
                            <BiSupport size={30} />
                        </p>
                        <h3 className='text-xl font-semibold'>24/7 Support</h3>
                        <p>24/7 support, alway here just for you.</p>
                    </div>
                    <div className='text-center'>
                        <p className='flex justify-center items-center mb-3'>
                            <TbRosetteDiscountFilled size={30} />
                        </p>
                        <h3 className='text-xl font-semibold'>Member Discounts</h3>
                        <p>Special offers for our loyal customers.</p>
                    </div>
                </div>
                <div className='mt-10 flex justify-center'>
                    <Link
                        href={WEBSITE_SHOP}
                        className='inline-flex items-center justify-center rounded-full border border-black px-8 py-3 text-sm font-semibold uppercase tracking-wide transition-colors duration-300 hover:bg-black hover:text-white'
                    >
                        Shop All Products
                    </Link>
                </div>
            </section>

        </>
    )
}

export default Home

import HeroSection from '@/components/Application/Website/HeroSection'
import Marquee from '@/components/Application/Website/Marquee'
import CategoryArchiveSection from '@/components/Application/Website/CategoryArchiveSection'
import FeaturedProduct from '@/components/Application/Website/FeaturedProduct'
import Testimonial from '@/components/Application/Website/Testimonial'
import { RotateCcw, Truck, Headset, BadgePercent } from 'lucide-react'
import ShopAllButton from '@/components/Application/Website/ShopAllButton'
import InstagramReelsMarquee from '@/components/Application/Website/InstagramReelsMarquee'

const BENEFITS = [
    {
        Icon: RotateCcw,
        title: '7-Days Returns',
        description: 'Risk-free shopping with easy returns.',
    },
    {
        Icon: Truck,
        title: 'Free Shipping',
        description: 'No extra costs, just the price you see.',
    },
    {
        Icon: Headset,
        title: '24/7 Support',
        description: '24/7 support, alway here just for you.',
    },
    {
        Icon: BadgePercent,
        title: 'Member Discounts',
        description: 'Special offers for our loyal customers.',
    },
]

const Home = () => {
    return (
        <>
            <section>
                <HeroSection />
            </section>
            <Marquee text="luxury collection" repeatCount={12} />

            <FeaturedProduct />

            <CategoryArchiveSection />

            <InstagramReelsMarquee />

            <Testimonial />

            <section className='website-gutter border-t py-10'>
                <div className='grid lg:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-10'>
                    {BENEFITS.map(({ Icon, title, description }) => (
                        <div key={title} className='text-center'>
                            <p className='flex justify-center items-center mb-3'>
                                <Icon className='size-7' />
                            </p>
                            <h3 className='text-xl font-semibold'>{title}</h3>
                            <p>{description}</p>
                        </div>
                    ))}
                </div>
                <div className='mt-10 flex justify-center'>
                    <ShopAllButton colorScheme="dark-red" radius="md" />
                </div>
            </section>

        </>
    )
}

export default Home

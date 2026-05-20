import dynamic from 'next/dynamic'
import HeroSection from '@/components/Application/Website/HeroSection'
import Marquee from '@/components/Application/Website/Marquee'
import CategoryArchiveSection from '@/components/Application/Website/CategoryArchiveSection'
import FeaturedProduct from '@/components/Application/Website/FeaturedProduct'
import InstagramReelsMarquee from '@/components/Application/Website/InstagramReelsMarquee'

// Code-split the below-fold GSAP/ScrollTrigger sections so their JS doesn't
// block parsing/evaluation of the above-fold critical path.
const Testimonial = dynamic(() => import('@/components/Application/Website/Testimonial'))
const EditorialCardsSection = dynamic(() => import('@/components/Application/Website/EditorialCardsSection'))
const BenefitsSection = dynamic(() => import('@/components/Application/Website/BenefitsSection'))

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

            <EditorialCardsSection />

            <BenefitsSection />
        </>
    )
}

export default Home

import dynamic from 'next/dynamic'
import HeroSection from '@/components/Application/Website/HeroSection'
import Marquee from '@/components/Application/Website/Marquee'
import CategoryArchiveSection from '@/components/Application/Website/CategoryArchiveSection'
import FeaturedProduct from '@/components/Application/Website/FeaturedProduct'
import BestsellersSection from '@/components/Application/Website/BestsellersSection'
import InstagramReelsMarquee from '@/components/Application/Website/InstagramReelsMarquee'

// Code-split the below-fold GSAP/ScrollTrigger sections so their JS doesn't
// block parsing/evaluation of the above-fold critical path.
const AboutUsSection = dynamic(() => import('@/components/Application/Website/AboutUsSection'))
const Testimonial = dynamic(() => import('@/components/Application/Website/Testimonial'))
const EditorialCardsSection = dynamic(() => import('@/components/Application/Website/EditorialCardsSection'))
const BenefitsSection = dynamic(() => import('@/components/Application/Website/BenefitsSection'))
const FAQSection = dynamic(() => import('@/components/Application/Website/FAQSection'))

const Home = () => {
    return (
        <>
            <section>
                <HeroSection />
            </section>
            <Marquee text="freshly arrived" repeatCount={12} />

            <FeaturedProduct />

            <CategoryArchiveSection />

            <AboutUsSection />

            <BestsellersSection />

            <InstagramReelsMarquee />

            <Testimonial />

            <EditorialCardsSection />

            <BenefitsSection />

            <FAQSection />
        </>
    )
}

export default Home

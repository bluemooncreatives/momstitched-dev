import dynamic from 'next/dynamic'
import HeroSection from '@/components/Application/Website/HeroSection'
import FeaturedProduct from '@/components/Application/Website/FeaturedProduct'
import BestsellersSection from '@/components/Application/Website/BestsellersSection'
// Async server component (fetches its data): imported directly so it can run on
// the server, like BestsellersSection. It code-splits its own heavy client chunk.
import CategoryArchiveSection from '@/components/Application/Website/CategoryArchiveSection'

// Defer all GSAP/ScrollTrigger and media-heavy sections into separate JS chunks
// so they don't block parsing and hydration of the above-fold critical path.
const Marquee = dynamic(() => import('@/components/Application/Website/Marquee'))
const InstagramReelsMarquee = dynamic(() => import('@/components/Application/Website/InstagramReelsMarquee'))
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

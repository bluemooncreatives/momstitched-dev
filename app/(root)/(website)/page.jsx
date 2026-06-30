import dynamic from 'next/dynamic'
import HeroSection from '@/components/Application/Website/HeroSection'
import FeaturedProduct from '@/components/Application/Website/FeaturedProduct'
import BestsellersSection from '@/components/Application/Website/BestsellersSection'
// Async server components (fetch their own data): imported directly so they run
// on the server, like BestsellersSection. Each code-splits its own client chunk.
import CategoryArchiveSection from '@/components/Application/Website/CategoryArchiveSection'
import Testimonial from '@/components/Application/Website/Testimonial'

// Defer all GSAP/ScrollTrigger and media-heavy sections into separate JS chunks
// so they don't block parsing and hydration of the above-fold critical path.
const Marquee = dynamic(() => import('@/components/Application/Website/Marquee'))
const InstagramReelsMarquee = dynamic(() => import('@/components/Application/Website/InstagramReelsMarquee'))
const AboutUsSection = dynamic(() => import('@/components/Application/Website/AboutUsSection'))
const EditorialCardsSection = dynamic(() => import('@/components/Application/Website/EditorialCardsSection'))
const BenefitsSection = dynamic(() => import('@/components/Application/Website/BenefitsSection'))
const FAQSection = dynamic(() => import('@/components/Application/Website/FAQSection'))

export const metadata = {
    title: 'MomStitched — Handcrafted Women\'s Ethnic Wear | Shop Online',
    description:
        'Discover handcrafted women\'s ethnic wear at MomStitched. From festive ensembles to everyday elegance — premium fabrics, thoughtful silhouettes, and meticulous detailing.',
    openGraph: {
        title: 'MomStitched — Handcrafted Women\'s Ethnic Wear | Shop Online',
        description:
            'Discover handcrafted women\'s ethnic wear at MomStitched. From festive ensembles to everyday elegance — premium fabrics, thoughtful silhouettes, and meticulous detailing.',
    },
}

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

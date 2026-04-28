import HeroSection from '@/components/Application/Website/HeroSection'
import Marquee from '@/components/Application/Website/Marquee'
import CategoryArchiveSection from '@/components/Application/Website/CategoryArchiveSection'
import FeaturedProduct from '@/components/Application/Website/FeaturedProduct'
import Testimonial from '@/components/Application/Website/Testimonial'
import EditorialCardsSection from '@/components/Application/Website/EditorialCardsSection'
import BenefitsSection from '@/components/Application/Website/BenefitsSection'
import InstagramReelsMarquee from '@/components/Application/Website/InstagramReelsMarquee'

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

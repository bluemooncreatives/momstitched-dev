import Footer from '@/components/Application/Website/Footer'
import Header from '@/components/Application/Website/Header'
import CartPriceSync from '@/components/Application/Website/CartPriceSync'
import MobileCartBar from '@/components/Application/Website/MobileCartBar'
import { getFooterCategories } from '@/lib/services/categoryService'

const Layout = async ({ children }) => {
    const footerCategories = await getFooterCategories()

    return (
        <div className='font-neue overflow-x-hidden'>
            <Header />
            <main id="main-content" className='relative min-h-screen bg-background'>
                {children}
            </main>
            <Footer categoryLinks={footerCategories} />
            <MobileCartBar />
            <CartPriceSync />
        </div>
    )
}

export default Layout

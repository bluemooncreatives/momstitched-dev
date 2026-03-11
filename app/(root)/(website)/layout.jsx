import Footer from '@/components/Application/Website/Footer'
import Header from '@/components/Application/Website/Header'
import React from 'react'

const Layout = ({ children }) => {
    return (
        <div className='font-neue overflow-x-hidden'>
            <Header />
            <main className='relative min-h-screen bg-[#ffffff]'>
                {children}
            </main>
            <Footer />
        </div>
    )
}

export default Layout

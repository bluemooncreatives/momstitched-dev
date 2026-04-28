'use client'

import Navbar from '@/components/ui/navbar'
import { WEBSITE_HOME, WEBSITE_LOGIN, WEBSITE_REGISTER, WEBSITE_SHOP } from '@/routes/WebsiteRoute'

const menu = [
  { title: 'Home', url: WEBSITE_HOME },
  { title: 'Shop', url: WEBSITE_SHOP },
  { title: 'About Us', url: '/about-us' },
  { title: 'Contact', url: '/contact' },
]

const mobileExtraLinks = [
  { name: 'Home', url: WEBSITE_HOME },
  { name: 'Shop', url: WEBSITE_SHOP },
  { name: 'About Us', url: '/about-us' },
  { name: 'Contact', url: '/contact' },
]

const Header = () => {
  return (
    <div className="fixed inset-x-0 top-0 z-50 website-gutter pt-3 sm:pt-4">
      <header className="rounded-[var(--radius)] border border-[#00000035] bg-white/90 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <Navbar
          logo={{
            url: WEBSITE_HOME,
            src: '/assets/images/logo-black.png',
            alt: 'MomStitched logo',
            title: 'MomStitched',
          }}
          menu={menu}
          mobileExtraLinks={mobileExtraLinks}
          auth={{
            login: { text: 'Sign in', url: WEBSITE_LOGIN },
            signup: { text: 'Create account', url: WEBSITE_REGISTER },
          }}
        />
      </header>
    </div>
  )
}

export default Header

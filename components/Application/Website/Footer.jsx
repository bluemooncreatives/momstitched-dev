import Image from 'next/image'
import logo from '@/public/assets/images/logo-black.png'
import Link from 'next/link'
import { MapPin, Phone, Mail, Youtube, Instagram, MessageCircle, Facebook, Twitter } from 'lucide-react'

import { USER_DASHBOARD, WEBSITE_HOME, WEBSITE_LOGIN, WEBSITE_REGISTER, WEBSITE_SHOP } from '@/routes/WebsiteRoute'
const Footer = () => {
    return (
        <footer className='sticky z-0 bottom-0 left-0 w-full bg-gray-50 border-t'>
            <div className='grid lg:grid-cols-5 md:grid-cols-2 grid-cols-1 gap-10 py-10 website-gutter'>

                <div className='lg:col-span-1 md:col-span-2 col-span-1'>
                    <Image
                        src={logo}
                        width={383}
                        height={146}
                        alt='logo'
                        className='w-36 mb-2'
                        unoptimized
                    />
                    <p className='text-gray-500 text-sm'>
                       MomStitched is your trusted destination for quality and convenience. From fashion to essentials, we bring everything you need right to your doorstep. Shop smart, live better — only at MomStitched.
                    </p>
                </div>


                <div>
                    <h4 className='text-xl font-bold uppercase mb-5'>Categories</h4>
                    <ul>
                        <li className='mb-2 text-gray-500'>
                            <Link href={`${WEBSITE_SHOP}?category=t-shirts`}>T-shirt</Link>
                        </li>
                        <li className='mb-2 text-gray-500'>
                            <Link href={`${WEBSITE_SHOP}?category=hoodies`}>Hoodies</Link>
                        </li>
                        <li className='mb-2 text-gray-500'>
                            <Link href={`${WEBSITE_SHOP}?category=oversized`}>Oversized</Link>
                        </li>
                        <li className='mb-2 text-gray-500'>
                            <Link href={`${WEBSITE_SHOP}?category=full-sleeves`}>Full Sleeves</Link>
                        </li>
                        <li className='mb-2 text-gray-500'>
                            <Link href={`${WEBSITE_SHOP}?category=polo`}>Polo</Link>
                        </li>
                    </ul>
                </div>
                <div>
                    <h4 className='text-xl font-bold uppercase mb-5'>Userfull Links</h4>
                    <ul>
                        <li className='mb-2 text-gray-500'>
                            <Link href={WEBSITE_HOME}>Home</Link>
                        </li>
                        <li className='mb-2 text-gray-500'>
                            <Link href={WEBSITE_SHOP}>Shop</Link>
                        </li>
                        <li className='mb-2 text-gray-500'>
                            <Link href="/about-us">About</Link>
                        </li>
                        <li className='mb-2 text-gray-500'>
                            <Link href={WEBSITE_REGISTER}>Register</Link>
                        </li>
                        <li className='mb-2 text-gray-500'>
                            <Link href={WEBSITE_LOGIN}>Login</Link>
                        </li>

                    </ul>
                </div>
                <div>
                    <h4 className='text-xl font-bold uppercase mb-5'>Help Center</h4>
                    <ul>
                        <li className='mb-2 text-gray-500'>
                            <Link href={WEBSITE_REGISTER}>Register</Link>
                        </li>
                        <li className='mb-2 text-gray-500'>
                            <Link href={WEBSITE_LOGIN}>Login</Link>
                        </li>
                        <li className='mb-2 text-gray-500'>
                            <Link href={USER_DASHBOARD}>My Account</Link>
                        </li>
                        <li className='mb-2 text-gray-500'>
                            <Link href="/privacy-policy">Privacy Policy</Link>
                        </li>
                        <li className='mb-2 text-gray-500'>
                            <Link href="/terms-and-conditions">Terms & Conditions</Link>
                        </li>


                    </ul>
                </div>
                <div>
                    <h4 className='text-xl font-bold uppercase mb-5'>Contact Us </h4>
                    <ul>
                        <li className='mb-2 text-gray-500 flex gap-2'>
                            <MapPin className='size-5' />
                            <span className='text-sm'>MomStitched market Lucknow, India 256320</span>
                        </li>
                        <li className='mb-2 text-gray-500 flex gap-2'>
                            <Phone className='size-5' />
                            <Link href="tel:+91-8569874589" className='hover:text-primary text-sm'>+91-8569874589</Link>
                        </li>
                        <li className='mb-2 text-gray-500 flex gap-2'>
                            <Mail className='size-5' />
                            <Link href="mailto:momstitched.official@gmail.com" className='hover:text-primary text-sm'>momstitched.official@gmail.com</Link>
                        </li>

                    </ul>


                    <div className='flex gap-5 mt-5'>

                        <Link href="">
                            <Youtube className='text-primary size-6' />
                        </Link>
                        <Link href="">
                            <Instagram className='text-primary size-6' />
                        </Link>
                        <Link href="">
                            <MessageCircle className='text-primary size-6' />
                        </Link>
                        <Link href="">
                            <Facebook className='text-primary size-6' />
                        </Link>
                        <Link href="">
                            <Twitter className='text-primary size-6' />
                        </Link>

                    </div>

                </div>

            </div>


            <div className='py-5 bg-gray-100' >
                <p className='text-center'>© 2026 MomStitched. All Rights Reserved.</p>
            </div>

        </footer>
    )
}

export default Footer

import Link from 'next/link'
import React from 'react'
import { BiCategory } from "react-icons/bi";
import { IoShirtOutline } from "react-icons/io5";
import { RiCoupon2Line } from "react-icons/ri";
import { MdOutlinePermMedia } from "react-icons/md";
import { ADMIN_CATEGORY_ADD, ADMIN_COUPON_ADD, ADMIN_COUPON_SHOW, ADMIN_MEDIA_SHOW, ADMIN_PRODUCT_ADD } from '@/routes/AdminPanelRoute';
const QuickAdd = () => {
    return (
        <div className='grid lg:grid-cols-4 sm:grid-cols-2 gap-6 mt-10'>
            <Link href={ADMIN_CATEGORY_ADD}>
                <div className='flex items-center justify-between p-5 rounded-3xl shadow-[0_14px_32px_rgba(16,185,129,0.25)] bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-500 text-white'>
                    <h4 className='font-semibold'>Add Category</h4>
                    <span className='w-12 h-12 flex justify-center items-center rounded-full bg-white/20 border border-white/30'>
                        <BiCategory size={20} />
                    </span>
                </div>
            </Link>
            <Link href={ADMIN_PRODUCT_ADD}>
                <div className='flex items-center justify-between p-5 rounded-3xl shadow-[0_14px_32px_rgba(37,99,235,0.18)] bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 text-white'>
                    <h4 className='font-semibold'>Add Product</h4>
                    <span className='w-12 h-12 flex justify-center items-center rounded-full bg-white/20 border border-white/30'>
                        <IoShirtOutline size={20} />
                    </span>
                </div>
            </Link>
            <Link href={ADMIN_COUPON_ADD}>
                <div className='flex items-center justify-between p-5 rounded-3xl shadow-[0_14px_32px_rgba(234,179,8,0.2)] bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 text-white'>
                    <h4 className='font-semibold'>Add Coupon</h4>
                    <span className='w-12 h-12 flex justify-center items-center rounded-full bg-white/20 border border-white/30'>
                        <RiCoupon2Line size={20} />
                    </span>
                </div>
            </Link>
            <Link href={ADMIN_MEDIA_SHOW}>
                <div className='flex items-center justify-between p-5 rounded-3xl shadow-[0_14px_32px_rgba(8,145,178,0.2)] bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-white'>
                    <h4 className='font-semibold'>Upload Media</h4>
                    <span className='w-12 h-12 flex justify-center items-center rounded-full bg-white/20 border border-white/30'>
                        <MdOutlinePermMedia size={20} />
                    </span>
                </div>
            </Link>
        </div>
    )
}

export default QuickAdd
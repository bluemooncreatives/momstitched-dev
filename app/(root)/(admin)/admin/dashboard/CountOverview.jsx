'use client'
import Link from 'next/link'
import React from 'react'
import { BiCategory } from "react-icons/bi";
import { IoShirtOutline, IoArrowUp, IoArrowDown } from "react-icons/io5";
import { MdOutlineShoppingBag } from "react-icons/md";
import { LuUserRound } from "react-icons/lu";
import useFetch from '@/hooks/useFetch';
import { ADMIN_CATEGORY_SHOW, ADMIN_CUSTOMERS_SHOW, ADMIN_PRODUCT_SHOW, ADMIN_ORDER_SHOW } from '@/routes/AdminPanelRoute';
import { TrendingUp, TrendingDown } from 'lucide-react';
const CountOverview = () => {

    const { data: countData } = useFetch('/api/dashboard/admin/count')

    const getTrendInfo = (current, previous) => {
        if (!previous || previous === 0) {
            return { isIncreased: true, text: 'Increased from Last Month' }
        }
        const isIncreased = current > previous
        return {
            isIncreased,
            text: isIncreased ? 'Increased from Last Month' : 'Decreased from Last Month'
        }
    }

    const categoryTrend = getTrendInfo(countData?.data?.category || 0, countData?.data?.categoryPrevious)
    const productTrend = getTrendInfo(countData?.data?.product || 0, countData?.data?.productPrevious)
    const customerTrend = getTrendInfo(countData?.data?.customer || 0, countData?.data?.customerPrevious)
    const orderTrend = getTrendInfo(countData?.data?.order || 0, countData?.data?.orderPrevious)

    return (
        <div className='grid lg:grid-cols-4 sm:grid-cols-2 gap-6 font-neue'>
            <Link href={ADMIN_CATEGORY_SHOW}>
                <div className='p-6 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] bg-white border border-slate-100 hover:shadow-[0_8px_16px_rgba(0,0,0,0.12)] transition-shadow'>
                    <div className='space-y-4'>
                        <div className='flex justify-between items-start'>
                            <div>
                                <p className='text-sm font-medium text-slate-600 mb-2'>Total Categories</p>
                                <span className='text-3xl font-semibold text-slate-900'>{countData?.data?.category || 0}</span>
                            </div>
                            <div className='w-10 h-10 flex justify-center items-center rounded-lg bg-blue-50 text-blue-600'>
                                <BiCategory className='w-5 h-5'/>
                            </div>
                        </div>
                        <p className={`inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-1 ${
                            categoryTrend.isIncreased 
                                ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}>
                            {categoryTrend.isIncreased ? <TrendingUp className='w-3 h-3' /> : <TrendingDown className='w-3 h-3' />}
                            {categoryTrend.text}
                        </p>
                    </div>
                </div>
            </Link>
            <Link href={ADMIN_PRODUCT_SHOW}>
                <div className='p-6 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] bg-white border border-slate-100 hover:shadow-[0_8px_16px_rgba(0,0,0,0.12)] transition-shadow'>
                    <div className='space-y-4'>
                        <div className='flex justify-between items-start'>
                            <div>
                                <p className='text-sm font-medium text-slate-600 mb-2'>Total Products</p>
                                <span className='text-3xl font-semibold text-slate-900'>{countData?.data?.product || 0}</span>
                            </div>
                            <div className='w-10 h-10 flex justify-center items-center rounded-lg bg-purple-50 text-purple-600'>
                                <IoShirtOutline className='w-5 h-5'/>
                            </div>
                        </div>
                        <p className={`inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-1 ${
                            productTrend.isIncreased ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}>
                            {productTrend.isIncreased ? <TrendingUp className='w-3 h-3' /> : <TrendingDown className='w-3 h-3' />}
                            {productTrend.text}
                        </p>
                    </div>
                </div>
            </Link>
            <Link href={ADMIN_CUSTOMERS_SHOW}>
                <div className='p-6 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] bg-white border border-slate-100 hover:shadow-[0_8px_16px_rgba(0,0,0,0.12)] transition-shadow'>
                    <div className='space-y-4'>
                        <div className='flex justify-between items-start'>
                            <div>
                                <p className='text-sm font-medium text-slate-600 mb-2'>Total Customers</p>
                                <span className='text-3xl font-semibold text-slate-900'>{countData?.data?.customer || 0}</span>
                            </div>
                            <div className='w-10 h-10 flex justify-center items-center rounded-lg bg-orange-50 text-orange-600'>
                                <LuUserRound className='w-5 h-5'/>
                            </div>
                        </div>
                        <p className={`inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-1 ${
                            customerTrend.isIncreased ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}>
                            {customerTrend.isIncreased ? <TrendingUp className='w-3 h-3' /> : <TrendingDown className='w-3 h-3' />}
                            {customerTrend.text}
                        </p>
                    </div>
                </div>
            </Link>
            <Link href={ADMIN_ORDER_SHOW}>
                <div className='p-6 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] bg-white border border-slate-100 hover:shadow-[0_8px_16px_rgba(0,0,0,0.12)] transition-shadow'>
                    <div className='space-y-4'>
                        <div className='flex justify-between items-start'>
                            <div>
                                <p className='text-sm font-medium text-slate-600 mb-2'>Total Orders</p>
                                <span className='text-3xl font-semibold text-slate-900'>{countData?.data?.order || 0}</span>
                            </div>
                            <div className='w-10 h-10 flex justify-center items-center rounded-lg bg-cyan-50 text-cyan-600'>
                                <MdOutlineShoppingBag className='w-5 h-5'/>
                            </div>
                        </div>
                        <p className={`inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-1 ${
                            orderTrend.isIncreased ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}>
                            {orderTrend.isIncreased ? <TrendingUp className='w-3 h-3' /> : <TrendingDown className='w-3 h-3' />}
                            {orderTrend.text}
                        </p>
                    </div>
                </div>
            </Link>
        </div>
    )
}

export default CountOverview
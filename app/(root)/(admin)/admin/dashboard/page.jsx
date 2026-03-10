import React from 'react'
import CountOverview from './CountOverview'
import QuickAdd from './QuickAdd'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { OrderOverview } from './OrderOverview'
import { OrderStatus } from './OrderStatus'
import LatestOrder from './LatestOrder'
import LatestReview from './LatestReview'
import { ADMIN_ORDER_SHOW, ADMIN_REVIEW_SHOW, ADMIN_PRODUCT_ADD, ADMIN_MEDIA_SHOW } from '@/routes/AdminPanelRoute'

const AdminDashboard = () => {
    return (
        <div className='space-y-8'>
            <div className='flex justify-between items-start'>
                <div>
                    <h1 className='text-3xl font-bold text-slate-900 mb-1'>Dashboard</h1>
                    <p className='text-sm text-slate-500'>Welcome back! Here's your store overview.</p>
                </div>
                <div className='flex gap-3'>
                    <Link href={ADMIN_PRODUCT_ADD}>
                        <Button variant="custom" className="gap-2">
                            <span>+</span>
                            Add Product
                        </Button>
                    </Link>
                    <Link href={ADMIN_MEDIA_SHOW}>
                        <Button variant="customOutline">
                            Upload Media
                        </Button>
                    </Link>
                </div>
            </div>

            <CountOverview />
            <QuickAdd />

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                <Card className="lg:col-span-2 p-6 rounded-2xl border-0 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                    <CardHeader className="p-0 mb-6">
                        <div className='flex justify-between items-center'>
                            <span className='text-base font-semibold text-slate-900'>Revenue Status</span>
                            <Button type="button" variant="ghost" className="text-xs">
                                <Link href={ADMIN_ORDER_SHOW}>View All</Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className='p-0'>
                        <OrderOverview />
                    </CardContent>
                </Card>

                <Card className="p-6 rounded-2xl border-0 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                    <CardHeader className="p-0 mb-6">
                        <div className='flex justify-between items-center'>
                            <span className='text-base font-semibold text-slate-900'>Audience Overview</span>
                            <Button type="button" variant="ghost" className="text-xs">
                                <Link href={ADMIN_ORDER_SHOW}>View All</Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className='p-0'>
                        <OrderStatus />
                    </CardContent>
                </Card>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                <Card className="lg:col-span-2 p-6 rounded-2xl border-0 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                    <CardHeader className="p-0 mb-6">
                        <div className='flex justify-between items-center'>
                            <span className='text-base font-semibold text-slate-900'>Earnings Reports</span>
                            <Button type="button" variant="ghost" className="text-xs">
                                <Link href={ADMIN_ORDER_SHOW}>View All</Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className='p-0 overflow-auto max-h-[320px]'>
                        <LatestOrder />
                    </CardContent>
                </Card>

                <Card className="p-6 rounded-2xl border-0 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                    <CardHeader className="p-0 mb-6">
                        <div className='flex justify-between items-center'>
                            <span className='text-base font-semibold text-slate-900'>Most Popular Products</span>
                            <Button type="button" variant="ghost" className="text-xs">
                                <Link href={ADMIN_REVIEW_SHOW}>View All</Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className='p-0 overflow-auto max-h-[320px]'>
                        <LatestReview />
                    </CardContent>
                </Card>
            </div>

        </div>
    )
}

export default AdminDashboard
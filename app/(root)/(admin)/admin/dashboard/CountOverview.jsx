'use client'
import Link from 'next/link'
import React from 'react'
import useFetch from '@/hooks/useFetch';
import { ADMIN_CATEGORY_SHOW, ADMIN_CUSTOMERS_SHOW, ADMIN_PRODUCT_SHOW, ADMIN_ORDER_SHOW } from '@/routes/AdminPanelRoute';
import { FolderTree, Shirt, UsersRound, ShoppingBag, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

    const cards = [
        {
            title: 'Total Categories',
            value: countData?.data?.category || 0,
            trend: categoryTrend,
            href: ADMIN_CATEGORY_SHOW,
            icon: FolderTree,
            bg: 'bg-emerald-500',
            border: 'border-emerald-500',
            label: 'Categories'
        },
        {
            title: 'Total Products',
            value: countData?.data?.product || 0,
            trend: productTrend,
            href: ADMIN_PRODUCT_SHOW,
            icon: Shirt,
            bg: 'bg-indigo-500',
            border: 'border-indigo-500',
            label: 'Products'
        },
        {
            title: 'Total Customers',
            value: countData?.data?.customer || 0,
            trend: customerTrend,
            href: ADMIN_CUSTOMERS_SHOW,
            icon: UsersRound,
            bg: 'bg-violet-500',
            border: 'border-violet-500',
            label: 'Customers'
        },
        {
            title: 'Total Orders',
            value: countData?.data?.order || 0,
            trend: orderTrend,
            href: ADMIN_ORDER_SHOW,
            icon: ShoppingBag,
            bg: 'bg-amber-500',
            border: 'border-amber-500',
            label: 'Orders'
        },
    ]

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
                <Link key={card.title} href={card.href} aria-label={`${card.title}: ${card.value}`}>
                        <Card className={`${card.border} border-l-4 hover:border-l-8`}> 
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="flex items-center gap-2">
                                    <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                                    <span className={`${card.bg} text-white text-xs px-2 py-0.5 rounded-full`} aria-hidden>{card.label}</span>
                                </div>
                                <card.icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold">{card.value}</div>
                            <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                {card.trend.isIncreased ? (
                                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                                ) : (
                                    <TrendingDown className="h-3 w-3 text-rose-500" />
                                )}
                                {card.trend.text}
                            </p>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    )
}

export default CountOverview

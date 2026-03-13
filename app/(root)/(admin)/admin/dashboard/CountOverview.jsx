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
        },
        {
            title: 'Total Products',
            value: countData?.data?.product || 0,
            trend: productTrend,
            href: ADMIN_PRODUCT_SHOW,
            icon: Shirt,
        },
        {
            title: 'Total Customers',
            value: countData?.data?.customer || 0,
            trend: customerTrend,
            href: ADMIN_CUSTOMERS_SHOW,
            icon: UsersRound,
        },
        {
            title: 'Total Orders',
            value: countData?.data?.order || 0,
            trend: orderTrend,
            href: ADMIN_ORDER_SHOW,
            icon: ShoppingBag,
        },
    ]

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
                <Link key={card.title} href={card.href}>
                    <Card className="transition-shadow hover:shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                            <card.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{card.value}</div>
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

import Link from 'next/link'
import React from 'react'
import { FolderTree, Shirt, TicketPercent, Images } from 'lucide-react'
import { ADMIN_CATEGORY_ADD, ADMIN_COUPON_ADD, ADMIN_COUPON_SHOW, ADMIN_MEDIA_SHOW, ADMIN_PRODUCT_ADD } from '@/routes/AdminPanelRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
const QuickAdd = () => {
    const quickLinks = [
        {
            title: 'Add Category',
            href: ADMIN_CATEGORY_ADD,
            icon: FolderTree,
            description: 'Create a new category',
        },
        {
            title: 'Add Product',
            href: ADMIN_PRODUCT_ADD,
            icon: Shirt,
            description: 'Add a new product',
        },
        {
            title: 'Add Coupon',
            href: ADMIN_COUPON_ADD,
            icon: TicketPercent,
            description: 'Create a discount code',
        },
        {
            title: 'Upload Media',
            href: ADMIN_MEDIA_SHOW,
            icon: Images,
            description: 'Manage media assets',
        },
    ]

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map((link) => (
                <Link key={link.title} href={link.href}>
                    <Card className="transition-shadow hover:shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{link.title}</CardTitle>
                            <link.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">{link.description}</p>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    )
}

export default QuickAdd

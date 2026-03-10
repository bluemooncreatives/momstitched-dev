'use client'

import {
    Table,
    TableBody,

    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import useFetch from "@/hooks/useFetch"
import Image from "next/image"
import notFound from '@/public/assets/images/not-found.png'
import { useEffect, useState } from "react"
import { statusBadge } from "@/lib/helperFunction"
const LatestOrder = () => {
    const [latestOrder, setLatestOrder] = useState()
    const { data, loading } = useFetch('/api/dashboard/admin/latest-order')

    useEffect(() => {
        if (data && data.success) {
            setLatestOrder(data.data)
        }
    }, [data])

    if (loading) return <div className="h-full w-full flex justify-center items-center">Loading...</div>

    if (!latestOrder || latestOrder.length === 0) return <div className="h-full w-full flex justify-center items-center">
        <Image src={notFound.src} width={notFound.width} height={notFound.height} alt="not found" className="w-20" />
    </div>

    return (
        <Table>
            <TableHeader>
                <TableRow className="border-b border-slate-200 hover:bg-transparent">
                    <TableHead className="text-slate-700 font-semibold text-xs">Order Id</TableHead>
                    <TableHead className="text-slate-700 font-semibold text-xs">Payment Id</TableHead>
                    <TableHead className="text-slate-700 font-semibold text-xs">Total Item</TableHead>
                    <TableHead className="text-slate-700 font-semibold text-xs">Status</TableHead>
                    <TableHead className="text-slate-700 font-semibold text-xs">Amount</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {latestOrder?.map((order) => (
                    <TableRow key={order._id} className="border-b border-slate-100 hover:bg-slate-50 text-sm">
                        <TableCell className="text-slate-700 font-medium py-3">{order._id}</TableCell>
                        <TableCell className="text-slate-600 py-3">{order.payment_id}</TableCell>
                        <TableCell className="text-slate-600 py-3">{order.products.length}</TableCell>
                        <TableCell className="py-3">{statusBadge(order.status)}</TableCell>
                        <TableCell className="text-slate-900 font-medium py-3">${order.totalAmount}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export default LatestOrder
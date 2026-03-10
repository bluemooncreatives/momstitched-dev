'use client'
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { IoStar } from "react-icons/io5";

import imgPlaceholder from '@/public/assets/images/img-placeholder.webp'
import useFetch from "@/hooks/useFetch";
import { useEffect, useState } from "react";
import Image from "next/image"
import notFound from '@/public/assets/images/not-found.png'
const LatestReview = () => {
    const [latestReview, setLatestReview] = useState()
    const { data: getLatestReview, loading } = useFetch('/api/dashboard/admin/latest-review')

    useEffect(() => {
        if (getLatestReview && getLatestReview.success) {
            setLatestReview(getLatestReview.data)
        }
    }, [getLatestReview])

    if (loading) return <div className="h-full w-full flex justify-center items-center">Loading...</div>

    if (!latestReview || latestReview.length === 0) return <div className="h-full w-full flex justify-center items-center">
        <Image src={notFound.src} width={notFound.width} height={notFound.height} alt="not found" className="w-20" />
    </div>

    return (
        <Table>
            <TableHeader>
                <TableRow className="border-b border-slate-200 hover:bg-transparent">
                    <TableHead className="text-slate-700 font-semibold text-xs">Product</TableHead>
                    <TableHead className="text-slate-700 font-semibold text-xs">Rating</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {latestReview?.map((review) => (
                    <TableRow key={review._id} className="border-b border-slate-100 hover:bg-slate-50 text-sm">
                        <TableCell className="py-3">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={review?.product?.media[0]?.secure_url || imgPlaceholder.src} />
                                </Avatar>
                                <span className="line-clamp-1 text-slate-700 font-medium">{review?.product?.name || 'Not found'}</span>
                            </div>
                        </TableCell>
                        <TableCell className="py-3">
                            <div className="flex items-center gap-1">
                                {Array.from({ length: review.rating }).map((_, i) => (
                                    <span key={i}>
                                        <IoStar className="text-yellow-400 w-4 h-4" />
                                    </span>
                                ))}
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export default LatestReview
"use client"

import { Label, Pie, PieChart } from "recharts"

import {

    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { useEffect, useState } from "react"
import useFetch from "@/hooks/useFetch"


const chartConfig = {
    status: {
        label: "Status",
    },
    pending: {
        label: "Pending",
        color: "#3b82f6",
    },
    processing: {
        label: "Processing",
        color: "#eab308",
    },
    shipped: {
        label: "Shipped",
        color: "#06b6d4",
    },
    delivered: {
        label: "Delivered",
        color: "#22c55e",
    },
    cancelled: {
        label: "Cancelled",
        color: "#ef4444",
    },
    unverified: {
        label: "Unverified",
        color: "#f97316",
    },
}

export function OrderStatus() {
    const [chartData, setChartData] = useState([])
    const [statusCount, setStatusCount] = useState()
    const [totalCount, setTotalCount] = useState(0)
    const { data: orderStatus, loading } = useFetch('/api/dashboard/admin/order-status')

    useEffect(() => {
        if (orderStatus && orderStatus.success) {
            const newOrderStatus = orderStatus.data.map((o) => ({
                status: o._id,
                count: o.count,
                fill: `var(--color-${o._id})`
            }))

            setChartData(newOrderStatus)

            const getTotalCount = orderStatus.data.reduce((acc, curr) => acc + curr.count, 0)
            setTotalCount(getTotalCount)

            const statusObj = orderStatus.data.reduce((acc, item) => {
                acc[item._id] = item.count
                return acc;
            }, {})

            setStatusCount(statusObj)
        }
    }, [orderStatus])

    return (
        <div className="space-y-4">
            <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[260px]"
            >
                <PieChart>
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent />}
                    />
                    <Pie
                        data={chartData}
                        dataKey="count"
                        nameKey="status"
                        innerRadius={60}
                    >

                        <Label
                            content={({ viewBox }) => {
                                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                    return (
                                        <text
                                            x={viewBox.cx}
                                            y={viewBox.cy}
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                        >
                                            <tspan
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                className="fill-foreground text-3xl font-bold"
                                            >
                                                {totalCount}
                                            </tspan>
                                            <tspan
                                                x={viewBox.cx}
                                                y={(viewBox.cy || 0) + 24}
                                                className="fill-muted-foreground"
                                            >
                                                Orders
                                            </tspan>
                                        </text>
                                    )
                                }
                            }}
                        />

                    </Pie>



                </PieChart>
            </ChartContainer>

            <div>
                <ul className="space-y-3 text-sm">
                    <li className="flex justify-between items-center">
                        <span className="text-muted-foreground">Pending</span>
                        <span className="rounded-full px-3 py-1 text-xs font-semibold bg-blue-50 text-blue-600">{statusCount?.pending || 0}</span>
                    </li>
                    <li className="flex justify-between items-center">
                        <span className="text-muted-foreground">Processing</span>
                        <span className="rounded-full px-3 py-1 text-xs font-semibold bg-amber-50 text-amber-600">{statusCount?.processing || 0}</span>
                    </li>
                    <li className="flex justify-between items-center">
                        <span className="text-muted-foreground">Shipped</span>
                        <span className="rounded-full px-3 py-1 text-xs font-semibold bg-cyan-50 text-cyan-600">{statusCount?.shipped || 0}</span>
                    </li>
                    <li className="flex justify-between items-center">
                        <span className="text-muted-foreground">Delivered</span>
                        <span className="rounded-full px-3 py-1 text-xs font-semibold bg-emerald-50 text-emerald-600">{statusCount?.delivered || 0}</span>
                    </li>
                    <li className="flex justify-between items-center">
                        <span className="text-muted-foreground">Cancelled</span>
                        <span className="rounded-full px-3 py-1 text-xs font-semibold bg-red-50 text-red-600">{statusCount?.cancelled || 0}</span>
                    </li>
                    <li className="flex justify-between items-center">
                        <span className="text-muted-foreground">Unverified</span>
                        <span className="rounded-full px-3 py-1 text-xs font-semibold bg-orange-50 text-orange-600">{statusCount?.unverified || 0}</span>
                    </li>
                </ul>
            </div>

        </div>
    )
}

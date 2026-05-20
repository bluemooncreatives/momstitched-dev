'use client'
import UserPanelLayout from '@/components/Application/Website/UserPanelLayout'
import WebsiteBreadcrumb from '@/components/Application/Website/WebsiteBreadcrumb'
import useFetch from '@/hooks/useFetch'
import { WEBSITE_ORDER_DETAILS } from '@/routes/WebsiteRoute'
import Link from 'next/link'
const breadCrumbData = {
    title: 'Orders',
    links: [{ label: 'Orders' }]
}
const Orders = () => {
    const { data: orderData, loading } = useFetch("/api/user-order")

    return (
        <div>
            <WebsiteBreadcrumb props={breadCrumbData} />
            <UserPanelLayout>

                <div className='shadow rounded'>
                    <div className='p-5 text-xl font-semibold border-b'>
                        Orders
                    </div>
                    <div className='p-5'>
                        {loading ? (
                            <div className='py-10 text-center text-sm text-gray-400'>Loading...</div>
                        ) : !orderData?.data?.length ? (
                            <div className='flex flex-col items-center gap-3 py-16 text-center'>
                                <p className='text-lg font-semibold text-[var(--dark-red-2)]'>No orders yet</p>
                                <p className='max-w-xs text-sm text-gray-400'>
                                    You haven&apos;t placed any orders. Explore our collections and find something you love.
                                </p>
                                <Link
                                    href='/shop'
                                    className='mt-2 bg-[var(--dark-red)] px-6 py-2.5 text-sm font-medium uppercase tracking-widest text-white transition-colors hover:bg-[var(--dark-red-2)]'
                                >
                                    Shop Now
                                </Link>
                            </div>
                        ) : (
                            <div className='overflow-auto'>
                                <table className='w-full'>
                                    <thead>
                                        <tr>
                                            <th className='text-start p-2 text-sm border-b text-nowrap text-gray-500'>Sr.No.</th>
                                            <th className='text-start p-2 text-sm border-b text-nowrap text-gray-500'>Order id</th>
                                            <th className='text-start p-2 text-sm border-b text-nowrap text-gray-500'>Total Item</th>
                                            <th className='text-start p-2 text-sm border-b text-nowrap text-gray-500'>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orderData.data.map((order, i) => (
                                            <tr key={order._id}>
                                                <td className='text-start text-sm text-gray-500 p-2 font-bold'>{i + 1}</td>
                                                <td className='text-start text-sm text-gray-500 p-2'>
                                                    <Link className='underline hover:text-blue-500 underline-offset-2' href={WEBSITE_ORDER_DETAILS(order.order_id)}>
                                                        {order.order_id}
                                                    </Link>
                                                </td>
                                                <td className='text-start text-sm text-gray-500 p-2'>{order.products.length}</td>
                                                <td className='text-start text-sm text-gray-500 p-2'>
                                                    {order.totalAmount.toLocaleString('en-In', { style: 'currency', currency: 'INR' })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                    </div>
                </div>
            </UserPanelLayout>
        </div>
    )
}

export default Orders

import Image from 'next/image'
import React, { memo } from 'react'
import imgPlaceholder from '@/public/assets/images/img-placeholder.webp'
import Link from 'next/link'
import { WEBSITE_PRODUCT_DETAILS } from '@/routes/WebsiteRoute'
import { Eye, Star } from 'lucide-react'
const ProductBox = ({ product }) => {
    const hasDiscount = product?.mrp > product?.sellingPrice
    const discount = hasDiscount ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100) : 0
    const rating = Number(product?.ratingAvg || 0)
    const filledStars = Math.round(rating)

    return (
        <div className='group relative overflow-hidden rounded-[var(--admin-shell-radius)] border border-border/60 bg-white transition duration-300 hover:-translate-y-0.5 hover:border-foreground/35 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)]'>
            <div className="flex h-full flex-col">
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#f4f4f3]">
                    <span className={`absolute right-4 top-4 z-10 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${hasDiscount ? 'border-[var(--dark-red)] bg-[var(--secondary)] text-[var(--dark-red)]' : 'border-border/60 bg-white/90 text-foreground/70'}`}>
                        {hasDiscount ? `Sale ${discount}%` : 'Hot'}
                    </span>
                    <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 rounded-full border border-border/30 bg-white/60 px-6 py-6 text-foreground/70 opacity-0 shadow-sm transition-opacity duration-300 group-hover:opacity-100">
                        <Eye className="size-5" />
                    </div>
                    <Link href={WEBSITE_PRODUCT_DETAILS(product.slug)} className="block h-full w-full">
                        <Image
                            src={product?.media[0]?.secure_url || imgPlaceholder.src}
                            width={600}
                            height={750}
                            alt={product?.media[0]?.alt || product?.name}
                            title={product?.media[0]?.title || product?.name}
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                            className='h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105'
                        />
                    </Link>
                </div>
                <div className="flex flex-1 flex-col items-center justify-center gap-2 border-t border-border/60 px-4 py-5 text-center font-neue">
                    <Link href={WEBSITE_PRODUCT_DETAILS(product.slug)} className="block">
                        <h4 className="line-clamp-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-foreground/95">
                            {product?.name}
                        </h4>
                    </Link>
                    <div className="flex items-center gap-1 text-foreground/70">
                        {Array.from({ length: 5 }).map((_, index) => {
                            const isFilled = index < filledStars
                            return (
                                <Star
                                    key={index}
                                    className={`size-3 ${isFilled ? 'fill-foreground/70 text-foreground/70' : 'text-foreground/25'}`}
                                />
                            )
                        })}
                    </div>
                    <Link
                        href={WEBSITE_PRODUCT_DETAILS(product.slug)}
                        className="mt-1 inline-flex min-w-[160px] items-center justify-center rounded-sm border border-[var(--dark-red)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.32em] text-[var(--dark-red)] transition-colors hover:bg-[var(--dark-red)] hover:text-white"
                    >
                        Buy Product
                    </Link>
                    <div className='mt-1 flex items-center gap-2 text-sm'>
                        <span className='text-[15px] font-semibold text-foreground'>
                            {product?.sellingPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                        </span>
                        {hasDiscount && (
                            <span className='text-[11px] text-muted-foreground line-through'>
                                {product?.mrp.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default memo(ProductBox)

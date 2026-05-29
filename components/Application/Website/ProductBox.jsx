import Image from 'next/image'
import { memo } from 'react'
import imgPlaceholder from '@/public/assets/images/img-placeholder.webp'
import Link from 'next/link'
import { WEBSITE_PRODUCT_DETAILS } from '@/routes/WebsiteRoute'
import { Eye, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'

const ProductBox = ({ product }) => {
    const hasDiscount = product?.mrp > product?.sellingPrice
    const discount = hasDiscount ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100) : 0
    const rating = Number(product?.ratingAvg || 0)
    const filledStars = Math.round(rating)

    return (
        <div className='group relative overflow-hidden rounded-[var(--radius)] border border-border/60 bg-background transition duration-300 hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-[var(--shadow-card-hover)]'>
            <div className="flex h-full flex-col">
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-[var(--product-card-bg)]">
                    <span className={`absolute right-3 top-3 z-10 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${hasDiscount ? 'border-[var(--dark-red)] bg-background text-[var(--dark-red)]' : 'border-border/60 bg-background/90 text-foreground/60'}`}>
                        {hasDiscount ? `Sale ${discount}%` : 'Hot'}
                    </span>
                    <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 rounded-full border border-border/30 bg-background/70 px-6 py-6 text-foreground/60 opacity-0 shadow-sm backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
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
                        <h4 className="line-clamp-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-foreground">
                            {product?.name}
                        </h4>
                    </Link>

                    <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, index) => {
                            const isFilled = index < filledStars
                            return (
                                <Star
                                    key={index}
                                    className={`size-3 ${isFilled ? 'fill-[var(--dark-red)] text-[var(--dark-red)]' : 'text-foreground/20'}`}
                                />
                            )
                        })}
                    </div>

                    <Button
                        asChild
                        variant="brand-outline"
                        className="mt-1 h-8 min-w-[150px] rounded-md px-4 text-[10px] font-semibold uppercase tracking-[0.28em]"
                    >
                        <Link href={WEBSITE_PRODUCT_DETAILS(product.slug)}>
                            Buy Product
                        </Link>
                    </Button>

                    <div className='mt-1 flex items-center gap-2'>
                        <span className='text-[15px] font-semibold text-foreground'>
                            {product?.sellingPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                        </span>
                        {hasDiscount && (
                            <span className='text-[11px] text-stone-500 line-through'>
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

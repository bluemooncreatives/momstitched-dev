'use client'

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Minus, Plus, Star } from 'lucide-react'
import { WEBSITE_CART, WEBSITE_PRODUCT_DETAILS, WEBSITE_SHOP } from "@/routes/WebsiteRoute"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import imgPlaceholder from '@/public/assets/images/img-placeholder.webp'
import { decode } from "entities";
import ButtonLoading from "@/components/Application/ButtonLoading";
import { useDispatch, useSelector } from "react-redux";
import { addIntoCart } from "@/store/reducer/cartReducer";
import { showToast } from "@/lib/showToast";
import { Button } from "@/components/ui/button";
import loadingSvg from '@/public/assets/images/loading.svg'
import ProductReveiw from "@/components/Application/Website/ProductReveiw";
import SizeGuideModal from "@/components/Application/Website/SizeGuideModal";
const ProductDetails = ({ product, variant, colors, sizes, reviewCount }) => {

    const dispatch = useDispatch()
    const cartStore = useSelector(store => store.cartStore)
    
    const [activeThumb, setActiveThumb] = useState()
    const [qty, setQty] = useState(1)
    const [isAddedIntoCart, setIsAddedIntoCart] = useState(false)
    const [isProductLoading, setIsProductLoading] = useState(false)
    const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false)
    useEffect(() => {
        setActiveThumb(variant?.media[0]?.secure_url)
    }, [variant])

    useEffect(() => {
        if (cartStore.count > 0) {
            const existingProduct = cartStore.products.findIndex((cartProduct) => cartProduct.productId === product._id && cartProduct.variantId === variant._id)

            if (existingProduct >= 0) {
                setIsAddedIntoCart(true)
            } else {
                setIsAddedIntoCart(false)
            }
        }

        setIsProductLoading(false)

    }, [variant])

    const handleThumb = (thumbUrl) => {
        setActiveThumb(thumbUrl)
    }

    const handleQty = (actionType) => {
        if (actionType === 'inc') {
            setQty(prev => prev + 1)
        } else {
            if (qty !== 1) {
                setQty(prev => prev - 1)
            }
        }
    }


    const handleAddToCart = () => {
        const cartProduct = {
            productId: product._id,
            variantId: variant._id,
            name: product.name,
            url: product.slug,
            size: variant.size,
            color: variant.color,
            mrp: variant.mrp,
            sellingPrice: variant.sellingPrice,
            media: variant?.media[0]?.secure_url,
            qty: qty
        }

        dispatch(addIntoCart(cartProduct))
        setIsAddedIntoCart(true)
        showToast('success', 'Product added into cart.')
    }

    return (
        <section className="website-gutter bg-[linear-gradient(180deg,rgba(62,0,13,0.03),transparent_20%)] py-10 lg:py-14">
            <div className="website-content font-neue">

            {isProductLoading &&
                <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50">
                    <Image src={loadingSvg} width={80} height={80} alt="Loading" />
                </div>
            }

            <div className="mb-8">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href={WEBSITE_SHOP}>Product</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href={WEBSITE_PRODUCT_DETAILS(product?.slug)}>{product?.name} </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <div className="grid items-start gap-7 lg:grid-cols-[1.05fr_1fr] lg:gap-9 mb-16">
                <div className="rounded-[var(--admin-shell-radius)] border border-border/60 bg-white p-4 shadow-sm md:sticky md:top-6">
                    <div className="grid gap-4 xl:grid-cols-[88px_1fr]">
                        <div className="order-2 flex gap-3 overflow-auto pb-2 xl:order-1 xl:max-h-[540px] xl:flex-col xl:pb-0">
                            {variant?.media?.map((thumb) => (
                                <Image
                                    key={thumb._id}
                                    src={thumb?.secure_url || imgPlaceholder.src}
                                    width={92}
                                    height={92}
                                    alt="product thumbnail"
                                    className={`h-[84px] w-[84px] rounded-md cursor-pointer border object-cover object-center transition xl:h-[92px] xl:w-[92px] ${thumb.secure_url === activeThumb ? 'border-[var(--dark-red)] ring-1 ring-[var(--dark-red)]/25' : 'border-border/70 hover:border-foreground/40'}`}
                                    onClick={() => handleThumb(thumb.secure_url)}
                                />
                            ))}
                        </div>
                        <div className="order-1 xl:order-2 rounded-md border border-border/60 bg-[#f6f6f5] p-4">
                            <div className="overflow-hidden rounded-md">
                                <Image
                                    src={activeThumb || imgPlaceholder.src}
                                    width={700}
                                    height={700}
                                    alt="product"
                                    className="h-full w-full object-contain"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-[var(--admin-shell-radius)] border border-border/60 bg-white p-5 shadow-sm lg:p-6">
                    <h1 className="text-2xl font-semibold uppercase tracking-[0.04em] lg:text-3xl">{product.name}</h1>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1 text-foreground">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className='size-4 fill-foreground text-foreground' />
                            ))}
                        </div>
                        <span className="text-sm text-muted-foreground">({reviewCount} Reviews)</span>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="text-2xl font-semibold text-foreground">{variant.sellingPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                        <span className="text-sm line-through text-muted-foreground">{variant.mrp.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                        <span className="ms-2 rounded-md bg-[var(--dark-red)] px-2.5 py-1 text-[11px] font-semibold text-white">-{variant.discountPercentage}%</span>
                    </div>

                    <div className="mt-5 rounded-md border border-border/70 bg-muted/30 p-3 text-sm leading-relaxed text-foreground/85">
                        <div className="line-clamp-3" dangerouslySetInnerHTML={{ __html: decode(product.description) }}></div>
                    </div>

                    <div className="mt-5 space-y-4">
                        <div>
                            <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Color: <span className="text-foreground">{variant?.color}</span></p>
                            <div className="flex flex-wrap gap-2">
                                {colors.map(color => (
                                    <Link onClick={() => setIsProductLoading(true)} href={`${WEBSITE_PRODUCT_DETAILS(product.slug)}?color=${color}&size=${variant.size}`}
                                        key={color}
                                        className={`rounded-md border px-3 py-1.5 text-sm transition ${color === variant.color ? 'border-[var(--dark-red)] bg-[var(--dark-red)] text-white' : 'border-border/70 hover:border-foreground/40 hover:bg-muted/30'}`}
                                    >
                                        {color}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="mb-2 flex items-center justify-between gap-3">
                                <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Size: <span className="text-foreground">{variant?.size}</span></p>
                                <Button
                                    type="button"
                                    variant="link"
                                    className="h-auto p-0 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--dark-red)]"
                                    onClick={() => setIsSizeGuideOpen(true)}
                                >
                                    Size Guide
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {sizes.map(size => (
                                    <Link onClick={() => setIsProductLoading(true)} href={`${WEBSITE_PRODUCT_DETAILS(product.slug)}?color=${variant.color}&size=${size}`}
                                        key={size}
                                        className={`rounded-md border px-3 py-1.5 text-sm transition ${size === variant.size ? 'border-[var(--dark-red)] bg-[var(--dark-red)] text-white' : 'border-border/70 hover:border-foreground/40 hover:bg-muted/30'}`}
                                    >
                                        {size}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-5">
                        <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Quantity</p>
                        <div className="inline-flex items-center h-10 rounded-md border border-border/70 bg-white">
                            <button type="button" className="h-full w-10 flex justify-center items-center text-foreground/80 hover:text-foreground" onClick={() => handleQty('desc')}>
                                <Minus className='size-4' />
                            </button>
                            <input type="text" value={qty} className="w-14 bg-transparent text-center border-none outline-offset-0" readOnly />
                            <button type="button" className="h-full w-10 flex justify-center items-center text-foreground/80 hover:text-foreground" onClick={() => handleQty('inc')}>
                                <Plus className='size-4' />
                            </button>
                        </div>
                    </div>

                    <div className="mt-5">
                        {!isAddedIntoCart ?
                            <ButtonLoading type="button" text="Add To Cart" variant="brand" className="h-11 w-full text-[12px] font-semibold uppercase tracking-[0.2em]" onClick={handleAddToCart} />
                            :
                            <Button variant="brand" className="h-11 w-full text-[12px] font-semibold uppercase tracking-[0.2em]" type="button" asChild>
                                <Link href={WEBSITE_CART}>Go To Cart</Link>
                            </Button>
                        }
                    </div>
                </div>
            </div>

            <SizeGuideModal
                open={isSizeGuideOpen}
                onOpenChange={setIsSizeGuideOpen}
                sizeGuide={product?.sizeGuide}
            />

            <div className="mb-10 rounded-[var(--admin-shell-radius)] border border-border/60 bg-white shadow-sm">
                <div className="border-b border-border/60 px-5 py-4">
                    <h2 className="text-xl font-semibold uppercase tracking-[0.04em]">Product Description</h2>
                </div>
                <div className="p-5 leading-relaxed text-foreground/85">
                    <div dangerouslySetInnerHTML={{ __html: decode(product.description) }}></div>
                </div>
            </div>

            <ProductReveiw productId={product._id} />
            </div>
        </section>
    )
}

export default ProductDetails
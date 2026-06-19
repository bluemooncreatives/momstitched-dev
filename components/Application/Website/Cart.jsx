'use client'
import { ShoppingCart, ShoppingCartIcon } from 'lucide-react'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import imgPlaceholder from '@/public/assets/images/img-placeholder.webp'
import { removeFromCart } from "@/store/reducer/cartReducer";
import Link from "next/link";
import { WEBSITE_CART, WEBSITE_CHECKOUT } from "@/routes/WebsiteRoute";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { showToast } from "@/lib/showToast";
const Cart = () => {
    const [open, setOpen] = useState(false)
    const [subtotal, setSubTotal] = useState(0)
    const [discount, setDiscount] = useState(0)

    // The cart store is rehydrated from localStorage by redux-persist on the
    // client. Until this component has mounted we mirror the server-rendered
    // initial state (count 0) so the first client render matches the SSR HTML
    // and we don't trigger a hydration mismatch (React #418) for returning
    // visitors who already have items in their cart.
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])

    const cart = useSelector(store => store.cartStore)
    const dispatch = useDispatch()

    const cartCount = mounted ? cart.count : 0


    useEffect(() => {
        const cartProducts = cart.products

        const totalAmount = cartProducts.reduce((sum, product) => sum + (product.sellingPrice * product.qty), 0)

        const discount = cartProducts.reduce((sum, product) => sum + ((product.mrp - product.sellingPrice) * product.qty), 0)


        setSubTotal(totalAmount)
        setDiscount(discount)



    }, [cart])


    return (
        <Sheet open={open} onOpenChange={setOpen} >
            <SheetTrigger className="relative flex items-center justify-center rounded-md px-2.5 py-2 transition hover:bg-muted/40">
                <ShoppingCart className="h-5 w-5 text-foreground" strokeWidth={1.75} />
                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--dark-red)] px-1 text-[10px] font-semibold text-white">{cartCount}</span>
            </SheetTrigger>
            <SheetContent className="w-full border-l border-border/70 bg-background p-0 sm:max-w-[460px]">
                <SheetHeader className='border-b border-border/60 px-5 py-4'>
                    <SheetTitle className="font-neue text-2xl font-semibold tracking-[0.01em]">My Cart</SheetTitle>
                    <SheetDescription></SheetDescription>
                </SheetHeader>

                <div className="flex h-[calc(100dvh-80px)] flex-col">
                    <div className="flex-1 overflow-auto px-5 py-4">
                        {cart.count === 0 && <div className="flex h-full flex-col items-center justify-center rounded-md border border-dashed border-border/70 bg-muted/20 px-6 text-center">
                            <ShoppingCartIcon className="font-neue text-3xl leading-none"/>
                            <p className="mt-3 font-neue text-2xl font-semibold">Your cart is empty</p>
                            <p className="mt-2 max-w-[280px] text-sm text-muted-foreground">Add pieces you love to see them here with pricing and quick checkout.</p>
                        </div>}

                        {cart.products?.map(product => (
                            <div key={product.variantId} className="mb-4 flex items-center justify-between gap-4 rounded-md border border-border/70 p-3">
                                <div className="flex items-center gap-3.5">
                                    <Image src={product?.media || imgPlaceholder.src} height={100} width={100} alt={product.name} className="h-20 w-20 rounded-md border border-border/60 object-cover" />

                                    <div >
                                        <h4 className="line-clamp-1 font-neue text-[15px] font-semibold">{product.name}</h4>
                                        <p className="mt-0.5 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                                            {product.size}/{product.color}
                                        </p>
                                        <p className="mt-2 text-sm font-semibold text-foreground">
                                            {product.qty} x {product.sellingPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                        </p>
                                    </div>

                                </div>

                                <div className="flex items-end">
                                    <button type="button" className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--dark-red)] underline underline-offset-4 cursor-pointer"
                                        onClick={() => dispatch(removeFromCart({ productId: product.productId, variantId: product.variantId }))}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-border/60 bg-background px-5 py-4">
                        <div className="space-y-1.5">
                            <h2 className="flex items-center justify-between text-lg font-semibold"><span>Subtotal</span> <span>{subtotal?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span></h2>
                            <h2 className="flex items-center justify-between text-sm font-medium text-muted-foreground"><span>Discount</span> <span>{discount?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span></h2>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <Button type="button" asChild variant="outline" className="h-11 rounded-md border-border/70 font-semibold" onClick={() => setOpen(false)}>
                                <Link href={WEBSITE_CART}>View Cart</Link>
                            </Button>
                            <Button type="button" asChild variant="brand" className="h-11 font-semibold" onClick={() => setOpen(false)}>
                                {cart.count ?
                                    <Link href={WEBSITE_CHECKOUT}>Checkout</Link>
                                    :
                                    <span onClick={(event) => {
                                        event.preventDefault()
                                        showToast('error', 'Your cart is empty!')
                                    }}>Checkout</span>
                                }
                            </Button>
                        </div>
                    </div>
                </div>

            </SheetContent>
        </Sheet>

    )
}

export default Cart
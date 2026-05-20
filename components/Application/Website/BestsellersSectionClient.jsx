'use client'

import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Eye } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import imgPlaceholder from '@/public/assets/images/img-placeholder.webp'
import { WEBSITE_PRODUCT_DETAILS } from '@/routes/WebsiteRoute'
import ShopAllButton from '@/components/Application/Website/ShopAllButton'
import styles from './BestsellersSection.module.css'

gsap.registerPlugin(ScrollTrigger)

const CARD_SIZES = ['sm', 'lg', 'md', 'xl']

const BestsellersSectionClient = ({ products = [] }) => {
    const sectionRef = useRef(null)
    const headerRef  = useRef(null)
    const gridRef    = useRef(null)

    useGSAP(() => {
        if (!sectionRef.current) return

        // Header fade-in
        gsap.fromTo(
            headerRef.current,
            { autoAlpha: 0, y: 20 },
            {
                autoAlpha: 1, y: 0,
                duration: 0.85, ease: 'power3.out',
                scrollTrigger: { trigger: sectionRef.current, start: 'top 78%', once: true },
            }
        )

        const cards = gridRef.current?.querySelectorAll(`.${styles.card}`)
        if (!cards?.length) return

        // Card reveal — exact match to FeaturedProduct
        gsap.fromTo(cards,
            { y: 120, opacity: 0, clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)' },
            {
                y: 0, opacity: 1,
                clipPath: 'polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)',
                duration: 1.2, ease: 'power4.out', stagger: 0.12,
                scrollTrigger: { trigger: gridRef.current, start: 'top 75%', once: true },
            }
        )

        // Hover — exact match to FeaturedProduct
        const handlers = []
        cards.forEach((card) => {
            const img     = card.querySelector('img')
            const titleEl = card.querySelector(`.${styles.productName}`)
            if (!img) return

            const enter = () => {
                gsap.to(img, { scale: 1.25, duration: 2, ease: 'power4.out' })
                if (titleEl) gsap.to(titleEl, { y: 0, duration: 1, ease: 'power4.out' })
            }
            const leave = () => {
                gsap.to(img, { scale: 1, duration: 2, ease: 'power4.out' })
                if (titleEl) gsap.to(titleEl, { y: 28, duration: 1, ease: 'power4.out' })
            }
            card.addEventListener('mouseenter', enter)
            card.addEventListener('mouseleave', leave)
            handlers.push({ card, enter, leave })
        })

        return () => {
            handlers.forEach(({ card, enter, leave }) => {
                card.removeEventListener('mouseenter', enter)
                card.removeEventListener('mouseleave', leave)
            })
        }
    }, { scope: sectionRef, dependencies: [products.length] })

    const formatPrice = (price) =>
        price ? `₹${price.toLocaleString('en-IN')}` : null

    return (
        <section ref={sectionRef} className={styles.section}>

            {/* Header */}
            <div ref={headerRef} className={styles.header}>
                <h2 className={styles.heading}>Bestsellers</h2>
                <Link href="/shop" className={styles.seeAll}>
                    See All
                </Link>
            </div>

            {/* 4-card grid */}
            <div ref={gridRef} className={styles.grid}>
                {CARD_SIZES.map((size, i) => {
                    const product = products[i]
                    const href    = product ? WEBSITE_PRODUCT_DETAILS(product.slug) : '#'
                    const imgSrc  = product?.media?.[0]?.secure_url || imgPlaceholder
                    const imgAlt  = product?.media?.[0]?.alt || product?.name || 'Product'

                    return (
                        <div key={i} className={`${styles.card} ${styles[size]}`}>

                            {/* Full-card image link */}
                            <Link href={href} className={styles.cardImageLink} aria-label={product?.name || 'View product'}>
                                <div className={styles.imgWrapper}>
                                    <Image
                                        src={imgSrc}
                                        alt={imgAlt}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 50vw, 25vw"
                                    />
                                </div>
                            </Link>

                            {/* Product name + price — slides up on hover */}
                            <div className={styles.productInfo}>
                                {product?.name && (
                                    <p className={styles.productName}>{product.name}</p>
                                )}
                                {formatPrice(product?.sellingPrice) && (
                                    <p className={styles.productPrice}>{formatPrice(product.sellingPrice)}</p>
                                )}
                            </div>

                            {/* Action buttons — appear on hover */}
                            <div className={styles.cardActions}>
                                <Link href={href} className={styles.viewProduct} aria-label="View product">
                                    <Eye size={17} strokeWidth={1.8} />
                                </Link>
                                <button
                                    className={styles.addToCart}
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
                                    aria-label="Add to cart"
                                >
                                    <ShoppingCart size={17} strokeWidth={1.8} />
                                </button>
                            </div>

                        </div>
                    )
                })}
            </div>

            {/* CTA */}
            <div className={styles.actions}>
                <ShopAllButton
                    label="More Products"
                    colorScheme="dark-red"
                    radius="md"
                    className="rounded-lg"
                />
            </div>

        </section>
    )
}

export default BestsellersSectionClient

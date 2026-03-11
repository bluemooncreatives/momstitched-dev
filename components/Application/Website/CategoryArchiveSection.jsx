'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { WEBSITE_SHOP } from '@/routes/WebsiteRoute'
import styles from './CategoryArchiveSection.module.css'

const CATEGORIES = [
    {
        id: 'mens',
        name: 'MENS',
        collection: 'Core Essentials',
        year: '2025',
        href: `${WEBSITE_SHOP}?category=mens`,
        previewImage: '/assets/images/hero/01.png'
    },
    {
        id: 'womens',
        name: 'WOMENS',
        collection: 'Tailored Icons',
        year: '2025',
        href: `${WEBSITE_SHOP}?category=womens`,
        previewImage: '/assets/images/hero/02.jpg'
    },
    {
        id: 'kids',
        name: 'KIDS',
        collection: 'Play Collection',
        year: '2025',
        href: `${WEBSITE_SHOP}?category=kids`,
        previewImage: '/assets/images/hero/03.jpg'
    },
    {
        id: 'outwear',
        name: 'OUTWEAR',
        collection: 'All-Season Layers',
        year: '2025',
        href: `${WEBSITE_SHOP}?category=outwear`,
        previewImage: '/assets/images/slider-1.png'
    },
    {
        id: 'hoodies',
        name: 'HOODIES & SWEATSHIRTS',
        collection: 'Off-Duty Comfort',
        year: '2025',
        href: `${WEBSITE_SHOP}?category=hoodies`,
        previewImage: '/assets/images/slider-2.png'
    },
    {
        id: 'dresses',
        name: 'DRESSES & SKIRTS',
        collection: 'Flow & Form',
        year: '2025',
        href: `${WEBSITE_SHOP}?category=dresses`,
        previewImage: '/assets/images/slider-3.png'
    },
    {
        id: 'tshirts',
        name: 'T-SHIRTS',
        collection: 'Daily Uniform',
        year: '2025',
        href: `${WEBSITE_SHOP}?category=t-shirts`,
        previewImage: '/assets/images/slider-4.png'
    },
    {
        id: 'trousers',
        name: 'TROUSERS & SHORTS',
        collection: 'Relaxed Fit',
        year: '2025',
        href: `${WEBSITE_SHOP}?category=trousers`,
        previewImage: '/assets/images/banner1.png'
    }
]

const CategoryArchiveSection = () => {
    const containerRef = useRef(null)
    const archiveItemsRef = useRef(null)
    const previewRef = useRef(null)

    const archiveRectRef = useRef(null)
    const mousePosRef = useRef({ x: 0, y: 0 })
    const mouseTimeoutRef = useRef(null)

    const clearMouseTimeout = () => {
        if (mouseTimeoutRef.current) {
            clearTimeout(mouseTimeoutRef.current)
            mouseTimeoutRef.current = null
        }
    }

    const updateArchiveRect = () => {
        if (!archiveItemsRef.current) return
        archiveRectRef.current = archiveItemsRef.current.getBoundingClientRect()
    }

    const isInsideArchive = (x, y) => {
        const rect = archiveRectRef.current
        if (!rect) return false

        return (
            x >= rect.left &&
            x <= rect.right &&
            y >= rect.top &&
            y <= rect.bottom
        )
    }

    const removeImage = (img) => {
        if (img.dataset.removing === 'true') return

        img.dataset.removing = 'true'
        gsap.to(img, {
            scale: 0,
            duration: 0.4,
            ease: 'power2.out',
            onComplete: () => img.remove()
        })
    }

    const removeAllImages = () => {
        if (!previewRef.current) return

        const previewImages = previewRef.current.querySelectorAll('img[data-preview="true"]')
        previewImages.forEach((img) => removeImage(img))
    }

    const cleanupOldImages = () => {
        if (!previewRef.current) return

        const images = previewRef.current.querySelectorAll('img[data-preview="true"]')
        if (images.length <= 1) return

        const lastImage = images[images.length - 1]
        images.forEach((img) => {
            if (img !== lastImage) removeImage(img)
        })
    }

    const createPreviewImage = (previewImage) => {
        if (!previewRef.current) return

        const { x, y } = mousePosRef.current
        if (!isInsideArchive(x, y)) return

        const img = document.createElement('img')
        img.src = previewImage
        img.alt = ''
        img.dataset.preview = 'true'
        img.className = styles.previewImage
        img.style.zIndex = String(Date.now())

        previewRef.current.appendChild(img)

        gsap.to(img, {
            scale: 1,
            duration: 0.4,
            ease: 'power2.out'
        })
    }

    useEffect(() => {
        if (!containerRef.current) return

        gsap.registerPlugin(ScrollTrigger)
        updateArchiveRect()

        const context = gsap.context(() => {
            const headerRevealerP = containerRef.current.querySelectorAll(`.${styles.header} .${styles.revealer} p`)
            const items = containerRef.current.querySelectorAll(`.${styles.item}`)

            // Set initial hidden state — all text pushed below clip
            gsap.set(headerRevealerP, { y: '100%' })
            items.forEach((item) => {
                const pTags = item.querySelectorAll(`.${styles.revealer} p`)
                gsap.set(pTags, { y: '100%' })
            })

            // ScrollTrigger: only fire when section enters viewport
            ScrollTrigger.create({
                trigger: containerRef.current,
                start: 'top 75%',
                once: true,
                onEnter: () => {
                    // Phase 1: Header text reveals
                    const headerTl = gsap.timeline({
                        defaults: { ease: 'power3.out' },
                        delay: 0.15
                    })

                    headerTl.to(headerRevealerP, {
                        y: '0%',
                        duration: 0.75,
                    })

                    // Phase 2: Each row's text reveals in a staggered cascade
                    const rowTl = gsap.timeline({ delay: 0.25 })

                    items.forEach((item, index) => {
                        const pTags = item.querySelectorAll(`.${styles.revealer} p`)
                        rowTl.to(
                            pTags,
                            { y: '0%', duration: 0.75, ease: 'power3.out' },
                            index * 0.05
                        )
                    })
                }
            })
        }, containerRef)

        const handleResize = () => updateArchiveRect()

        const handleScroll = () => {
            updateArchiveRect()

            const { x, y } = mousePosRef.current
            if (!isInsideArchive(x, y)) {
                clearMouseTimeout()
                removeAllImages()
            }
        }

        const handleMouseMove = (event) => {
            mousePosRef.current = { x: event.clientX, y: event.clientY }
            updateArchiveRect()

            if (!isInsideArchive(event.clientX, event.clientY)) {
                clearMouseTimeout()
                removeAllImages()
                return
            }

            clearMouseTimeout()
            mouseTimeoutRef.current = setTimeout(() => {
                cleanupOldImages()
            }, 2000)
        }

        document.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('resize', handleResize)
        window.addEventListener('scroll', handleScroll, { passive: true })

        return () => {
            clearMouseTimeout()
            removeAllImages()
            document.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('resize', handleResize)
            window.removeEventListener('scroll', handleScroll)
            context.revert()
        }
    }, [])

    return (
        <section className={styles.section} ref={containerRef}>
            <div className={styles.archivePage}>
                <div className={styles.archive}>
                    <div className={styles.copyBlock}>
                        <h1 className={styles.title}>Categories</h1>
                        <p className={styles.writeup}>
                            Discover signature silhouettes, everyday essentials, and statement pieces curated for every
                            wardrobe. Each category brings together styles designed for comfort, movement, and everyday
                            confidence, from relaxed daily basics to elevated looks for special moments. Explore collections
                            that balance fit, fabric, and finish, so every piece feels as good as it looks. Whether you are
                            building a capsule wardrobe, updating seasonal staples, or searching for one standout outfit, this
                            archive helps you find the right mood, shape, and style with ease.
                        </p>
                    </div>

                    <div className={styles.header}>
                        <div className={styles.headerName}>
                            <div className={styles.revealer}>
                                <p className={styles.headerText}>Category</p>
                            </div>
                        </div>
                        <div className={styles.headerDesigner}>
                            <div className={styles.revealer}>
                                <p className={styles.headerText}>Collection</p>
                            </div>
                        </div>
                        <div className={styles.headerYear}>
                            <div className={styles.revealer}>
                                <p className={styles.headerText}>Year</p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.archiveItems} ref={archiveItemsRef}>
                        {[...Array(2)].flatMap((_, repetition) =>
                            CATEGORIES.map((category) => (
                                <Link
                                    href={category.href}
                                    className={styles.item}
                                    key={`${repetition}-${category.id}`}
                                    onMouseEnter={() => createPreviewImage(category.previewImage)}
                                    onFocus={() => createPreviewImage(category.previewImage)}
                                >
                                    <div className={styles.itemName}>
                                        <div className={styles.revealer}>
                                            <p className={styles.itemText}>{category.name}</p>
                                        </div>
                                    </div>
                                    <div className={styles.itemDesigner}>
                                        <div className={styles.revealer}>
                                            <p className={styles.metaText}>{category.collection}</p>
                                        </div>
                                    </div>
                                    <div className={styles.itemYear}>
                                        <div className={styles.revealer}>
                                            <p className={styles.yearText}>{category.year}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
                <div className={styles.emptyCol}></div>
            </div>
            <div className={styles.preview} ref={previewRef} aria-hidden="true"></div>
        </section>
    )
}

export default CategoryArchiveSection

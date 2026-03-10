'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import imgPlaceholder from '@/public/assets/images/img-placeholder.webp';
import { WEBSITE_PRODUCT_DETAILS, WEBSITE_SHOP } from '@/routes/WebsiteRoute';
import './FeaturedProduct.css';

// Assign sizes in a repeating pattern for the row layout
const sizePattern = ['lg', 'sm', 'lg', 'sm', 'lg', 'lg', 'lg', 'lg', 'sm'];

const FeaturedProduct = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/product/get-featured-product`);
                const data = await response.json();

                if (data.success && data.data) {
                    setProducts(data.data);
                } else {
                    setError('Failed to load products');
                }
            } catch (err) {
                console.error('Error fetching products:', err);
                setError('Error loading products');
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedProducts();
    }, []);

    // Preload images before revealing
    useEffect(() => {
        if (!products.length) return;

        const imagePromises = products.map((product) => {
            return new Promise((resolve) => {
                const img = new window.Image();
                img.src = product?.media?.[0]?.secure_url || imgPlaceholder.src;
                img.onload = resolve;
                img.onerror = resolve;
            });
        });

        Promise.all(imagePromises).then(() => setImagesLoaded(true));
    }, [products]);

    // GSAP clip-path reveal + hover effects (from stefan-markovic portfolio)
    useGSAP(() => {
        if (!imagesLoaded || !containerRef.current) return;
        gsap.registerPlugin(ScrollTrigger);

        const cols = containerRef.current.querySelectorAll('.fp-col');
        const hoverHandlers = [];

        // Reveal animation starts when section scrolls into view
        gsap.fromTo(cols, {
            y: 120,
            opacity: 0,
            clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
        }, {
            y: 0,
            opacity: 1,
            clipPath: 'polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)',
            duration: 1.2,
            ease: 'power4.out',
            stagger: 0.12,
            scrollTrigger: {
                trigger: containerRef.current,
                start: 'top 75%',
                once: true,
            },
        });

        // Hover effects: image scale + title slide
        cols.forEach((col) => {
            const img = col.querySelector('img');
            const titleEl = col.querySelector('.fp-project-title h3');
            if (!img) return;

            const onEnter = () => {
                gsap.to(img, { scale: 1.25, duration: 2, ease: 'power4.out' });
                if (titleEl) gsap.to(titleEl, { y: 0, duration: 1, ease: 'power4.out' });
            };

            const onLeave = () => {
                gsap.to(img, { scale: 1, duration: 2, ease: 'power4.out' });
                if (titleEl) gsap.to(titleEl, { y: 28, duration: 1, ease: 'power4.out' });
            };

            col.addEventListener('mouseenter', onEnter);
            col.addEventListener('mouseleave', onLeave);
            hoverHandlers.push({ col, onEnter, onLeave });
        });

        return () => {
            hoverHandlers.forEach(({ col, onEnter, onLeave }) => {
                col.removeEventListener('mouseenter', onEnter);
                col.removeEventListener('mouseleave', onLeave);
            });
        };
    }, { scope: containerRef, dependencies: [imagesLoaded] });

    // Build rows of 3 products
    const renderProductRows = useCallback(() => {
        const rows = [];
        for (let i = 0; i < products.length; i += 3) {
            const rowProducts = products.slice(i, i + 3);
            rows.push(
                <div className="fp-row" key={i}>
                    {rowProducts.map((product, index) => {
                        const size = sizePattern[(i + index) % sizePattern.length];
                        return (
                            <div className={`fp-col ${size}`} key={product._id}>
                                <Link href={WEBSITE_PRODUCT_DETAILS(product.slug)}>
                                    <Image
                                        src={product?.media?.[0]?.secure_url || imgPlaceholder.src}
                                        fill
                                        alt={product?.name || 'Product'}
                                        className="object-cover object-center"
                                        sizes="(max-width: 900px) 100vw, 33vw"
                                    />
                                    <div className="fp-project-title">
                                        <h3>{product?.name}</h3>
                                        <span>₹{product?.sellingPrice?.toLocaleString('en-IN')}</span>
                                    </div>
                                </Link>
                            </div>
                        );
                    })}
                </div>
            );
        }
        return rows;
    }, [products]);

    if (loading) {
        return (
            <section className="fp-section bg-white">
                <div className="fp-container">
                    {[0, 1, 2].map((rowIdx) => (
                        <div className="fp-row" key={rowIdx}>
                            {[0, 1, 2].map((colIdx) => (
                                <div
                                    key={colIdx}
                                    className={`fp-col-skeleton ${colIdx === 1 ? 'sm' : 'lg'}`}
                                    style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' }}
                                >
                                    <div className="bg-gray-700 animate-pulse w-full h-full rounded-sm" />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    if (error || !products.length) {
        return (
            <section className="fp-section bg-white">
                <div className="fp-container">
                    <div className="text-center py-12 text-gray-400">
                        {error || 'No featured products available'}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="fp-section bg-white" ref={containerRef}>
            <div className="fp-container">
                {imagesLoaded && renderProductRows()}
                {imagesLoaded && (
                    <div className="mt-4 flex justify-center">
                        <Link
                            href={WEBSITE_SHOP}
                            className="inline-flex items-center justify-center rounded-full border border-black px-8 py-3 text-sm font-semibold uppercase tracking-wide transition-colors duration-300 hover:bg-black hover:text-white"
                        >
                            Shop All Products
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
};

export default FeaturedProduct;

'use client'

import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Star } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const AUTO_MS = 6000
const TOTAL = 10
const PAD = (n) => String(n).padStart(2, '0')

const testimonials = [
    {
        name: "Sophia Patel",
        review: "This product exceeded my expectations. The quality is top-notch and it arrived much faster than I anticipated. I will definitely be recommending it to my friends and family.",
        rating: 5,
    },
    {
        name: "James Thompson",
        review: "Customer service was extremely helpful and responsive. They guided me through every step of the process. I'm very satisfied with the support I received.",
        rating: 4,
    },
    {
        name: "Emily Chen",
        review: "I've been using this service for over a month now and it's been amazing. The user interface is intuitive and everything runs smoothly. I haven't faced any major issues so far.",
        rating: 5,
    },
    {
        name: "Liam Rodriguez",
        review: "Honestly, I was skeptical at first, but it turned out great. The features offered are well worth the price. There is room for improvement, but overall I'm happy with it.",
        rating: 4,
    },
    {
        name: "Ava Johnson",
        review: "The attention to detail is impressive. From packaging to performance, everything was handled professionally. I feel like I got great value for my money.",
        rating: 5,
    },
    {
        name: "Noah Davis",
        review: "There were a few hiccups during setup, but the documentation helped a lot. Once everything was in place, it worked flawlessly. I'm a satisfied customer now.",
        rating: 4,
    },
    {
        name: "Isabella Martinez",
        review: "What stood out the most was how easy it was to get started. The onboarding process is smooth and well thought out. I appreciated the thoughtful design.",
        rating: 5,
    },
    {
        name: "William Lee",
        review: "It does what it promises, no complaints there. The pricing is fair and the customer experience is excellent. I'll be coming back for future purchases.",
        rating: 4,
    },
    {
        name: "Mia Anderson",
        review: "I encountered a few bugs in the beginning, but support helped fix them quickly. Now everything works perfectly. The team really listens to feedback.",
        rating: 4,
    },
    {
        name: "Ethan Clark",
        review: "This has been one of the best investments I've made recently. The performance is consistent and it integrates seamlessly with my workflow. Highly recommended!",
        rating: 5,
    },
]

const Testimonial = () => {
    const [active, setActive] = useState(0)
    const activeRef = useRef(0)
    const sectionRef = useRef(null)
    const dividerRef = useRef(null)
    const headerRef = useRef(null)
    const bigQuoteRef = useRef(null)
    const contentRef = useRef(null)
    const progressRef = useRef(null)
    const progressTweenRef = useRef(null)
    const timerRef = useRef(null)
    const isAnimatingRef = useRef(false)
    const goToRef = useRef(null)

    useGSAP(() => {
        gsap.fromTo(
            [headerRef.current, bigQuoteRef.current],
            { autoAlpha: 0, y: 28 },
            {
                autoAlpha: 1,
                y: 0,
                duration: 0.85,
                ease: 'power3.out',
                stagger: 0.08,
                scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
            }
        )
        gsap.fromTo(
            dividerRef.current,
            { scaleX: 0, transformOrigin: 'left center' },
            {
                scaleX: 1,
                duration: 1.1,
                ease: 'power3.inOut',
                scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
            }
        )
    }, { scope: sectionRef })

    const startProgress = useCallback(() => {
        if (progressTweenRef.current) progressTweenRef.current.kill()
        gsap.set(progressRef.current, { scaleX: 0, transformOrigin: 'left center' })
        progressTweenRef.current = gsap.to(progressRef.current, {
            scaleX: 1,
            duration: AUTO_MS / 1000,
            ease: 'none',
        })
    }, [])

    const startTimer = useCallback(() => {
        clearInterval(timerRef.current)
        timerRef.current = setInterval(() => {
            goToRef.current?.((activeRef.current + 1) % TOTAL)
        }, AUTO_MS)
    }, [])

    const goTo = useCallback((index) => {
        if (isAnimatingRef.current) return
        if (index === activeRef.current) return
        isAnimatingRef.current = true
        clearInterval(timerRef.current)

        gsap.to(contentRef.current, {
            autoAlpha: 0,
            y: -14,
            duration: 0.26,
            ease: 'power2.in',
            onComplete: () => {
                activeRef.current = index
                setActive(index)
                requestAnimationFrame(() => {
                    gsap.fromTo(
                        contentRef.current,
                        { autoAlpha: 0, y: 18 },
                        {
                            autoAlpha: 1,
                            y: 0,
                            duration: 0.45,
                            ease: 'power3.out',
                            onComplete: () => {
                                isAnimatingRef.current = false
                                startTimer()
                            },
                        }
                    )
                })
                startProgress()
            },
        })
    }, [startProgress, startTimer])

    useEffect(() => { goToRef.current = goTo }, [goTo])

    useEffect(() => {
        gsap.set(contentRef.current, { autoAlpha: 1 })
        startProgress()
        startTimer()
        return () => {
            clearInterval(timerRef.current)
            if (progressTweenRef.current) progressTweenRef.current.kill()
        }
    }, [startProgress, startTimer])

    const item = testimonials[active]

    return (
        <section ref={sectionRef} className="relative overflow-hidden bg-white website-gutter pt-20 lg:pt-28 pb-6 lg:pb-10">

            {/* decorative large quote */}
            <div
                ref={bigQuoteRef}
                aria-hidden
                className="pointer-events-none absolute -top-6 left-2 select-none font-neue text-[16rem] leading-none text-[var(--dark-red)]/[0.055] lg:left-6 lg:text-[20rem]"
            >
                &ldquo;
            </div>

            {/* header */}
            <div ref={headerRef} className="relative mb-5 flex items-end justify-between">
                <div>
                    <p className="text-[1rem] font-semibold uppercase text-[var(--dark-red)]/50">
                        Customer Reviews
                    </p>
                    <h2 className="mt-1.5 font-neue text-[3rem] font-medium uppercase text-[var(--dark-red-2)] sm:text-[3.8rem]">
                        What They Say
                    </h2>
                </div>
                <span className="font-neue tabular-nums text-[var(--dark-red)]/20">
                    <span className="text-3xl font-semibold sm:text-4xl">{PAD(active + 1)}</span>
                    <span className="text-base"> / {PAD(TOTAL)}</span>
                </span>
            </div>

            {/* divider */}
            <div ref={dividerRef} className="mb-10 h-px w-full bg-[var(--dark-red)]/20" />

            {/* slide content */}
            <div ref={contentRef} className="relative min-h-[200px] lg:min-h-[160px]">
                <blockquote className="max-w-[54rem]">
                    <p className="font-neue text-[1.3rem] font-medium leading-[1.7] tracking-[0.01em] text-[var(--dark-red)] sm:text-[1.55rem] lg:text-[1.7rem]">
                        &ldquo;{item.review}&rdquo;
                    </p>
                </blockquote>

                <div className="mt-8 flex items-center gap-4">
                    <span className="h-px w-7 shrink-0 bg-[var(--dark-red)]/35" />
                    <div>
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[var(--dark-red)]/80">
                            {item.name}
                        </p>
                        <div className="mt-1 flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    className={`size-3 ${i < item.rating ? 'fill-amber-500 text-amber-500' : 'fill-[var(--dark-red)]/20 text-[var(--dark-red)]/20'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* progress bar */}
            <div className="mt-10 h-px w-full bg-[var(--dark-red)]/10">
                <div ref={progressRef} className="h-full w-full origin-left bg-[var(--dark-red)]/35" />
            </div>

            {/* bottom nav */}
            <div className="mt-5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    {testimonials.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            aria-label={`Go to review ${i + 1}`}
                            onClick={() => goTo(i)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                i === active ? 'w-6 bg-[var(--dark-red)]' : 'w-1.5 bg-[var(--dark-red)]/25 hover:bg-[var(--dark-red)]/45'
                            }`}
                        />
                    ))}
                </div>

                <div className="flex gap-2">
                    <button
                        type="button"
                        aria-label="Previous review"
                        onClick={() => goTo((active - 1 + TOTAL) % TOTAL)}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--dark-red)]/25 text-[var(--dark-red)]/55 transition hover:border-[var(--dark-red)]/60 hover:text-[var(--dark-red)]"
                    >
                        <ArrowLeft className="size-4" />
                    </button>
                    <button
                        type="button"
                        aria-label="Next review"
                        onClick={() => goTo((active + 1) % TOTAL)}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--dark-red)]/25 text-[var(--dark-red)]/55 transition hover:border-[var(--dark-red)]/60 hover:text-[var(--dark-red)]"
                    >
                        <ArrowRight className="size-4" />
                    </button>
                </div>
            </div>
        </section>
    )
}

export default Testimonial

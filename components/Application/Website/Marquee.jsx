'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight } from 'lucide-react'

// Seamless, scroll-direction controlled marquee using GSAP ticker + ScrollTrigger
const Marquee = ({ text = 'luxury collection', repeatCount = 12, speed = 1 }) => {
    const containerRef = useRef(null)
    const innerRef = useRef(null)
    const arrowsRef = useRef([])

    const directionRef = useRef(1) // 1 = right/down, -1 = left/up
    const xRef = useRef(0)
    const tickingRef = useRef(false)

    useEffect(() => {
        if (!containerRef.current || !innerRef.current) return
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

        gsap.registerPlugin(ScrollTrigger)

        const inner = innerRef.current

        // Get the width of one complete marquee set
        const getBounds = () => {
            const allItems = inner.querySelectorAll('.marquee__part')
            let totalWidth = 0
            allItems.forEach((item) => {
                totalWidth += item.offsetWidth
            })
            return totalWidth / 2 // Half because we duplicate
        }

        let itemWidth = getBounds()

        // Ticker: continuous movement in direction
        const tick = () => {
            const dt = gsap.ticker.deltaRatio()
            xRef.current += directionRef.current * speed * dt
            
            // Seamless wrap: when we exceed half-width, wrap back
            if (xRef.current > 0) {
                xRef.current -= itemWidth
            } else if (xRef.current < -itemWidth) {
                xRef.current += itemWidth
            }

            gsap.set(inner, { x: xRef.current })
        }

        const updateArrowDirection = (direction) => {
            arrowsRef.current.forEach((arrow) => {
                if (!arrow) return
                if (direction === 1) {
                    arrow.classList.remove('active')
                } else {
                    arrow.classList.add('active')
                }
            })
        }

        const startTicker = () => {
            if (tickingRef.current) return
            gsap.ticker.add(tick)
            tickingRef.current = true
        }

        const stopTicker = () => {
            if (!tickingRef.current) return
            gsap.ticker.remove(tick)
            tickingRef.current = false
        }

        const trigger = ScrollTrigger.create({
            trigger: containerRef.current,
            start: 'top bottom',
            end: 'bottom top',
            onEnter: () => {
                if (!prefersReducedMotion) startTicker()
            },
            onEnterBack: () => {
                if (!prefersReducedMotion) startTicker()
            },
            onLeave: stopTicker,
            onLeaveBack: stopTicker,
            onUpdate: (self) => {
                if (prefersReducedMotion) return
                const nextDirection = self.direction === 1 ? 1 : -1
                if (nextDirection === directionRef.current) return
                directionRef.current = nextDirection
                updateArrowDirection(nextDirection)
            }
        })

        const handleRefresh = () => {
            itemWidth = getBounds()
        }
        ScrollTrigger.addEventListener('refreshInit', handleRefresh)
        ScrollTrigger.refresh()
        if (trigger.isActive && !prefersReducedMotion) {
            startTicker()
        }

        return () => {
            stopTicker()
            ScrollTrigger.removeEventListener('refreshInit', handleRefresh)
            trigger.kill()
        }
    }, [speed])

    return (
        <section ref={containerRef} className='relative bg-[#3E000D] text-[#FFECD1] py-8 overflow-hidden'>
            <div className='marquee__inner' ref={innerRef}>
                {Array.from({ length: repeatCount }).map((_, index) => (
                    <div key={index} className='marquee__part flex items-center flex-shrink-0 px-1 whitespace-nowrap'>
                        <span className='font-semibold text-2xl sm:text-4xl uppercase whitespace-nowrap'>
                            {text}
                        </span>
                        <div
                            ref={(el) => (arrowsRef.current[index] = el)}
                            className='arrow w-12 sm:w-16 h-16 sm:h-20 mx-4'
                        >
                            <ArrowRight className='w-full h-full' strokeWidth={1.5} />
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .marquee__inner {
                    display: flex;
                    width: fit-content;
                    flex: auto;
                    flex-direction: row;
                    will-change: transform;
                }
                .marquee__part {
                    display: flex;
                    align-items: center;
                    flex-shrink: 0;
                    padding: 0 4px;
                }
                .arrow {
                    width: 60px;
                    height: 80px;
                    margin: 0 1em;
                    transform: rotate(45deg);
                    transition: transform 0.8s cubic-bezier(0.075, 0.82, 0.165, 1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: currentColor;
                }
                .arrow.active {
                    transform: rotate(-135deg);
                }
            `}</style>
        </section>
    )
}

export default Marquee

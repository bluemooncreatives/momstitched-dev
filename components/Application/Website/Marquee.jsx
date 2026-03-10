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

    useEffect(() => {
        if (!containerRef.current || !innerRef.current) return

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

        gsap.ticker.add(tick)

        // Scroll detection: update direction based on scroll
        let lastScroll = window.scrollY
        const handleScroll = () => {
            const currentScroll = window.scrollY
            if (currentScroll > lastScroll) {
                directionRef.current = 1 // Scrolling down → move right
            } else if (currentScroll < lastScroll) {
                directionRef.current = -1 // Scrolling up → move left
            }
            lastScroll = currentScroll

            // Toggle arrow rotation
            arrowsRef.current.forEach((arrow) => {
                if (!arrow) return
                if (directionRef.current === 1) {
                    arrow.classList.remove('active')
                } else {
                    arrow.classList.add('active')
                }
            })
        }

        window.addEventListener('scroll', handleScroll, { passive: true })

        return () => {
            gsap.ticker.remove(tick)
            window.removeEventListener('scroll', handleScroll)
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

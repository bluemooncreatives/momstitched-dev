'use client'

import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import CustomEase from "gsap/CustomEase"

gsap.registerPlugin(CustomEase)
CustomEase.create("hop", "0.9, 0, 0.1, 1")

const PageLoader = ({ onReady, onComplete }) => {
    const loaderRef = useRef(null)
    const [count, setCount] = useState(0)
    const [isLoaded, setIsLoaded] = useState(false)
    const countRef = useRef(0)
    const tlRef = useRef(null)

    // Track actual page load
    useEffect(() => {
        const checkLoaded = () => {
            if (document.readyState === 'complete') {
                setIsLoaded(true)
            }
        }

        checkLoaded()

        const onLoad = () => setIsLoaded(true)
        window.addEventListener('load', onLoad)
        document.addEventListener('readystatechange', checkLoaded)

        return () => {
            window.removeEventListener('load', onLoad)
            document.removeEventListener('readystatechange', checkLoaded)
        }
    }, [])

    // Counter animation — starts immediately, no async delay
    useEffect(() => {
        const counterTl = gsap.timeline()

        counterTl.to(countRef, {
            current: 90,
            duration: 1.5,
            ease: "power2.out",
            onUpdate: () => {
                setCount(Math.round(countRef.current))
            }
        })

        tlRef.current = counterTl

        return () => {
            counterTl.kill()
        }
    }, [])

    // When page is loaded, complete the counter to 100 and reveal
    useEffect(() => {
        if (!isLoaded) return

        // Kill any running counter animation
        if (tlRef.current) {
            tlRef.current.kill()
        }

        const currentCount = countRef.current
        const remainingProgress = 100 - currentCount
        const duration = Math.max(0.3, remainingProgress / 100) // Min 0.3s to finish

        const completeTl = gsap.timeline({
            defaults: { ease: "hop" }
        })

        // Complete counter to 100
        completeTl.to(countRef, {
            current: 100,
            duration: duration,
            ease: "power2.out",
            onUpdate: () => {
                setCount(Math.round(countRef.current))
            }
        })

        const loader = loaderRef.current
        if (!loader) return

        const counterEl = loader.querySelector(".counter")
        const wordEls = loader.querySelectorAll(".word h1")
        const dividerEl = loader.querySelector(".divider")
        const word1H1 = loader.querySelector("#word-1 h1")
        const word2H1 = loader.querySelector("#word-2 h1")
        const blockEls = loader.querySelectorAll(".block")

        // Hide counter
        completeTl.to(counterEl, {
            opacity: 0,
            duration: 0.4,
            ease: "power2.out"
        })

        // Show logo words
        completeTl.to(
            wordEls,
            {
                y: "0%",
                duration: 0.8,
            }
        )

        // Divider animation
        completeTl.to(dividerEl, {
            scaleY: 1,
            duration: 0.8,
            onComplete: () =>
                gsap.to(dividerEl, { opacity: 0, duration: 0.2, delay: 0.2 }),
        })

        // Hide words
        completeTl.to(word1H1, {
            y: "100%",
            duration: 0.8,
            delay: 0.2,
        })

        completeTl.to(
            word2H1,
            {
                y: "-100%",
                duration: 0.8,
            },
            "<"
        )

        // Signal hero section to start while blocks still cover the screen
        completeTl.call(() => { if (onReady) onReady() })

        // Reveal hero - blocks slide away
        completeTl.to(
            blockEls,
            {
                clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
                duration: 1,
                stagger: 0.1,
                delay: 0.5,
            },
            "<"
        )

        // Hide the entire loader after animation
        completeTl.set(loader, {
            display: "none",
            onComplete: () => {
                if (onComplete) onComplete()
            }
        })

    }, [isLoaded, onReady, onComplete])

    return (
        <div ref={loaderRef} className="loader fixed top-0 left-0 w-full h-svh overflow-hidden z-[120] pointer-events-none">
            <div className="overlay absolute top-0 w-full h-full flex">
                <div className="block w-full h-full bg-[var(--brand-primary-hover)] [clip-path:polygon(0%_0%,100%_0%,100%_100%,0%_100%)]"></div>
                <div className="block w-full h-full bg-[var(--brand-primary-hover)] [clip-path:polygon(0%_0%,100%_0%,100%_100%,0%_100%)]"></div>
            </div>

            <div className="intro-logo absolute inset-0">
                <div className="word absolute top-1/2 right-1/2 -translate-y-1/2 pr-3 [clip-path:polygon(0_0,100%_0,100%_100%,0%_100%)]" id="word-1">
                    <h1 className="text-3xl text-white font-header -translate-y-[120%] will-change-transform">
                        Mom
                    </h1>
                </div>
                <div className="word absolute top-1/2 left-1/2 -translate-y-1/2 pl-3 [clip-path:polygon(0_0,100%_0,100%_100%,0%_100%)]" id="word-2">
                    <h1 className="text-3xl text-white font-header translate-y-[120%] will-change-transform">Stitched</h1>
                </div>
            </div>

            <div className="divider absolute top-0 left-1/2 origin-top w-px h-full bg-white -translate-x-1/2 scale-y-0 will-change-transform"></div>

            <div className="counter absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[2]">
                <h1 className="font-header text-[12rem] max-md:text-[8rem] max-sm:text-[5rem] font-normal text-white will-change-transform">
                    {count.toString().padStart(2, '0')}
                </h1>
            </div>
        </div>
    )
}

export default PageLoader




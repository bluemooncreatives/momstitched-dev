'use client'

import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useRef } from 'react'

gsap.registerPlugin(ScrollTrigger)

const FooterWordmark = () => {
    const wrapRef = useRef(null)
    const textRef = useRef(null)

    useGSAP(() => {
        const mm = gsap.matchMedia()

        // Respect users who prefer reduced motion — render fully stretched, no scrub.
        mm.add('(prefers-reduced-motion: reduce)', () => {
            gsap.set(textRef.current, { scaleY: 1, autoAlpha: 1 })
        })

        mm.add('(prefers-reduced-motion: no-preference)', () => {
            gsap.fromTo(
                textRef.current,
                { scaleY: 0.35, autoAlpha: 0.35 },
                {
                    scaleY: 1,
                    autoAlpha: 1,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: wrapRef.current,
                        start: 'top 95%',
                        end: 'bottom 85%',
                        scrub: 1,
                    },
                }
            )
        })

        return () => mm.revert()
    }, { scope: wrapRef })

    return (
        <div ref={wrapRef} className='mt-14 overflow-hidden'>
            <h2
                ref={textRef}
                className='origin-bottom font-bold tracking-tighter leading-[0.8] text-[clamp(3.5rem,18vw,13rem)] text-white whitespace-nowrap will-change-transform'
            >
                MOMSTITCHED
            </h2>
        </div>
    )
}

export default FooterWordmark

'use client'
import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

export default function LenisProvider({ children }) {
  const lenisRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
      smoothTouch: false,
    })

    lenisRef.current = lenis

    let rafId
    const onRaf = (time) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(onRaf)
    }
    rafId = requestAnimationFrame(onRaf)

    return () => {
      cancelAnimationFrame(rafId)
      if (lenisRef.current) lenisRef.current.destroy()
    }
  }, [])

  return <div>{children}</div>
}

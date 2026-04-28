"use client"

import { useRef } from "react"
import { useRouter } from "next/navigation"
import gsap from "gsap"
import { cn } from "@/lib/utils"
import { WEBSITE_SHOP } from "@/routes/WebsiteRoute"

const SCHEMES = {
    "dark-red": { border: "var(--dark-red)", fill: "var(--dark-red-2)", hoverText: "#fff"              },
    black:      { border: "#000",            fill: "#222",              hoverText: "#fff"              },
    white:      { border: "#fff",            fill: "#fff",              hoverText: "var(--dark-red)"   },
}

const ShopAllButton = ({
    label = "Shop All Products",
    href = WEBSITE_SHOP,
    colorScheme = "black",
    radius = "full",
    className,
}) => {
    const btnRef  = useRef(null)
    const fillRef = useRef(null)
    const router  = useRouter()

    const { border, fill, hoverText } = SCHEMES[colorScheme] ?? SCHEMES.black
    const radiusClass = radius === "sm" ? "rounded-sm" : radius === "md" ? "rounded-md" : "rounded-full"

    // Callback ref — runs gsap.set once on mount, no useEffect needed
    const setFill = (node) => {
        if (!node) return
        fillRef.current = node
        gsap.set(node, { scaleX: 0, transformOrigin: "left center" })
    }

    const onEnter = () => {
        gsap.to(fillRef.current, { scaleX: 1, duration: 0.45, ease: "power3.out", overwrite: true })
        gsap.to(btnRef.current,  { color: hoverText, duration: 0.2, overwrite: true })
    }

    const onLeave = () => {
        gsap.to(fillRef.current, { scaleX: 0, duration: 0.35, ease: "power3.in", overwrite: true })
        gsap.to(btnRef.current,  { color: border, duration: 0.2, overwrite: true })
    }

    return (
        <button
            ref={btnRef}
            type="button"
            onClick={() => router.push(href)}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
            className={cn(
                "relative inline-flex h-12 min-w-[220px] cursor-pointer select-none items-center justify-center overflow-hidden border px-10 text-[0.78rem] font-semibold uppercase",
                radiusClass,
                className
            )}
            style={{ borderColor: border, color: border }}
        >
            <span ref={setFill} className="absolute inset-0" style={{ background: fill }} />
            <span className="relative z-10">{label}</span>
        </button>
    )
}

export default ShopAllButton

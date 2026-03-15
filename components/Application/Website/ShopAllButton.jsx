"use client"

import React, { useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import gsap from "gsap"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { WEBSITE_SHOP } from "@/routes/WebsiteRoute"

const ShopAllButton = ({
    label = "Shop All Products",
    href = WEBSITE_SHOP,
    colorScheme = "black",
    radius = "full",
    className,
}) => {
    const rootRef = useRef(null)
    const router = useRouter()
    const scheme = useMemo(() => {
        if (colorScheme === "dark-red") {
            return {
                base: "var(--dark-red)",
                hover: "var(--dark-red-2)",
            }
        }
        return { base: "#000", hover: "#000" }
    }, [colorScheme])

    useEffect(() => {
        const root = rootRef.current
        if (!root) return

        const button = root.querySelector("[data-shop-button]")
        const fill = root.querySelector("[data-shop-fill]")
        const text = root.querySelector("[data-shop-text]")
        const shine = root.querySelector("[data-shop-shine]")

        if (!button || !fill || !text || !shine) return

        const ctx = gsap.context(() => {
            gsap.set(button, { color: scheme.base })
            gsap.set(fill, { scaleX: 0, transformOrigin: "left center" })
            gsap.set(shine, { xPercent: -140, opacity: 0 })

            const enterTl = gsap.timeline({ paused: true })
            enterTl
                .to(fill, { scaleX: 1, duration: 0.45, ease: "power3.out" })
                .to(
                    shine,
                    { xPercent: 140, opacity: 0.35, duration: 0.6, ease: "power2.out" },
                    0.05
                )
                .to(text, { yPercent: -12, duration: 0.25, ease: "power2.out" }, 0)
                .to(button, { color: "#fff", duration: 0.25, ease: "power2.out" }, 0)

            const leaveTl = gsap.timeline({ paused: true })
            leaveTl
                .to(fill, { scaleX: 0, duration: 0.35, ease: "power3.in" })
                .to(text, { yPercent: 0, duration: 0.2, ease: "power2.in" }, 0)
                .to(button, { color: scheme.base, duration: 0.2, ease: "power2.in" }, 0)
                .to(shine, { opacity: 0, duration: 0.1 }, 0)

            const handleEnter = () => {
                leaveTl.pause(0)
                enterTl.restart()
            }

            const handleLeave = () => {
                enterTl.pause(0)
                leaveTl.restart()
            }

            button.addEventListener("mouseenter", handleEnter)
            button.addEventListener("mouseleave", handleLeave)

            return () => {
                button.removeEventListener("mouseenter", handleEnter)
                button.removeEventListener("mouseleave", handleLeave)
            }
        }, root)

        return () => ctx.revert()
    }, [scheme.base])

    const radiusClass = radius === "sm" ? "rounded-sm" : radius === "md" ? "rounded-md" : "rounded-full"

    return (
        <div ref={rootRef}>
            <Button
                type="button"
                variant="pill"
                size="pill"
                data-shop-button
                onClick={() => router.push(href)}
                className={cn(
                    "relative min-w-[220px] overflow-hidden border bg-transparent transition-none cursor-pointer no-underline hover:no-underline",
                    radiusClass,
                    className
                )}
                style={{
                    "--shop-base": scheme.base,
                    "--shop-hover": scheme.hover,
                    borderColor: "var(--shop-base)",
                    color: "var(--shop-base)",
                }}
            >
                <span data-shop-fill className="absolute inset-0 z-0 bg-[color:var(--shop-hover)]" />
                <span
                    data-shop-shine
                    className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                />
                <span data-shop-text className="relative z-10 block no-underline">
                    {label}
                </span>
            </Button>
        </div>
    )
}

export default ShopAllButton

'use client'

import { useState, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Plus } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const FAQS = [
    {
        q: 'What is your return policy?',
        a: 'We offer hassle-free returns within 7 days of delivery. Items must be unworn, unwashed, and in their original packaging with all tags attached. Reach out to our support team and we\'ll take it from there.',
    },
    {
        q: 'How long does shipping take?',
        a: 'Standard shipping typically takes 3–5 business days. Express shipping (1–2 business days) is available at checkout. Free standard shipping applies to all orders — no minimum required.',
    },
    {
        q: 'Can I exchange for a different size?',
        a: 'Absolutely. If the fit isn\'t right, contact our support team within 7 days and we\'ll arrange a size exchange at no additional cost, subject to stock availability.',
    },
    {
        q: 'How do member discounts work?',
        a: 'Create a free account to unlock exclusive member pricing, early access to new arrivals, and seasonal promotions. Discounts are applied automatically at checkout — no codes needed.',
    },
    {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit and debit cards, UPI, net banking, and popular digital wallets. Every transaction is secured with industry-standard encryption.',
    },
    {
        q: 'How do I track my order?',
        a: 'Once your order is dispatched, you\'ll receive a confirmation email with a tracking link. You can also track it anytime from the Orders section inside your account dashboard.',
    },
]

const FAQItem = ({ faq, isOpen, onToggle }) => (
    <div className="border-b border-foreground/10">
        <button
            onClick={onToggle}
            aria-expanded={isOpen}
            className="flex w-full items-center justify-between gap-6 py-5 text-left"
        >
            <span className="font-neue text-[0.95rem] font-semibold uppercase tracking-[0.03em] text-[var(--dark-red-2)] lg:text-[1rem]">
                {faq.q}
            </span>
            <Plus
                className="size-4 flex-shrink-0 text-[var(--dark-red)] transition-transform duration-300"
                style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
            />
        </button>

        {/* grid-rows trick — no fixed max-height, no JS measurement */}
        <div
            className="grid transition-[grid-template-rows] duration-300 ease-in-out"
            style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
        >
            <div className="overflow-hidden">
                <p className="pb-5 pr-8 text-[0.84rem] leading-relaxed text-[var(--text-body)]">
                    {faq.a}
                </p>
            </div>
        </div>
    </div>
)

const FAQSection = () => {
    const [openIndex, setOpenIndex] = useState(null)
    const sectionRef = useRef(null)
    const headerRef = useRef(null)
    const ruleRef = useRef(null)
    const itemRefs = useRef([])

    const toggle = (i) => setOpenIndex((prev) => (prev === i ? null : i))

    useGSAP(() => {
        gsap.fromTo(
            headerRef.current,
            { autoAlpha: 0, y: 40 },
            {
                autoAlpha: 1,
                y: 0,
                duration: 0.9,
                ease: 'power4.out',
                scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true },
            }
        )

        gsap.fromTo(
            ruleRef.current,
            { scaleX: 0, transformOrigin: 'left center' },
            {
                scaleX: 1,
                duration: 1.2,
                ease: 'expo.inOut',
                delay: 0.12,
                scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true },
            }
        )

        gsap.fromTo(
            itemRefs.current,
            { autoAlpha: 0, y: 50, scale: 0.97 },
            {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: 0.95,
                ease: 'power4.out',
                stagger: 0.1,
                scrollTrigger: { trigger: sectionRef.current, start: 'top 72%', once: true },
            }
        )
    }, { scope: sectionRef })

    return (
        <section ref={sectionRef} className="website-gutter bg-background pt-[clamp(1.25rem,2.5vw,2rem)] pb-[clamp(2rem,4vw,3.5rem)]">

            {/* section header */}
            <div ref={headerRef} className="mb-4 flex items-end justify-between lg:mb-6">
                <div>
                    <p className="text-[1rem] font-semibold uppercase text-[var(--dark-red)]/60">
                        Got Questions?
                    </p>
                    <h2 className="mt-1.5 font-neue text-[clamp(1.8rem,4.8vw,3.8rem)] font-medium uppercase text-[var(--dark-red-2)]">
                        Frequently Asked
                    </h2>
                </div>
                <span className="hidden text-[0.68rem] font-semibold uppercase text-muted-foreground sm:block">
                    Returns · Shipping · Orders
                </span>
            </div>

            {/* animated rule */}
            <div ref={ruleRef} className="mb-10 h-px w-full bg-foreground/10 lg:mb-14" />

            {/* two-column grid on desktop */}
            <div className="grid gap-x-16 lg:grid-cols-2">
                {FAQS.map((faq, i) => (
                    <div
                        key={i}
                        ref={(el) => { itemRefs.current[i] = el }}
                    >
                        <FAQItem
                            faq={faq}
                            isOpen={openIndex === i}
                            onToggle={() => toggle(i)}
                        />
                    </div>
                ))}
            </div>

            {/* bottom hint */}
            <p className="mt-10 text-center text-[0.78rem] text-muted-foreground lg:mt-14">
                Still have a question?{' '}
                <a
                    href="/contact"
                    className="font-semibold text-[var(--dark-red-2)] underline underline-offset-2 transition-opacity hover:opacity-70"
                >
                    Contact our team
                </a>
            </p>
        </section>
    )
}

export default FAQSection

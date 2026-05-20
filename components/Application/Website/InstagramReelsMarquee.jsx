'use client'

import { useEffect, useRef } from 'react'

const instagramVideos = [
    "https://res.cloudinary.com/darrsi9y2/video/upload/v1773586807/VID-20260204-WA0385_bzffp6.mp4",
    "https://res.cloudinary.com/darrsi9y2/video/upload/v1773586807/VID-20260223-WA0435_unfxuc.mp4",
    "https://res.cloudinary.com/darrsi9y2/video/upload/v1773586807/VID-20260125-WA0610_nfqkfc.mp4",
    "https://res.cloudinary.com/darrsi9y2/video/upload/v1773586807/VID-20260217-WA0033_nufjor.mp4",
    "https://res.cloudinary.com/darrsi9y2/video/upload/v1773586808/VID-20260224-WA0146_iy2bkc.mp4",
    "https://res.cloudinary.com/darrsi9y2/video/upload/v1773586807/VID-20260216-WA0140_c7yy8m.mp4",
    "https://res.cloudinary.com/darrsi9y2/video/upload/v1773586809/VID-20260224-WA0147_tgwjvu.mp4",
]

const InstagramReelsMarquee = () => {
    const trackRef = useRef(null)
    const reels = [...instagramVideos, ...instagramVideos]

    useEffect(() => {
        if (!trackRef.current) return
        const videos = Array.from(trackRef.current.querySelectorAll('video'))

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.play().catch(() => {})
                    } else {
                        entry.target.pause()
                    }
                })
            },
            { rootMargin: '0px 200px 0px 200px', threshold: 0 }
        )

        videos.forEach((v) => observer.observe(v))
        return () => observer.disconnect()
    }, [])

    return (
        <section className="relative overflow-hidden bg-white py-12">
            <div className="website-gutter mb-6">
                <h1 className="text-left text-[3.8rem] font-medium uppercase text-[var(--dark-red-2)] z-50">
                    Gallery
                </h1>
            </div>
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#ffffff] via-[#fff]/70 to-transparent sm:w-24" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#ffffff] via-[#fff]/70 to-transparent sm:w-24" />

            <div className="instagram-marquee">
                <div className="instagram-track" ref={trackRef}>
                    {reels.map((video, index) => (
                        <div key={`${video}-${index}`} className="instagram-card">
                            <video
                                src={video}
                                muted
                                playsInline
                                loop
                                preload="none"
                                className="h-full w-full object-cover"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .instagram-marquee {
                    width: 100%;
                    overflow: hidden;
                }
                .instagram-track {
                    display: flex;
                    align-items: center;
                    gap: 18px;
                    width: max-content;
                    animation: insta-marquee 36s linear infinite;
                    will-change: transform;
                }
                .instagram-card {
                    width: 200px;
                    aspect-ratio: 9 / 16;
                    border-radius: var(--admin-shell-radius);
                    overflow: hidden;
                    background: #efe9e2;
                    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
                }
                @media (min-width: 640px) {
                    .instagram-card {
                        width: 230px;
                    }
                }
                @media (min-width: 1024px) {
                    .instagram-card {
                        width: 260px;
                    }
                }
                @keyframes insta-marquee {
                    0% {
                        transform: translateX(0%);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }
            `}</style>
        </section>
    )
}

export default InstagramReelsMarquee

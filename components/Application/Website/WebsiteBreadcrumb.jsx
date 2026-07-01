

const WebsiteBreadcrumb = ({ props }) => {
    return (
        <section className="relative isolate h-[180px] overflow-hidden sm:h-[160px] lg:h-[200px]">
            {/* Brand background */}
            <div className="absolute inset-0 bg-[var(--dark-red-2)]" />

            {/* Watermark title text — same pattern as /shop hero. On mobile the
                title is pushed below the fixed header so it isn't clipped, and it
                scales down + wraps cleanly (centered, tight leading) so long
                titles like "Terms & Conditions" don't overflow the phone width. */}
            <div className="absolute inset-x-0 top-20 z-10 flex justify-center px-4 sm:top-6 sm:px-0 lg:top-0">
                <div
                    className="pointer-events-none select-none font-neue font-semibold uppercase tracking-tighter text-white text-[clamp(2.25rem,11vw,3.25rem)] max-sm:text-center max-sm:leading-[0.85] sm:text-[clamp(3rem,16vw,18rem)]"
                    style={{
                        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 38%, rgba(0,0,0,0) 100%)',
                        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 38%, rgba(0,0,0,0) 100%)',
                        textShadow: '0 12px 32px rgba(0,0,0,0.18)',
                    }}
                    aria-hidden
                >
                    {props.title}
                </div>
            </div>

            {/* Gradient fade to background */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-16 bg-gradient-to-b from-transparent via-background/50 to-background sm:h-36" />


        </section>
    )
}

export default WebsiteBreadcrumb
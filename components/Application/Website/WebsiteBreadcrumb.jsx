

const WebsiteBreadcrumb = ({ props }) => {
    return (
        <section className="relative isolate h-[160px] overflow-hidden lg:h-[200px]">
            {/* Brand background */}
            <div className="absolute inset-0 bg-[var(--dark-red-2)]" />

            {/* Watermark title text — same pattern as /shop hero */}
            <div className="absolute inset-x-0 top-10 z-10 flex justify-center sm:top-12 lg:top-14">
                <div
                    className="pointer-events-none select-none font-neue font-semibold uppercase tracking-[0.02em] text-white/90"
                    style={{
                        fontSize: 'clamp(3rem, 16vw, 8rem)',
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
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-36 bg-gradient-to-b from-transparent via-background/50 to-background" />


        </section>
    )
}

export default WebsiteBreadcrumb
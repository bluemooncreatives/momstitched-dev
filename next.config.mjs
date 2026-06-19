// Content-Security-Policy scoped to the third parties this app actually uses:
// Razorpay checkout (script/frame/connect) and Cloudinary (images). 'unsafe-inline'
// is required for Next.js' inline bootstrap/hydration scripts and inline style
// attributes; tightening to a nonce-based strict-dynamic CSP is a future step.
const contentSecurityPolicy = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'self'",
    "form-action 'self'",
    "img-src 'self' data: blob: https://res.cloudinary.com https://*.razorpay.com",
    "font-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "script-src 'self' 'unsafe-inline' https://checkout.razorpay.com https://*.razorpay.com",
    "connect-src 'self' https://*.razorpay.com https://lumberjack.razorpay.com",
    "frame-src 'self' https://*.razorpay.com https://api.razorpay.com",
    "upgrade-insecure-requests",
].join('; ')

const securityHeaders = [
    { key: 'Content-Security-Policy', value: contentSecurityPolicy },
    { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        optimizePackageImports: ['lucide-react', 'gsap', '@gsap/react', 'react-icons', 'radix-ui'],
    },
    async headers() {
        return [
            {
                // Security headers on every route
                source: '/:path*',
                headers: securityHeaders,
            },
            {
                // Cache custom fonts for 1 year — they're content-addressed filenames
                source: '/assets/font/:path*',
                headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
            },
            {
                // Cache hero and other static images for 1 week
                source: '/assets/images/:path*',
                headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }],
            },
        ]
    },
    images: {
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 60 * 60 * 24 * 7,
        deviceSizes: [320, 420, 640, 768, 1024, 1200, 1440, 1920],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                port: '',
                pathname: '/**',
                search: ''
            }
        ]
    }
};

export default nextConfig;

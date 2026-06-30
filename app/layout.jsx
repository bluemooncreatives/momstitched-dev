import GlobalProvider from "@/components/Application/GlobalProvider";
import LenisProvider from '@/components/Application/LenisProvider'
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { Assistant, Geist } from 'next/font/google'
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const assistantFont = Assistant({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap'
})

export const metadata = {
  metadataBase: new URL('https://www.momstitched.com'),
  title: {
    default: 'MomStitched — Handcrafted Women\'s Ethnic Wear',
    template: '%s | MomStitched',
  },
  description:
    "From everyday comfort to festive charm, MomStitched brings you handcrafted women's ethnic wear — designs that make you shine effortlessly.",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'MomStitched',
    title: 'MomStitched — Handcrafted Women\'s Ethnic Wear',
    description:
      "From everyday comfort to festive charm, MomStitched brings you handcrafted women's ethnic wear — designs that make you shine effortlessly.",
    url: 'https://www.momstitched.com',
    images: [
      {
        url: '/assets/images/hero/01.webp',
        width: 1200,
        height: 630,
        alt: 'MomStitched — Handcrafted Women\'s Ethnic Wear',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MomStitched — Handcrafted Women\'s Ethnic Wear',
    description:
      "From everyday comfort to festive charm, MomStitched brings you handcrafted women's ethnic wear — designs that make you shine effortlessly.",
    images: ['/assets/images/hero/01.webp'],
  },
  icons: {
    icon: '/favicon.ico',
  },
  other: {
    'theme-color': '#3E000D',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <head>
        {/* Preconnect to Cloudinary — product images, hero thumbnails, and Instagram
            videos all resolve from this origin. dns-prefetch is the fallback for
            browsers that don't support preconnect. */}
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />

        {/* Preload only fonts on the LCP critical path.
            Medium (weight 600) is used by the LCP "Shop" heading.
            Book (weight 400) is the primary body font — preloaded so it's
            ready before below-the-fold content renders. */}
        <link rel="preload" href="/assets/font/PPNeueMontreal-Medium.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/assets/font/PPNeueMontreal-Book.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body
        className={`${assistantFont.className} antialiased`}
      >
        <GlobalProvider>
          <Toaster />
          <LenisProvider>
            {children}
          </LenisProvider>
        </GlobalProvider>
      </body>
    </html>
  );
}

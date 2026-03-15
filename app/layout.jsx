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
  title: "MomStitched",
  description: "From everyday comfort to festive charm, MomStitched brings you designs that make you shine effortlessly.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
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

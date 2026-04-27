import type { Metadata } from 'next'
import { DM_Sans, Cormorant_Garamond, DM_Mono } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500', '600'],
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-dm-mono',
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  title: 'ReviewMagic — Turn Guests Into Reviews',
  description: 'Generate authentic Google reviews in seconds. Built for restaurants, salons, and local businesses.',
  openGraph: {
    title: 'ReviewMagic',
    description: 'Turn happy customers into 5-star Google reviews.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${cormorant.variable} ${dmMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}

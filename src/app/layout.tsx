import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700', '900'],
  variable: '--font-playfair',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SandmanTales — Personalised Bedtime Stories for Your Child',
  description:
    'AI-powered bedtime stories with your child\'s name as the hero. Voice-narrated and illustrated in seconds. 3 free stories, no card needed.',
  openGraph: {
    title: 'SandmanTales — Tonight, Your Child Is the Hero',
    description:
      'AI-powered bedtime stories personalised with your child\'s name, illustrated and voice-narrated. Start free — no credit card needed.',
    type: 'website',
    siteName: 'SandmanTales',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'SandmanTales — Bedtime stories with your child as the hero',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SandmanTales — Tonight, Your Child Is the Hero',
    description:
      'AI-powered bedtime stories personalised with your child\'s name, illustrated and voice-narrated. Start free — no credit card needed.',
    images: ['/api/og'],
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? 'https://sandmantales.com'
  ),
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}

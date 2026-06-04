import React from "react"
import type { Metadata } from 'next'
import { DM_Serif_Display, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _dmSerif = DM_Serif_Display({ subsets: ["latin"], weight: "400" });
const _inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Chocomotion | Premium Motion Design Agency',
  description: 'Where motion meets flavor. We craft delicious animations and motion graphics that bring your brand to life.',
  generator: 'v0.app',
  metadataBase: new URL('https://chocomotion.agency'),
  openGraph: {
    title: 'Chocomotion | Premium Motion Design Agency',
    description: 'Where motion meets flavor. We craft delicious animations and motion graphics that bring your brand to life.',
    url: 'https://chocomotion.agency',
    siteName: 'Chocomotion',
    images: [
      {
        url: 'https://pub-2932e499ab424f33983dc4145a780d77.r2.dev/public/android-chrome-192x192.png',
        width: 1200,
        height: 630,
        alt: 'Chocomotion - Premium Motion Design Studio',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chocomotion | Premium Motion Design Agency',
    description: 'Where motion meets flavor. We craft delicious animations and motion graphics that bring your brand to life.',
    images: ['https://pub-2932e499ab424f33983dc4145a780d77.r2.dev/public/android-chrome-192x192.png'],
  },
  icons: {
    icon: [
      {
        url: '/favicon.ico',
      },
      {
        url: '/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        url: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
    ],
    apple: [
      {
        url: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        url: '/apple-icon.png',
      },
    ],
    other: [
      {
        rel: 'android-chrome-192x192',
        url: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        rel: 'android-chrome-512x512',
        url: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}

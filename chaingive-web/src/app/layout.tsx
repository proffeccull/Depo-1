import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#2E8B57',
}

export const metadata: Metadata = {
  title: 'ChainGive - Ethical Peer-to-Peer Giving',
  description: 'The community where we support each other. Give help, get help, and pay it forward.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ChainGive',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'ChainGive',
    title: 'ChainGive - Ethical Peer-to-Peer Giving',
    description: 'The community where we support each other. Give help, get help, and pay it forward.',
  },
  twitter: {
    card: 'summary',
    title: 'ChainGive - Ethical Peer-to-Peer Giving',
    description: 'The community where we support each other. Give help, get help, and pay it forward.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#2E8B57" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ChainGive" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
/*
 * src/app/layout.tsx
 */

import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import AppTopNav from '@/components/AppToNav';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'Riscos e GMUD',
  description: 'Gerenciamento de riscos e GMUD',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
      <body>
        <AppTopNav />
        <main>{children}</main>
      </body>
    </html>
  )
}


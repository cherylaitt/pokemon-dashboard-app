import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pokemon Dashboard',
  description: 'A scrollable dashboard displaying Pokemon from PokeAPI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

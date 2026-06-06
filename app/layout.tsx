import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Telkom OCA — Project Phases',
  description: 'Interactive presentation showing project phases and progress',
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

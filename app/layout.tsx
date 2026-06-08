import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Active User Behavior & Segmentation — Telkom OCA Project 2',
  description: 'Interactive presentation: Active User Behavior & Segmentation analysis for Telkom OCA, RevoU x Telkom Indonesia Virtual Internship Project 2',
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

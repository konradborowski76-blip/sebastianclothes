import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SebastianClothes – Sklep z sukienkami',
  description: 'Elegancja i komfort na każdą okazję.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  )
}

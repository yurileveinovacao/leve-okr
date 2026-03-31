import type { Metadata } from 'next'
import { Inter, Montserrat } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })
const montserrat = Montserrat({
  weight: ['700'],
  subsets: ['latin'],
  variable: '--font-montserrat'
})

export const metadata: Metadata = {
  title: 'Leve OKR',
  description: 'Plataforma de Gestão Ágil OKR',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} ${montserrat.variable}`}>{children}</body>
    </html>
  )
}

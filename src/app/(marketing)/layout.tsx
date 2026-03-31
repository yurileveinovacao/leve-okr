import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img src="/logo-leve-full.png" alt="Leve" className="h-10" />
          </Link>

          <Link href="/login">
            <Button className="bg-leve-verde hover:bg-leve-verde/90 text-white">
              Entrar
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-leve-azul text-white py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src="/logo-leve.png" alt="Leve" className="h-6 w-6" />
              <span className="font-logo font-bold">Leve Inovação</span>
            </div>
            <p className="text-white/60 text-sm">
              © 2026 Leve Inovação® - Todos os direitos reservados
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

'use client'

import { Bell, Search, Menu } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  title: string
  subtitle?: string
  onMenuClick?: () => void
}

export function Header({ title, subtitle, onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-[var(--background)] px-4 lg:px-6">
      <div className="flex items-center gap-3">
        {/* Botão hamburger - só mobile */}
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-[var(--accent)] rounded-lg -ml-2"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <div>
          <h1 className="text-lg lg:text-xl font-semibold">{title}</h1>
          {subtitle && (
            <p className="text-xs lg:text-sm text-[var(--muted-foreground)] hidden sm:block">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        {/* Busca - esconder em mobile pequeno */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <Input
            type="search"
            placeholder="Buscar..."
            className="w-40 lg:w-64 pl-9"
          />
        </div>

        {/* Ícone de busca em mobile */}
        <Button variant="ghost" size="icon" className="sm:hidden">
          <Search className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[var(--destructive)]" />
        </Button>
      </div>
    </header>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Target,
  CheckSquare,
  Calendar,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  X,
  Users,
  Globe
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/goals', label: 'Metas', icon: Target },
  { href: '/tasks', label: 'Tarefas', icon: CheckSquare },
  { href: '/checkin', label: 'Check-in', icon: Calendar },
  { href: '/documents', label: 'Documentos', icon: FileText },
  { href: '/transcripts', label: 'Transcrições', icon: MessageSquare },
  { href: '/portal', label: 'Portal Clientes', icon: Globe },
  { href: '/team', label: 'Equipe', icon: Users },
  { href: '/settings', label: 'Configurações', icon: Settings },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const getUserInitials = () => {
    if (!user) return 'U'
    const name = user.user_metadata?.full_name || user.email || ''
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'
  }

  const getUserName = () => {
    if (!user) return 'Usuário'
    return user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário'
  }

  const getUserEmail = () => {
    return user?.email || ''
  }

  const getUserAvatar = () => {
    return user?.user_metadata?.avatar_url || null
  }

  const handleLinkClick = () => {
    // Fechar sidebar em mobile ao clicar em um link
    if (onClose) {
      onClose()
    }
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen w-64 border-r bg-[var(--card)] transition-transform duration-300 ease-in-out",
        // Desktop: sempre visível
        "lg:translate-x-0",
        // Mobile: escondido por padrão, visível quando isOpen
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b px-6">
          <Link href="/dashboard" className="flex items-center gap-2" onClick={handleLinkClick}>
            <img src="/logo-leve.png" alt="Leve" className="h-8 w-8" />
            <span className="text-xl font-bold font-logo">Leve OKR</span>
          </Link>
          {/* Botão fechar - só mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-[var(--accent)] rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[var(--primary)] text-white'
                    : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            {getUserAvatar() ? (
              <img
                src={getUserAvatar()!}
                alt={getUserName()}
                className="h-9 w-9 rounded-full"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--secondary)]">
                <span className="text-sm font-medium">{getUserInitials()}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{getUserName()}</p>
              <p className="text-xs text-[var(--muted-foreground)] truncate">{getUserEmail()}</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg p-2 hover:bg-[var(--accent)]"
              title="Sair"
            >
              <LogOut className="h-4 w-4 text-[var(--muted-foreground)]" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-3">
          <p className="text-[10px] text-[var(--muted-foreground)] text-center">
            © 2026. Todos os direitos reservados - Leve Inovação®
          </p>
        </div>
      </div>
    </aside>
  )
}

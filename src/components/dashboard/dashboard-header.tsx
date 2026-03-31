'use client'

import { Header } from './header'
import { useSidebar } from '@/contexts/sidebar-context'

interface DashboardHeaderProps {
  title: string
  subtitle?: string
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const { toggle } = useSidebar()

  return (
    <Header
      title={title}
      subtitle={subtitle}
      onMenuClick={toggle}
    />
  )
}

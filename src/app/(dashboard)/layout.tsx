'use client'

export const dynamic = 'force-dynamic'

import { Sidebar } from '@/components/dashboard/sidebar'
import { SidebarProvider, useSidebar } from '@/contexts/sidebar-context'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <DashboardContent>
        {children}
      </DashboardContent>
    </SidebarProvider>
  )
}

function DashboardContent({
  children,
}: {
  children: React.ReactNode
}) {
  const { isOpen, setIsOpen } = useSidebar()

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Backdrop para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />

      <main className="lg:ml-64 min-h-screen">
        {children}
      </main>
    </div>
  )
}

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Leve Inovação · Portal de Projetos',
  description: 'Acompanhamento de tarefas e entregas do seu projeto',
}

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="portal-root">
      {children}
    </div>
  )
}

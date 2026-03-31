'use client'

export default function PortalHeader({ projectName }: { projectName?: string }) {
  return (
    <header className="portal-header">
      <div className="portal-header-left">
        <img src="/logo-leve.png" alt="Leve Inovação" className="portal-header-logo" />
        <span className="portal-header-sep">·</span>
        <span className="portal-header-label">projetos</span>
      </div>
      {projectName && (
        <div className="portal-header-right">
          <span className="portal-status-dot" />
          <span className="portal-header-client">{projectName}</span>
        </div>
      )}
    </header>
  )
}

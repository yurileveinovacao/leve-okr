'use client'

export default function PortalFooter() {
  return (
    <footer className="portal-footer">
      <p>Portal de projetos · Leve Inovação Estratégica</p>
      <p className="portal-footer-sub">
        Acesso restrito ao projeto. Link gerado em {new Date().toLocaleDateString('pt-BR')}
      </p>
    </footer>
  )
}

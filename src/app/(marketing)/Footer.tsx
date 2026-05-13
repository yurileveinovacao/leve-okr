export function Footer() {
  return (
    <footer id="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <img src="/logo-leve-full.png" alt="Leve OKR" />
            <p>
              Plataforma de Gestão de OKRs. Alinhe sua equipe, defina objetivos
              claros e acompanhe resultados-chave em tempo real.
            </p>
            <div className="footer-social">
              <a
                href="https://www.instagram.com/leveinovacao/"
                aria-label="Instagram"
                target="_blank"
                rel="noopener"
              >
                <i className="bi bi-instagram"></i>
              </a>
              <a
                href="https://www.linkedin.com/company/leveinovacao"
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener"
              >
                <i className="bi bi-linkedin"></i>
              </a>
              <a
                href="mailto:contato@leveinovacao.com.br"
                aria-label="E-mail"
              >
                <i className="bi bi-envelope"></i>
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h5>Navegação</h5>
            <ul>
              <li><a href="#hero">Início</a></li>
              <li><a href="#services">Serviços</a></li>
              <li><a href="#how-it-works">Como Funciona</a></li>
              <li><a href="#features">Recursos</a></li>
              <li><a href="#pricing">Planos</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Acesso e Leve</h5>
            <ul>
              <li><a href="/login"><i className="bi bi-box-arrow-in-right"></i> Entrar</a></li>
              <li><a href="https://leveinovacao.com.br" target="_blank" rel="noopener"><i className="bi bi-globe2"></i> Sobre a Leve</a></li>
              <li><a href="mailto:contato@leveinovacao.com.br"><i className="bi bi-envelope"></i> Contato</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 Leve Inovação Estratégica. Todos os direitos reservados.</p>
          <div style={{ display: 'flex', gap: 16 }}>
            <a href="#">Termos</a>
            <a href="#">Privacidade</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

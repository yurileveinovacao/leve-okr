import { Orb } from './Orb'
import { Showcase } from './Showcase'
import { Faq } from './Faq'

export default function LandingPage() {
  return (
    <>
      {/* ======= HERO ======= */}
      <section id="hero">
        <div className="hero-bg-pattern"></div>
        <div className="container">
          <div className="hero-grid">
            <div data-aos="fade-right" data-aos-duration="700">
              <div className="hero-badge">
                <div className="hero-badge-dot"></div>
                <span>Plataforma de Gestão de OKRs</span>
              </div>
              <h1 className="hero-title">
                Gerencie seus OKRs
                <span>com simplicidade.</span>
              </h1>
              <p className="hero-subtitle">
                Alinhe sua equipe, defina objetivos claros e acompanhe
                resultados-chave em tempo real. Tudo em uma plataforma
                simples e intuitiva.
              </p>
              <div className="hero-actions">
                <a href="/login" className="btn btn-primary btn-lg">
                  Começar agora <i className="bi bi-arrow-right"></i>
                </a>
                <a href="#how-it-works" className="btn btn-outline btn-lg">
                  Ver como funciona
                </a>
              </div>
              <div className="hero-trust">
                <div className="hero-trust-item">
                  <div className="hero-trust-value">100%</div>
                  <div className="hero-trust-label">
                    Alinhamento
                    <br />
                    entre times
                  </div>
                </div>
                <div className="hero-trust-divider"></div>
                <div className="hero-trust-item">
                  <div className="hero-trust-value">Real-time</div>
                  <div className="hero-trust-label">
                    Acompanhamento
                    <br />
                    de progresso
                  </div>
                </div>
                <div className="hero-trust-divider"></div>
                <div className="hero-trust-item">
                  <div className="hero-trust-value">Sem limite</div>
                  <div className="hero-trust-label">
                    de OKRs
                    <br />
                    por ciclo
                  </div>
                </div>
              </div>
            </div>
            <div
              className="hero-visual"
              data-aos="fade-left"
              data-aos-duration="700"
              data-aos-delay="200"
            >
              <Orb />
            </div>
          </div>
        </div>
        <svg
          className="hero-wave"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
        >
          <path
            fill="#20C4A6"
            fillOpacity="0.15"
            d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z"
          ></path>
        </svg>
      </section>

      {/* ======= IMPACT BAND ======= */}
      <section id="impact">
        <div className="container">
          <p className="impact-phrase" data-aos="fade-up">
            🎯 Times sem OKRs perseguem 10 metas e atingem 2. Com OKRs claros e
            visíveis, você foca no que importa e mede o que entrega.
          </p>
        </div>
      </section>

      {/* ======= SERVICES ======= */}
      <section id="services" className="section-pad">
        <div className="container">
          <div className="section-header" data-aos="fade-up">
            <div className="section-label">Serviços</div>
            <h2 className="section-title">
              Tudo que sua equipe precisa,
              <br />
              <span>em um só lugar</span>
            </h2>
            <p className="section-subtitle">
              A plataforma Leve OKR conecta gestão estratégica e execução do
              dia a dia em uma experiência simples, visual e colaborativa.
            </p>
          </div>
          <div className="services-grid">
            <div className="service-card" data-aos="fade-up" data-aos-delay="0">
              <div className="service-icon">
                <i className="bi bi-bullseye"></i>
              </div>
              <h3>Objetivos Estratégicos</h3>
              <p>
                Estruture objetivos por trimestre, ano ou ciclo personalizado.
                Vincule cada objetivo à estratégia da empresa e desdobre em
                times e pessoas.
              </p>
              <a href="#how-it-works" className="service-link">
                Ver módulo <i className="bi bi-arrow-right"></i>
              </a>
            </div>
            <div className="service-card" data-aos="fade-up" data-aos-delay="100">
              <div className="service-icon">
                <i className="bi bi-graph-up-arrow"></i>
              </div>
              <h3>Key Results em Tempo Real</h3>
              <p>
                Defina métricas quantitativas para cada objetivo. A
                plataforma atualiza o progresso automaticamente e mostra quem
                está no caminho e quem precisa de ajuda.
              </p>
              <a href="#features" className="service-link">
                Ver módulo <i className="bi bi-arrow-right"></i>
              </a>
            </div>
            <div className="service-card" data-aos="fade-up" data-aos-delay="200">
              <div className="service-icon">
                <i className="bi bi-diagram-3"></i>
              </div>
              <h3>Cascata de OKRs</h3>
              <p>
                Conecte OKRs de empresa, time e indivíduo em uma cascata
                visual. Todos veem como o trabalho deles contribui para o
                resultado geral.
              </p>
              <a href="#features" className="service-link">
                Ver plataforma <i className="bi bi-arrow-right"></i>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ======= HOW IT WORKS ======= */}
      <section id="how-it-works" className="section-pad">
        <div className="container">
          <div className="section-header center" data-aos="fade-up">
            <div className="section-label">Como Funciona</div>
            <h2 className="section-title">
              Do objetivo ao resultado
              <br />
              <span>em 4 passos simples</span>
            </h2>
            <p className="section-subtitle">
              Um fluxo guiado para quem está começando com OKRs e flexível
              o bastante para quem já tem cultura consolidada.
            </p>
          </div>
          <div className="steps-timeline">
            <div className="step-item" data-aos="fade-up" data-aos-delay="0">
              <div className="step-number">1</div>
              <div className="step-icon">
                <i className="bi bi-pencil-square"></i>
              </div>
              <div className="step-title">Defina seus Objetivos</div>
              <div className="step-desc">
                Crie objetivos qualitativos e inspiradores para o ciclo.
                Empresa, time ou individual — você escolhe a granularidade.
              </div>
            </div>
            <div className="step-item" data-aos="fade-up" data-aos-delay="100">
              <div className="step-number">2</div>
              <div className="step-icon">
                <i className="bi bi-rulers"></i>
              </div>
              <div className="step-title">Adicione Key Results</div>
              <div className="step-desc">
                Para cada objetivo, defina 3 a 5 resultados-chave mensuráveis.
                Métricas numéricas com valor inicial, alvo e prazo.
              </div>
            </div>
            <div className="step-item" data-aos="fade-up" data-aos-delay="200">
              <div className="step-number">3</div>
              <div className="step-icon">
                <i className="bi bi-bar-chart-line"></i>
              </div>
              <div className="step-title">Acompanhe em Tempo Real</div>
              <div className="step-desc">
                Atualize o progresso semanalmente. A plataforma calcula o
                percentual e sinaliza quem está on-track, em risco ou atrasado.
              </div>
            </div>
            <div className="step-item" data-aos="fade-up" data-aos-delay="300">
              <div className="step-number">4</div>
              <div className="step-icon">
                <i className="bi bi-arrow-repeat"></i>
              </div>
              <div className="step-title">Revise e Itere</div>
              <div className="step-desc">
                Ao final do ciclo, revise os resultados, aprenda com o time
                e prepare o próximo ciclo com o que funcionou.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======= FEATURES ======= */}
      <section id="features" className="section-pad">
        <div className="container">
          <div className="section-header center" data-aos="fade-up">
            <div className="section-label">Diferenciais</div>
            <h2 className="section-title">
              Por que escolher
              <br />
              <span>o Leve OKR?</span>
            </h2>
            <p className="section-subtitle">
              Uma plataforma pensada para a realidade de equipes brasileiras
              que querem resultados sem complicação.
            </p>
          </div>
          <div className="features-layout">
            <div className="features-list">
              <div className="feature-item" data-aos="fade-up">
                <div className="feature-icon-wrap">
                  <i className="bi bi-diagram-3"></i>
                </div>
                <div className="feature-text">
                  <h4>Cascata de OKRs Visual</h4>
                  <p>
                    Veja como os OKRs de empresa, time e pessoa se conectam
                    em uma árvore visual. Ninguém mais trabalha em silos.
                  </p>
                </div>
              </div>
              <div className="feature-item" data-aos="fade-up" data-aos-delay="60">
                <div className="feature-icon-wrap">
                  <i className="bi bi-lightning-charge"></i>
                </div>
                <div className="feature-text">
                  <h4>Atualização em Tempo Real</h4>
                  <p>
                    Cada vez que alguém atualiza um Key Result, o progresso
                    reflete imediatamente no dashboard. Sem reuniões só para
                    alinhar status.
                  </p>
                </div>
              </div>
              <div className="feature-item" data-aos="fade-up" data-aos-delay="120">
                <div className="feature-icon-wrap">
                  <i className="bi bi-people"></i>
                </div>
                <div className="feature-text">
                  <h4>Para Times de Qualquer Tamanho</h4>
                  <p>
                    De startups com 5 pessoas a empresas com 500. Convide
                    quantos colaboradores precisar, sem cobrar por usuário extra.
                  </p>
                </div>
              </div>
              <div className="feature-item" data-aos="fade-up" data-aos-delay="180">
                <div className="feature-icon-wrap">
                  <i className="bi bi-bell"></i>
                </div>
                <div className="feature-text">
                  <h4>Lembretes Automáticos</h4>
                  <p>
                    Notificações semanais para o time atualizar seus KRs.
                    Você não precisa cobrar — a plataforma faz isso.
                  </p>
                </div>
              </div>
              <div className="feature-item" data-aos="fade-up" data-aos-delay="240">
                <div className="feature-icon-wrap">
                  <i className="bi bi-shield-check"></i>
                </div>
                <div className="feature-text">
                  <h4>Sem Complexidade Corporativa</h4>
                  <p>
                    Nada de planilhas pesadas ou Workboard com 200 telas.
                    Interface limpa, foco no que importa: o resultado.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======= SHOWCASE ======= */}
      <Showcase />

      {/* ======= TESTIMONIALS ======= */}
      <section id="testimonials" className="section-pad">
        <div className="container">
          <div className="section-header center" data-aos="fade-up">
            <div className="section-label">Depoimentos</div>
            <h2 className="section-title">
              O que dizem nossos <span>clientes</span>
            </h2>
            <p className="section-subtitle">
              Empresas que estruturaram sua gestão por OKRs com a Leve.
            </p>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card" data-aos="fade-up" data-aos-delay="0">
              <span className="testimonial-placeholder-badge">Em breve</span>
              <div className="testimonial-stars">
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-fill"></i>
              </div>
              <div className="testimonial-quote">&ldquo;</div>
              <p className="testimonial-text">
                Depoimento real de cliente será inserido aqui em breve.
                Aguardamos o retorno da equipe para preencher com as
                experiências dos times que adotaram OKRs com a Leve.
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">G</div>
                <div className="testimonial-author-info">
                  <h5>Gestor de Times</h5>
                  <span>Empresa parceira Leve</span>
                </div>
              </div>
            </div>
            <div className="testimonial-card" data-aos="fade-up" data-aos-delay="100">
              <span className="testimonial-placeholder-badge">Em breve</span>
              <div className="testimonial-stars">
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-fill"></i>
              </div>
              <div className="testimonial-quote">&ldquo;</div>
              <p className="testimonial-text">
                Depoimento real de cliente será inserido aqui em breve.
                Aguardamos o retorno da equipe para preencher com as
                experiências dos times que adotaram OKRs com a Leve.
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">R</div>
                <div className="testimonial-author-info">
                  <h5>Responsável de RH</h5>
                  <span>Empresa parceira Leve</span>
                </div>
              </div>
            </div>
            <div className="testimonial-card" data-aos="fade-up" data-aos-delay="200">
              <span className="testimonial-placeholder-badge">Em breve</span>
              <div className="testimonial-stars">
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-fill"></i>
              </div>
              <div className="testimonial-quote">&ldquo;</div>
              <p className="testimonial-text">
                Depoimento real de cliente será inserido aqui em breve.
                Aguardamos o retorno da equipe para preencher com as
                experiências dos times que adotaram OKRs com a Leve.
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">D</div>
                <div className="testimonial-author-info">
                  <h5>Diretor Estratégico</h5>
                  <span>Empresa parceira Leve</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======= PRICING ======= */}
      <section id="pricing" className="section-pad">
        <div className="container">
          <div className="section-header center" data-aos="fade-up">
            <div className="section-label">Planos</div>
            <h2 className="section-title">
              Planos simples, <span>sem surpresas</span>
            </h2>
            <p className="section-subtitle">
              Comece grátis. Pague só quando o time crescer. Sem taxa de
              implementação.
            </p>
          </div>
          <div className="pricing-grid">
            {/* Starter */}
            <div className="pricing-card" data-aos="fade-up" data-aos-delay="0">
              <div className="pricing-title">Starter</div>
              <div className="pricing-price">Grátis</div>
              <div className="pricing-price-note">para times começando com OKRs</div>
              <p className="pricing-desc">
                Tudo que um time pequeno precisa para experimentar OKRs sem
                custo.
              </p>
              <div className="pricing-divider"></div>
              <ul className="pricing-features">
                <li><i className="bi bi-check-lg"></i> Até 5 usuários</li>
                <li><i className="bi bi-check-lg"></i> Até 3 ciclos por ano</li>
                <li><i className="bi bi-check-lg"></i> Cascata de OKRs visual</li>
                <li><i className="bi bi-check-lg"></i> Atualização em tempo real</li>
                <li><i className="bi bi-check-lg"></i> Suporte por e-mail</li>
              </ul>
              <a href="/login" className="btn btn-dark pricing-cta">
                Começar grátis
              </a>
            </div>

            {/* Pro - Featured */}
            <div className="pricing-card featured" data-aos="fade-up" data-aos-delay="100">
              <div className="pricing-badge">Mais escolhido</div>
              <div className="pricing-title">Pro</div>
              <div className="pricing-price"><sup>R$</sup>19<sub>,90</sub></div>
              <div className="pricing-price-note">por usuário / mês</div>
              <p className="pricing-desc">
                Para empresas estruturadas que já vivem cultura de resultado e
                precisam de gestão completa.
              </p>
              <div className="pricing-divider"></div>
              <ul className="pricing-features">
                <li><i className="bi bi-check-lg"></i> Usuários ilimitados</li>
                <li><i className="bi bi-check-lg"></i> Ciclos ilimitados</li>
                <li><i className="bi bi-check-lg"></i> Relatórios avançados e exportação</li>
                <li><i className="bi bi-check-lg"></i> Lembretes automáticos por e-mail</li>
                <li><i className="bi bi-check-lg"></i> Histórico completo por KR</li>
                <li><i className="bi bi-check-lg"></i> Suporte prioritário</li>
              </ul>
              <a
                href="mailto:contato@leveinovacao.com.br?subject=Plano%20Pro%20-%20Leve%20OKR"
                className="btn btn-primary pricing-cta"
              >
                Contratar Pro
              </a>
            </div>

            {/* Enterprise */}
            <div className="pricing-card" data-aos="fade-up" data-aos-delay="200">
              <div className="pricing-title">Enterprise</div>
              <div className="pricing-price" style={{ fontSize: 28, marginTop: 8 }}>
                Fale com<br />especialista
              </div>
              <div className="pricing-price-note" style={{ marginTop: 8 }}>
                operações com múltiplos times
              </div>
              <p className="pricing-desc">
                Solução personalizada para grandes operações com integrações,
                SSO e gerente dedicado.
              </p>
              <div className="pricing-divider"></div>
              <ul className="pricing-features">
                <li><i className="bi bi-check-lg"></i> SSO e provisionamento</li>
                <li><i className="bi bi-check-lg"></i> SLA dedicado</li>
                <li><i className="bi bi-check-lg"></i> Integrações personalizadas</li>
                <li><i className="bi bi-check-lg"></i> Gerente de conta exclusivo</li>
                <li><i className="bi bi-check-lg"></i> Onboarding enterprise</li>
              </ul>
              <a
                href="mailto:contato@leveinovacao.com.br?subject=Plano%20Enterprise%20-%20Leve%20OKR"
                className="btn btn-dark pricing-cta"
              >
                Solicitar proposta
              </a>
            </div>
          </div>
          <p
            style={{
              textAlign: 'center',
              marginTop: 32,
              fontSize: 13,
              color: 'var(--gray-600)',
            }}
          >
            * Sem fidelidade. Sem taxa de implementação. Cancele quando quiser.
          </p>
        </div>
      </section>

      {/* ======= FAQ ======= */}
      <Faq />

      {/* ======= CTA FINAL ======= */}
      <section id="cta-final">
        <div className="container">
          <div data-aos="zoom-in">
            <span className="cta-label">Pronto para começar?</span>
            <h2 className="section-title">
              Transforme seus OKRs hoje.
              <br />
              <span>Times alinhados, resultados visíveis.</span>
            </h2>
            <p className="section-subtitle">
              Comece grátis em minutos. Configure seu primeiro ciclo de OKRs
              ainda hoje e veja seu time alinhado já na próxima semana.
            </p>
            <div className="cta-actions">
              <a href="/login" className="btn btn-primary btn-lg">
                Começar grátis <i className="bi bi-arrow-right"></i>
              </a>
              <a
                href="mailto:contato@leveinovacao.com.br?subject=Quero%20conhecer%20o%20Leve%20OKR"
                className="btn btn-outline-light btn-lg"
              >
                Falar com especialista
              </a>
            </div>
            <p className="cta-note">
              Plano gratuito para sempre · Sem cartão de crédito · Suporte
              incluído
            </p>
          </div>
        </div>
      </section>
    </>
  )
}

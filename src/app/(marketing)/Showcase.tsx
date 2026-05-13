'use client'

import { useState } from 'react'

type PanelKey = 'cascata' | 'kr' | 'relatorios'

const PANELS: Record<PanelKey, { tabLabel: string; title: React.ReactNode; desc: string; bullets: string[] }> = {
  cascata: {
    tabLabel: 'Cascata de OKRs',
    title: <>Visão completa da <span>cascata estratégica</span></>,
    desc: 'Veja como objetivos da empresa se desdobram em times e pessoas. Cada nó da cascata mostra responsável, progresso e prazo. Identifique gargalos antes que eles travem o ciclo.',
    bullets: [
      'Árvore visual interativa de OKRs por ciclo',
      'Filtros por time, responsável ou status',
      'Comparativo entre objetivos da empresa, time e indivíduo',
      'Indicadores on-track, em risco e atrasado',
    ],
  },
  kr: {
    tabLabel: 'Edição de Key Results',
    title: <>Atualização rápida em <span>poucos cliques</span></>,
    desc: 'O time atualiza Key Results em segundos: valor atual, comentário e checkpoint. A plataforma calcula o progresso e dispara notificações automaticamente.',
    bullets: [
      'Histórico completo de cada update por KR',
      'Comentários para registrar contexto e decisões',
      'Indicador automático de tendência (subindo, parado, caindo)',
      'Lembretes semanais para o responsável',
    ],
  },
  relatorios: {
    tabLabel: 'Relatórios e Análises',
    title: <>Aprenda com <span>cada ciclo</span></>,
    desc: 'Ao final de cada trimestre, gere relatórios automáticos com o que foi atingido, o que não foi e onde estão os aprendizados. Use os insights para planejar o próximo ciclo com base em dados reais.',
    bullets: [
      'Resumo automático por ciclo, time ou pessoa',
      'Comparativo de performance entre ciclos',
      'Exportação em PDF e CSV para apresentações',
      'Aprendizados marcados pelo time durante a retro',
    ],
  },
}

function CascataMockup() {
  return (
    <div className="showcase-screen-mockup">
      <div className="mockup-bar">
        <span className="mockup-dot r"></span>
        <span className="mockup-dot y"></span>
        <span className="mockup-dot g"></span>
        <span className="mockup-url"></span>
      </div>
      <div className="mockup-content">
        <div className="mockup-row medium"></div>
        <div className="mockup-highlight"></div>
        <div className="mockup-card-row">
          <div className="mockup-card"></div>
          <div className="mockup-card"></div>
          <div className="mockup-card"></div>
        </div>
        <div className="mockup-row short"></div>
        <div className="mockup-row"></div>
      </div>
    </div>
  )
}

function KrMockup() {
  return (
    <div className="showcase-screen-mockup">
      <div className="mockup-bar">
        <span className="mockup-dot r"></span>
        <span className="mockup-dot y"></span>
        <span className="mockup-dot g"></span>
        <span className="mockup-url"></span>
      </div>
      <div className="mockup-content">
        <div className="mockup-row medium"></div>
        <div className="mockup-bar-progress">
          <div className="mockup-bar-progress-track">
            <div className="mockup-bar-progress-fill" style={{ width: '75%' }}></div>
          </div>
          <span className="mockup-bar-progress-label">75%</span>
        </div>
        <div className="mockup-bar-progress">
          <div className="mockup-bar-progress-track">
            <div className="mockup-bar-progress-fill" style={{ width: '52%' }}></div>
          </div>
          <span className="mockup-bar-progress-label">52%</span>
        </div>
        <div className="mockup-bar-progress">
          <div className="mockup-bar-progress-track">
            <div className="mockup-bar-progress-fill" style={{ width: '90%' }}></div>
          </div>
          <span className="mockup-bar-progress-label">90%</span>
        </div>
        <div className="mockup-row short"></div>
      </div>
    </div>
  )
}

function RelatoriosMockup() {
  return (
    <div className="showcase-screen-mockup">
      <div className="mockup-bar">
        <span className="mockup-dot r"></span>
        <span className="mockup-dot y"></span>
        <span className="mockup-dot g"></span>
        <span className="mockup-url"></span>
      </div>
      <div className="mockup-content">
        <div className="mockup-row medium"></div>
        <div className="mockup-card-row">
          <div className="mockup-card"></div>
          <div className="mockup-card"></div>
        </div>
        <div className="mockup-card-row">
          <div className="mockup-card"></div>
          <div className="mockup-card"></div>
        </div>
        <div className="mockup-highlight"></div>
        <div className="mockup-row short"></div>
      </div>
    </div>
  )
}

const MOCKUPS: Record<PanelKey, React.FC> = {
  cascata: CascataMockup,
  kr: KrMockup,
  relatorios: RelatoriosMockup,
}

export function Showcase() {
  const [active, setActive] = useState<PanelKey>('cascata')
  const Mockup = MOCKUPS[active]
  const data = PANELS[active]

  return (
    <section id="showcase">
      <div className="container">
        <div className="section-header center" data-aos="fade-up">
          <div className="section-label">Plataforma</div>
          <h2 className="section-title">
            Conheça a plataforma
            <br />
            <span>por dentro</span>
          </h2>
          <p className="section-subtitle">
            Visual, simples e poderosa. Pensada para tirar OKRs do PDF e
            colocar no dia a dia da equipe.
          </p>
        </div>

        <div className="showcase-tabs" data-aos="fade-up" data-aos-delay="100">
          {(Object.keys(PANELS) as PanelKey[]).map((k) => (
            <button
              key={k}
              className={`showcase-tab ${active === k ? 'active' : ''}`}
              onClick={() => setActive(k)}
            >
              {PANELS[k].tabLabel}
            </button>
          ))}
        </div>

        <div className="showcase-panels">
          <div className="showcase-panel active" data-aos="fade-up">
            <div className="showcase-screen">
              <Mockup />
            </div>
            <div className="showcase-info">
              <h3>{data.title}</h3>
              <p>{data.desc}</p>
              <div className="showcase-feature-list">
                {data.bullets.map((b, i) => (
                  <div key={i} className="showcase-feature-item">
                    <i className="bi bi-check-circle-fill"></i> {b}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

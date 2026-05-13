'use client'

import { useState } from 'react'

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: 'Preciso saber a metodologia OKR para usar a plataforma?',
    a: (
      <>
        Não. A plataforma guia você pelo processo — basta definir um objetivo
        e adicionar 3 a 5 resultados-chave. Para quem quer aprofundar,
        oferecemos materiais de apoio sobre a metodologia.
      </>
    ),
  },
  {
    q: 'Posso usar para OKRs pessoais ou só para empresa?',
    a: (
      <>
        Os dois. Você pode criar OKRs de empresa, time ou pessoais e
        conectá-los em uma cascata visual única.
      </>
    ),
  },
  {
    q: 'Quantos OKRs posso ter por ciclo?',
    a: (
      <>
        Sem limite técnico. Recomendamos seguir a regra dos 3 a 5 objetivos
        por ciclo (e 3 a 5 KRs por objetivo), mas a plataforma não impõe
        restrições.
      </>
    ),
  },
  {
    q: 'A plataforma se integra com Slack, Teams ou outras ferramentas?',
    a: (
      <>
        No plano Pro, o Leve OKR envia notificações por e-mail e oferece
        integração com Slack para alertas semanais. Integrações com Teams,
        Jira e outras estão no roadmap — entre em contato se precisar de
        algo específico.
      </>
    ),
  },
  {
    q: 'Posso importar meus OKRs de uma planilha?',
    a: (
      <>
        Sim. Suportamos importação via CSV/Excel para você migrar seus OKRs
        existentes em poucos minutos. Nossa equipe ajuda no processo durante
        o onboarding.
      </>
    ),
  },
  {
    q: 'Como funciona o trial?',
    a: (
      <>
        O plano Starter é gratuito para sempre, com até 5 usuários. Você pode
        usar à vontade para testar a metodologia e a plataforma. Quando seu
        time crescer ou precisar de mais recursos, você migra para o Pro.
      </>
    ),
  },
  {
    q: 'Os dados ficam seguros?',
    a: (
      <>
        Sim. Infraestrutura em nuvem com criptografia em trânsito e em
        repouso, conformidade com a LGPD, backups diários automáticos e
        isolamento de dados por organização.
      </>
    ),
  },
]

export function Faq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  return (
    <section id="faq" className="section-pad">
      <div className="container">
        <div className="section-header center" data-aos="fade-up">
          <div className="section-label">Dúvidas Frequentes</div>
          <h2 className="section-title">
            Perguntas que <span>todo time faz</span>
          </h2>
          <p className="section-subtitle">
            Não encontrou o que procurava? Fale com a gente em{' '}
            <a
              href="mailto:contato@leveinovacao.com.br"
              style={{ color: 'var(--primary-dark)', fontWeight: 600 }}
            >
              contato@leveinovacao.com.br
            </a>
            .
          </p>
        </div>

        <div className="faq-list" data-aos="fade-up" data-aos-delay="100">
          {FAQS.map((item, i) => {
            const open = openIdx === i
            return (
              <div key={i} className={`faq-item ${open ? 'open' : ''}`}>
                <button
                  className="faq-question"
                  onClick={() => setOpenIdx(open ? null : i)}
                  aria-expanded={open}
                >
                  <span>{item.q}</span>
                  <span className="faq-icon">
                    <i className="bi bi-chevron-down"></i>
                  </span>
                </button>
                <div className="faq-answer">
                  <div className="faq-answer-inner">{item.a}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

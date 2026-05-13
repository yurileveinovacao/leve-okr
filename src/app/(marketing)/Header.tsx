'use client'

import { useEffect, useState } from 'react'

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60)

      const sections = document.querySelectorAll<HTMLElement>('section[id]')
      let current = ''
      sections.forEach((s) => {
        if (window.scrollY >= s.offsetTop - 100) current = s.id
      })
      if (current) setActiveSection(current)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = navOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [navOpen])

  const close = () => setNavOpen(false)

  const navLinks = [
    { href: '#hero', label: 'Início' },
    { href: '#services', label: 'Serviços' },
    { href: '#how-it-works', label: 'Como Funciona' },
    { href: '#showcase', label: 'Plataforma' },
    { href: '#pricing', label: 'Planos' },
    { href: '#faq', label: 'FAQ' },
  ]

  return (
    <>
      <header id="header" className={scrolled ? 'scrolled' : ''}>
        <div className="container">
          <div className="header-inner">
            <a href="#hero" className="logo">
              <img src="/logo-leve-full.png" alt="Leve OKR" />
            </a>

            <nav className="nav-desktop">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className={activeSection === l.href.slice(1) ? 'active' : ''}
                >
                  {l.label}
                </a>
              ))}
              <a href="/login" className="nav-cta-login">
                Entrar <i className="bi bi-arrow-right"></i>
              </a>
            </nav>

            <button
              className="nav-toggle"
              onClick={() => setNavOpen(true)}
              aria-label="Abrir menu"
            >
              <i className="bi bi-list"></i>
            </button>
          </div>
        </div>
      </header>

      <div
        className={`nav-overlay ${navOpen ? 'open' : ''}`}
        onClick={close}
      ></div>

      <nav className={`nav-mobile ${navOpen ? 'open' : ''}`}>
        <div className="nav-mobile-header">
          <img src="/logo-leve-full.png" alt="Leve OKR" />
          <button
            className="nav-mobile-close"
            onClick={close}
            aria-label="Fechar menu"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="nav-mobile-ctas">
          <p className="nav-mobile-note">Acesso rápido</p>
          <a href="/login" className="nav-mobile-cta-login" onClick={close}>
            <i className="bi bi-box-arrow-in-right"></i> Entrar na plataforma
          </a>
        </div>

        <div className="nav-mobile-links">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} onClick={close}>
              <i className="bi bi-chevron-right"></i> {l.label}
            </a>
          ))}
        </div>
      </nav>
    </>
  )
}

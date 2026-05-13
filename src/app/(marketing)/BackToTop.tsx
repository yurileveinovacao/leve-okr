'use client'

import { useEffect, useState } from 'react'

export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <a
      href="#hero"
      className={`back-to-top ${visible ? 'visible' : ''}`}
      aria-label="Voltar ao topo"
    >
      <i className="bi bi-arrow-up"></i>
    </a>
  )
}

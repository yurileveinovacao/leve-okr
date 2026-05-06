'use client'

import { useEffect, useState } from 'react'
import { getCookie, setCookie } from '@/lib/cookies'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if (!getCookie('leve_consent')) {
      const t = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(t)
    }
  }, [])

  function close() {
    setClosing(true)
    setTimeout(() => setVisible(false), 300)
  }

  function decline() {
    setCookie('leve_consent', 'declined', 365)
    close()
  }

  function accept() {
    setCookie('leve_consent', 'accepted', 365)
    window.dispatchEvent(new Event('cookie-consent-accepted'))
    close()
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Consentimento de cookies"
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-[99999]"
      style={{
        animation: closing
          ? 'cookieSlideDown 0.3s ease-in forwards'
          : 'cookieSlideUp 0.3s ease-out forwards',
      }}
    >
      <div className="bg-white border-t border-gray-200 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-md">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-12">
          <p className="max-w-[680px] text-[13.5px] leading-relaxed text-gray-600">
            Utilizamos cookies para analisar o tráfego do site e otimizar sua experiência.
            Ao aceitar, você concorda com o uso de cookies de análise conforme nossa{' '}
            <a
              href="https://www.leveinovacao.com.br/privacidade"
              target="_blank"
              rel="noopener noreferrer"
              className="text-leve-azul underline underline-offset-2 transition-colors hover:text-leve-verde"
            >
              Política de Privacidade
            </a>
            .
          </p>
          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={decline}
              className="cursor-pointer rounded-[10px] border border-gray-200 bg-transparent px-6 py-2.5 text-[14px] font-medium text-gray-600 transition-all duration-200 hover:border-leve-verde"
            >
              Recusar
            </button>
            <button
              type="button"
              onClick={accept}
              className="cursor-pointer rounded-[10px] bg-leve-verde px-6 py-2.5 text-[14px] font-semibold text-leve-azul shadow-[0_4px_16px_rgba(32,196,166,0.2)] transition-all duration-200 hover:-translate-y-0.5"
            >
              Aceitar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

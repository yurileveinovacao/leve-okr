'use client'

import Script from 'next/script'

export function AosInit() {
  return (
    <Script
      src="https://unpkg.com/aos@2.3.1/dist/aos.js"
      strategy="afterInteractive"
      onLoad={() => {
        const w = window as unknown as { AOS?: { init: (opts: object) => void } }
        if (w.AOS) {
          w.AOS.init({ duration: 600, once: true, offset: 60 })
        }
      }}
    />
  )
}

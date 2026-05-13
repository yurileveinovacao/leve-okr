import './landing.css'
import Script from 'next/script'
import { Header } from './Header'
import { Footer } from './Footer'
import { BackToTop } from './BackToTop'
import { AosInit } from './AosInit'
import { GTMProvider } from '@/components/marketing/gtm-provider'
import { CookieConsent } from '@/components/marketing/cookie-consent'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Fontes Leve Design System + Bootstrap Icons + AOS */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap"
      />
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
      />
      <link
        rel="stylesheet"
        href="https://unpkg.com/aos@2.3.1/dist/aos.css"
      />

      {/* importmap precisa ser processado antes de qualquer module script.
          Inserido via dangerouslySetInnerHTML para preservar type="importmap". */}
      <script
        type="importmap"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            imports: {
              three:
                'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js',
            },
          }),
        }}
      />

      {/* dataLayer init (necessário antes do GTM ser ativado pelo consentimento) */}
      <Script id="dataLayer-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];`}
      </Script>

      <div className="leve-landing">
        <Header />
        <main>{children}</main>
        <Footer />
        <BackToTop />
      </div>

      <AosInit />
      <GTMProvider />
      <CookieConsent />
    </>
  )
}

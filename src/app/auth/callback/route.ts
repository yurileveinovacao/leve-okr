import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// URL de produção fixa para evitar problemas com 0.0.0.0
const PRODUCTION_URL = 'https://leve-okr-858949988639.southamerica-east1.run.app'

function getBaseUrl(request: Request): string {
  const url = new URL(request.url)

  // Verifica headers do Cloud Run para obter o host real
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https'

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`
  }

  // Se o host é 0.0.0.0 ou localhost, usa URL de produção
  if (url.host.includes('0.0.0.0') || url.host.includes('localhost')) {
    return PRODUCTION_URL
  }

  return url.origin
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const baseUrl = getBaseUrl(request)

  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorCode = searchParams.get('error_code')
  const errorDescription = searchParams.get('error_description')
  const next = searchParams.get('next') ?? '/dashboard'

  // Se há erro do OAuth
  if (error || errorCode) {
    console.error('OAuth error:', error, errorCode, errorDescription)
    const errorMsg = errorDescription || error || errorCode || 'unknown_error'
    return NextResponse.redirect(
      `${baseUrl}/login?error=${encodeURIComponent(errorMsg)}`
    )
  }

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('Exchange error:', exchangeError.message)
      return NextResponse.redirect(
        `${baseUrl}/login?error=${encodeURIComponent(exchangeError.message)}`
      )
    }

    return NextResponse.redirect(`${baseUrl}${next}`)
  }

  // Sem código - redirect para login
  return NextResponse.redirect(`${baseUrl}/login?error=no_code`)
}

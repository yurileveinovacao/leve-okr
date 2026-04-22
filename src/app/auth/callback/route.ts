import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Fallback quando headers estão ausentes (ex: 0.0.0.0 interno do Cloud Run).
// Pode ser sobrescrito via env var NEXT_PUBLIC_APP_URL.
const FALLBACK_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://okr.leveinovacao.com.br'

function getBaseUrl(request: Request): string {
  const url = new URL(request.url)

  // Verifica headers do Cloud Run / Cloudflare para obter o host real
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https'

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`
  }

  // Se o host é 0.0.0.0 ou localhost, usa URL de fallback
  if (url.host.includes('0.0.0.0') || url.host.includes('localhost')) {
    return FALLBACK_URL
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

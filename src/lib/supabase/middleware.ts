import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Se as variáveis não estão disponíveis (durante build), apenas continua
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Rotas públicas - acessíveis sem login
  const isLandingPage = pathname === '/'
  const isAuthPage = pathname.startsWith('/login')
  const isAuthCallback = pathname.startsWith('/auth/callback')
  const isPortalRoute = pathname.startsWith('/portal')
  const isPortalAPI = pathname.startsWith('/api/portal')
  const isAgentAPI = pathname.startsWith('/api/agent')
  const isPublicRoute = isLandingPage || isAuthPage || isAuthCallback || isPortalRoute || isPortalAPI || isAgentAPI

  // Helper para criar URL de redirecionamento usando o host correto
  // Usa x-forwarded-host (Cloud Run) ou host header para obter o hostname real
  const getRedirectUrl = (path: string) => {
    const forwardedHost = request.headers.get('x-forwarded-host')
    const host = request.headers.get('host')
    const protocol = request.headers.get('x-forwarded-proto') || 'https'

    // Prioriza x-forwarded-host (usado pelo Cloud Run), depois host
    const hostname = forwardedHost || host || request.nextUrl.host

    // Se o hostname é 0.0.0.0 ou localhost, usa a URL de fallback
    if (hostname.includes('0.0.0.0') || hostname.includes('localhost')) {
      const fallback = process.env.NEXT_PUBLIC_APP_URL || 'https://okr.leveinovacao.com.br'
      return new URL(path, fallback)
    }

    return new URL(path, `${protocol}://${hostname}`)
  }

  // Se usuário está logado e na landing page, redireciona para dashboard
  if (user && isLandingPage) {
    return NextResponse.redirect(getRedirectUrl('/dashboard'))
  }

  // Se usuário está logado e na página de login, redireciona para dashboard
  if (user && isAuthPage) {
    return NextResponse.redirect(getRedirectUrl('/dashboard'))
  }

  // Se não está logado e não é rota pública, redireciona para login
  if (!user && !isPublicRoute) {
    return NextResponse.redirect(getRedirectUrl('/login'))
  }

  return supabaseResponse
}

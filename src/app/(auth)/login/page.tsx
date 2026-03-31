'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Target, CheckCircle, TrendingUp, Users, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      // Traduzir erros comuns para português
      const errorMessages: Record<string, string> = {
        'OAuth+state+has+expired': 'Sessão expirada. Por favor, tente novamente.',
        'OAuth state has expired': 'Sessão expirada. Por favor, tente novamente.',
        'bad_oauth_state': 'Erro de autenticação. Por favor, tente novamente.',
        'auth_error': 'Erro ao autenticar. Por favor, tente novamente.',
        'exchange_failed': 'Falha ao completar login. Por favor, tente novamente.',
        'no_code': 'Código de autenticação não encontrado. Por favor, tente novamente.',
      }
      setError(errorMessages[errorParam] || decodeURIComponent(errorParam))
    }
  }, [searchParams])

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        console.error('Error logging in:', error.message)
        setError(error.message)
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Erro inesperado. Por favor, tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Painel Esquerdo - Branding (escondido no mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-leve-verde to-[#18a08a] p-12 flex-col justify-between relative overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/5 rounded-full" />

        {/* Conteúdo */}
        <div className="relative z-10">
          <div className="flex items-center">
            <img src="/logo-leve-full.png" alt="Leve" className="h-12 brightness-0 invert" />
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-logo font-bold text-white leading-tight">
              Gerencie seus OKRs<br />com simplicidade
            </h1>
            <p className="mt-4 text-lg text-white/80">
              Alinhe sua equipe, defina objetivos claros e acompanhe resultados-chave em tempo real.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <Target className="h-5 w-5" />
              </div>
              <span className="text-sm">Objetivos claros</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <CheckCircle className="h-5 w-5" />
              </div>
              <span className="text-sm">Resultados-chave</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
              <span className="text-sm">Progresso visual</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              <span className="text-sm">Colaboração</span>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-white/60 text-sm">
            © 2026 Leve Inovação® - Todos os direitos reservados
          </p>
        </div>
      </div>

      {/* Painel Direito - Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Logo mobile */}
          <div className="text-center lg:hidden">
            <div className="flex justify-center mb-4">
              <img src="/logo-leve-full.png" alt="Leve" className="h-12" />
            </div>
            <p className="mt-2 text-[var(--muted-foreground)]">
              Gestão de OKRs simples e eficiente
            </p>
          </div>

          {/* Cabeçalho desktop */}
          <div className="hidden lg:block text-center">
            <h2 className="text-3xl font-logo font-bold text-leve-azul">
              Bem-vindo de volta
            </h2>
            <p className="mt-2 text-[var(--muted-foreground)]">
              Entre para continuar gerenciando seus OKRs
            </p>
          </div>

          {/* Mensagem de erro */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Botão de login */}
          <div className="space-y-4">
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full h-14 text-base bg-white hover:bg-gray-50 text-leve-azul border-2 border-gray-200 hover:border-leve-verde transition-all duration-200"
              variant="outline"
            >
              {isLoading ? (
                <span className="flex items-center gap-3">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Entrando...
                </span>
              ) : (
                <span className="flex items-center gap-3">
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Entrar com Google
                </span>
              )}
            </Button>

            <p className="text-center text-sm text-[var(--muted-foreground)]">
              Ao entrar, você concorda com nossos{' '}
              <a href="#" className="text-leve-verde hover:underline">termos de uso</a>
              {' '}e{' '}
              <a href="#" className="text-leve-verde hover:underline">política de privacidade</a>.
            </p>
          </div>

          {/* Footer mobile */}
          <div className="lg:hidden text-center pt-8">
            <p className="text-xs text-[var(--muted-foreground)]">
              © 2026 Leve Inovação® - Todos os direitos reservados
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

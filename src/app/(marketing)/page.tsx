import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Target, CheckCircle, TrendingUp, Users, Calendar, MessageSquare, Bell, ArrowRight } from 'lucide-react'

export default function LandingPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decorativo */}
        <div className="absolute inset-0 bg-gradient-to-br from-leve-verde/5 to-transparent" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-leve-verde/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-leve-verde/10 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-logo font-bold text-leve-azul leading-tight">
              Gerencie seus OKRs com{' '}
              <span className="text-leve-verde">simplicidade</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Alinhe sua equipe, defina objetivos claros e acompanhe resultados-chave em tempo real.
              Tudo em uma plataforma simples e intuitiva.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" className="bg-leve-verde hover:bg-leve-verde/90 text-white h-14 px-8 text-lg">
                  Começar agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* O que é OKR */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-logo font-bold text-leve-azul">
              O que são OKRs?
            </h2>
            <p className="mt-4 text-gray-600">
              <strong>Objectives and Key Results</strong> (Objetivos e Resultados-chave) é uma metodologia de gestão
              usada por empresas como Google, Intel e Spotify para alinhar equipes e alcançar metas ambiciosas.
            </p>
          </div>

          <div className="mt-12 grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-leve-verde/10 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-leve-verde" />
              </div>
              <h3 className="text-xl font-bold text-leve-azul mb-2">Objetivo (O)</h3>
              <p className="text-gray-600">
                O que você quer alcançar. Deve ser inspirador, qualitativo e fácil de entender.
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Exemplo:</p>
                <p className="font-medium text-leve-azul">"Tornar-se referência em atendimento ao cliente"</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-leve-verde/10 flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-leve-verde" />
              </div>
              <h3 className="text-xl font-bold text-leve-azul mb-2">Resultado-chave (KR)</h3>
              <p className="text-gray-600">
                Como você vai medir o progresso. Deve ser específico, mensurável e com prazo definido.
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Exemplo:</p>
                <p className="font-medium text-leve-azul">"Aumentar NPS de 60 para 80 até dezembro"</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Funcionalidades */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-logo font-bold text-leve-azul">
              Tudo que você precisa
            </h2>
            <p className="mt-4 text-gray-600">
              Funcionalidades pensadas para simplificar a gestão de OKRs
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={Target}
              title="Projetos e Metas"
              description="Organize seus objetivos por projetos e acompanhe o progresso de cada meta."
            />
            <FeatureCard
              icon={CheckCircle}
              title="Gestão de Tarefas"
              description="Crie tarefas vinculadas às metas e atribua responsáveis."
            />
            <FeatureCard
              icon={Calendar}
              title="Check-ins Periódicos"
              description="Registre atualizações regulares e mantenha o time alinhado."
            />
            <FeatureCard
              icon={Users}
              title="Equipe Colaborativa"
              description="Convide membros do time e defina responsáveis para cada objetivo."
            />
            <FeatureCard
              icon={MessageSquare}
              title="Análise de Reuniões"
              description="Transcreva reuniões e extraia insights com inteligência artificial."
            />
            <FeatureCard
              icon={Bell}
              title="Notificações"
              description="Receba lembretes por email e WhatsApp sobre prazos e atualizações."
            />
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 md:py-24 bg-leve-verde">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-logo font-bold text-white">
            Pronto para alcançar seus objetivos?
          </h2>
          <p className="mt-4 text-white/80 text-lg">
            Comece a usar o Leve OKR gratuitamente e transforme a forma como sua equipe trabalha.
          </p>
          <div className="mt-8">
            <Link href="/login">
              <Button size="lg" className="bg-white text-leve-verde hover:bg-gray-100 h-14 px-8 text-lg font-semibold">
                Começar gratuitamente
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <div className="p-6 rounded-2xl border border-gray-100 hover:border-leve-verde/30 hover:shadow-lg transition-all duration-200">
      <div className="w-12 h-12 rounded-xl bg-leve-verde/10 flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-leve-verde" />
      </div>
      <h3 className="text-lg font-bold text-leve-azul mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  )
}

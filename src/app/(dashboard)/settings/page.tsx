'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  User,
  Bell,
  Mail,
  MessageSquare,
  Save,
  CheckCircle,
  Loader2,
  X,
  Link,
  Unlink
} from 'lucide-react'

type Integration = {
  type: string
  name: string
  description: string
  id: string | null
  isConnected: boolean
  config: Record<string, string> | null
}

type UserProfile = {
  id: string
  name: string
  email: string
  phone: string | null
}

export default function SettingsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  // Notifications state
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [whatsappNotifications, setWhatsappNotifications] = useState(true)

  // Wasender modal
  const [showWasenderModal, setShowWasenderModal] = useState(false)
  const [wasenderApiKey, setWasenderApiKey] = useState('')
  const [connectingWasender, setConnectingWasender] = useState(false)

  // OpenAI modal
  const [showOpenAIModal, setShowOpenAIModal] = useState(false)
  const [openaiApiKey, setOpenaiApiKey] = useState('')
  const [connectingOpenAI, setConnectingOpenAI] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [integrationsRes, userRes] = await Promise.all([
        fetch('/api/integrations'),
        fetch('/api/users/me')
      ])

      const [integrationsData, userData] = await Promise.all([
        integrationsRes.json(),
        userRes.json()
      ])

      setIntegrations(integrationsData)
      setUser(userData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)

    try {
      // Salvar preferências do usuário
      await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.name,
          phone: user.phone,
        })
      })

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Error saving:', error)
    } finally {
      setSaving(false)
    }
  }

  const connectWasender = async () => {
    if (!wasenderApiKey) return

    setConnectingWasender(true)

    try {
      const res = await fetch('/api/integrations/wasender', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: wasenderApiKey })
      })

      if (res.ok) {
        setIntegrations(prev => prev.map(i =>
          i.type === 'wasender' ? { ...i, isConnected: true } : i
        ))
        setShowWasenderModal(false)
        setWasenderApiKey('')
      } else {
        const error = await res.json()
        alert(error.error || 'Erro ao conectar')
      }
    } catch (error) {
      console.error('Error connecting:', error)
    } finally {
      setConnectingWasender(false)
    }
  }

  const connectOpenAI = async () => {
    if (!openaiApiKey) return

    setConnectingOpenAI(true)

    try {
      const res = await fetch('/api/integrations/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: openaiApiKey })
      })

      if (res.ok) {
        setIntegrations(prev => prev.map(i =>
          i.type === 'openai' ? { ...i, isConnected: true } : i
        ))
        setShowOpenAIModal(false)
        setOpenaiApiKey('')
      } else {
        const error = await res.json()
        alert(error.error || 'Erro ao conectar')
      }
    } catch (error) {
      console.error('Error connecting:', error)
    } finally {
      setConnectingOpenAI(false)
    }
  }

  const disconnectIntegration = async (type: string) => {
    if (!confirm('Tem certeza que deseja desconectar esta integração?')) return

    try {
      const res = await fetch(`/api/integrations/${type}`, { method: 'DELETE' })
      if (res.ok) {
        setIntegrations(prev => prev.map(i =>
          i.type === type ? { ...i, isConnected: false } : i
        ))
      }
    } catch (error) {
      console.error('Error disconnecting:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <DashboardHeader title="Configurações" subtitle="Gerencie suas preferências" />
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader title="Configurações" subtitle="Gerencie suas preferências" />

      <div className="p-6 space-y-6 max-w-2xl">
        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Perfil
            </CardTitle>
            <CardDescription>Suas informações pessoais</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nome</label>
              <Input
                value={user?.name || ''}
                onChange={(e) => setUser(prev => prev ? { ...prev, name: e.target.value } : null)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                value={user?.email || ''}
                type="email"
                className="mt-1"
                disabled
              />
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Email não pode ser alterado
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Telefone (WhatsApp)</label>
              <Input
                value={user?.phone || ''}
                onChange={(e) => setUser(prev => prev ? { ...prev, phone: e.target.value } : null)}
                placeholder="+55 11 99999-9999"
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações
            </CardTitle>
            <CardDescription>Configure como você quer receber lembretes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Email notifications */}
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[var(--secondary)] p-2">
                  <Mail className="h-5 w-5 text-[var(--primary)]" />
                </div>
                <div>
                  <p className="font-medium">Notificações por Email</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Receba lembretes de check-in semanais
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  emailNotifications ? 'bg-[var(--primary)]' : 'bg-[var(--secondary)]'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* WhatsApp notifications */}
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[var(--secondary)] p-2">
                  <MessageSquare className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium">Notificações por WhatsApp</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Receba lembretes de tarefas com prazo próximo
                  </p>
                </div>
              </div>
              <button
                onClick={() => setWhatsappNotifications(!whatsappNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  whatsappNotifications ? 'bg-[var(--primary)]' : 'bg-[var(--secondary)]'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    whatsappNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Notification schedule */}
            <div className="p-4 rounded-lg border">
              <p className="font-medium mb-3">Horário dos lembretes</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm text-[var(--muted-foreground)]">Check-in semanal</label>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <Input type="time" defaultValue="09:00" className="w-full sm:w-32" />
                    <Badge variant="secondary">Segunda-feira</Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-[var(--muted-foreground)]">Lembrete de tarefas</label>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <Input type="time" defaultValue="08:00" className="w-full sm:w-32" />
                    <Badge variant="secondary">Diário</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integrations */}
        <Card>
          <CardHeader>
            <CardTitle>Integrações</CardTitle>
            <CardDescription>Conecte com outras ferramentas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {integrations.map((integration) => (
              <div key={integration.type} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  {integration.type === 'google_meet' ? (
                    <img
                      src="https://www.gstatic.com/images/branding/product/1x/meet_48dp.png"
                      alt="Google Meet"
                      className="h-10 w-10"
                    />
                  ) : integration.type === 'openai' ? (
                    <div className="h-10 w-10 rounded-lg bg-[#10a37f] flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="currentColor">
                        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364l2.0201-1.1638a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/>
                      </svg>
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-green-500 flex items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-white" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{integration.name}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {integration.description}
                    </p>
                  </div>
                </div>
                {integration.isConnected ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-green-500">Conectado</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => disconnectIntegration(integration.type)}
                    >
                      <Unlink className="h-4 w-4 text-[var(--muted-foreground)]" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (integration.type === 'wasender') {
                        setShowWasenderModal(true)
                      } else if (integration.type === 'openai') {
                        setShowOpenAIModal(true)
                      } else if (integration.type === 'google_meet') {
                        // Google OAuth - por agora apenas marcar como conectado
                        alert('Integração com Google Meet será implementada em breve.')
                      }
                    }}
                  >
                    <Link className="h-4 w-4 mr-2" />
                    Conectar
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : saved ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Salvo!
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações
            </>
          )}
        </Button>
      </div>

      {/* Wasender Modal */}
      {showWasenderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Conectar Wasender</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowWasenderModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-[var(--muted-foreground)]">
                  Digite sua API Key do Wasender para conectar e enviar notificações via WhatsApp.
                </p>

                <div>
                  <label className="text-sm font-medium">API Key</label>
                  <Input
                    value={wasenderApiKey}
                    onChange={(e) => setWasenderApiKey(e.target.value)}
                    placeholder="Sua API Key do Wasender"
                    type="password"
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setShowWasenderModal(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button
                    onClick={connectWasender}
                    disabled={connectingWasender || !wasenderApiKey}
                    className="flex-1"
                  >
                    {connectingWasender ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Conectando...
                      </>
                    ) : (
                      <>
                        <Link className="h-4 w-4 mr-2" />
                        Conectar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* OpenAI Modal */}
      {showOpenAIModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Conectar OpenAI</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowOpenAIModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-[var(--muted-foreground)]">
                  Digite sua API Key da OpenAI para habilitar análise de transcrições e sugestão automática de tarefas.
                </p>

                <div>
                  <label className="text-sm font-medium">API Key</label>
                  <Input
                    value={openaiApiKey}
                    onChange={(e) => setOpenaiApiKey(e.target.value)}
                    placeholder="sk-..."
                    type="password"
                    className="mt-1"
                  />
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">
                    Obtenha sua chave em platform.openai.com
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setShowOpenAIModal(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button
                    onClick={connectOpenAI}
                    disabled={connectingOpenAI || !openaiApiKey}
                    className="flex-1"
                  >
                    {connectingOpenAI ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Conectando...
                      </>
                    ) : (
                      <>
                        <Link className="h-4 w-4 mr-2" />
                        Conectar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

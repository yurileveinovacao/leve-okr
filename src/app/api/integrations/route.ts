import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/integrations - Listar integrações do usuário
export async function GET() {
  try {
    const user = await requireAuth()

    const integrations = await prisma.integration.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    // Retornar todas as integrações possíveis com status
    const allIntegrations = [
      { type: 'google_meet', name: 'Google Meet', description: 'Transcrições automáticas de reuniões' },
      { type: 'wasender', name: 'Wasender', description: 'Notificações via WhatsApp' },
      { type: 'openai', name: 'OpenAI', description: 'IA para análise de transcrições e sugestão de tarefas' },
    ].map(integration => {
      const existing = integrations.find(i => i.type === integration.type)
      return {
        ...integration,
        id: existing?.id || null,
        isConnected: existing?.isConnected || false,
        config: existing?.config || null,
      }
    })

    return NextResponse.json(allIntegrations)
  } catch (error) {
    console.error('Error fetching integrations:', error)
    return NextResponse.json({ error: 'Failed to fetch integrations' }, { status: 500 })
  }
}

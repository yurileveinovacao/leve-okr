import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

// POST /api/integrations/[type] - Conectar integração
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const user = await requireAuth()
    const { type } = await params
    const body = await request.json()

    // Validar tipo
    if (!['google_meet', 'wasender', 'openai'].includes(type)) {
      return NextResponse.json({ error: 'Invalid integration type' }, { status: 400 })
    }

    // Para Wasender, validar API key
    if (type === 'wasender') {
      const { apiKey } = body
      if (!apiKey) {
        return NextResponse.json({ error: 'API key is required' }, { status: 400 })
      }

      // Validar API key com Wasender (simulação - em produção faria chamada real)
      // Por agora, apenas verificar se tem formato válido
      if (apiKey.length < 10) {
        return NextResponse.json({ error: 'Invalid API key format' }, { status: 400 })
      }
    }

    // Para OpenAI, validar API key
    if (type === 'openai') {
      const { apiKey } = body
      if (!apiKey) {
        return NextResponse.json({ error: 'API key is required' }, { status: 400 })
      }

      // Validar formato da API key da OpenAI (começa com sk-)
      if (!apiKey.startsWith('sk-')) {
        return NextResponse.json({ error: 'Invalid OpenAI API key format. Must start with sk-' }, { status: 400 })
      }
    }

    // Upsert integração
    const integration = await prisma.integration.upsert({
      where: {
        userId_type: {
          userId: user.id,
          type,
        }
      },
      update: {
        isConnected: true,
        config: body,
      },
      create: {
        type,
        isConnected: true,
        config: body,
        userId: user.id,
      }
    })

    return NextResponse.json(integration)
  } catch (error) {
    console.error('Error connecting integration:', error)
    return NextResponse.json({ error: 'Failed to connect integration' }, { status: 500 })
  }
}

// DELETE /api/integrations/[type] - Desconectar integração
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const user = await requireAuth()
    const { type } = await params

    const integration = await prisma.integration.findUnique({
      where: {
        userId_type: {
          userId: user.id,
          type,
        }
      }
    })

    if (!integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 })
    }

    // Atualizar para desconectado (não deletar para manter histórico)
    await prisma.integration.update({
      where: { id: integration.id },
      data: {
        isConnected: false,
        config: Prisma.JsonNull,
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error disconnecting integration:', error)
    return NextResponse.json({ error: 'Failed to disconnect integration' }, { status: 500 })
  }
}

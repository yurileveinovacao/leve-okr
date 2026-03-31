import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/transcripts/[id] - Obter transcrição do usuário
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    // Buscar transcrição verificando ownership via goal.project.userId
    const transcript = await prisma.meetingTranscript.findFirst({
      where: {
        id,
        goal: { project: { userId: user.id } }
      },
      include: {
        goal: {
          select: {
            id: true,
            title: true,
            project: {
              select: {
                name: true,
                color: true,
                userId: true
              }
            }
          }
        },
        suggestedTasks: {
          include: {
            suggestedGoal: true,
            suggestedResponsible: true,
          }
        }
      }
    })

    if (!transcript) {
      return NextResponse.json({ error: 'Transcript not found' }, { status: 404 })
    }

    return NextResponse.json(transcript)
  } catch (error) {
    console.error('Error fetching transcript:', error)
    return NextResponse.json({ error: 'Failed to fetch transcript' }, { status: 500 })
  }
}

// PUT /api/transcripts/[id] - Atualizar transcrição do usuário
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params
    const body = await request.json()

    // Verificar se transcrição pertence ao usuário
    const existingTranscript = await prisma.meetingTranscript.findFirst({
      where: {
        id,
        goal: { project: { userId: user.id } }
      }
    })

    if (!existingTranscript) {
      return NextResponse.json({ error: 'Transcript not found' }, { status: 404 })
    }

    const transcript = await prisma.meetingTranscript.update({
      where: { id },
      data: body,
      include: {
        suggestedTasks: true
      }
    })

    return NextResponse.json(transcript)
  } catch (error) {
    console.error('Error updating transcript:', error)
    return NextResponse.json({ error: 'Failed to update transcript' }, { status: 500 })
  }
}

// DELETE /api/transcripts/[id] - Deletar transcrição do usuário
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    // Verificar se transcrição pertence ao usuário
    const existingTranscript = await prisma.meetingTranscript.findFirst({
      where: {
        id,
        goal: { project: { userId: user.id } }
      }
    })

    if (!existingTranscript) {
      return NextResponse.json({ error: 'Transcript not found' }, { status: 404 })
    }

    await prisma.meetingTranscript.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting transcript:', error)
    return NextResponse.json({ error: 'Failed to delete transcript' }, { status: 500 })
  }
}

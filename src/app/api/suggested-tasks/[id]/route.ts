import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// PUT /api/suggested-tasks/[id] - Aprovar/Rejeitar tarefa sugerida
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params
    const body = await request.json()
    const { status, goalId } = body

    if (!status || !['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be APPROVED, REJECTED, or PENDING' },
        { status: 400 }
      )
    }

    // Buscar tarefa sugerida
    const suggestedTask = await prisma.suggestedTask.findUnique({
      where: { id }
    })

    if (!suggestedTask) {
      return NextResponse.json({ error: 'Suggested task not found' }, { status: 404 })
    }

    // Se está aprovando, criar tarefa real
    if (status === 'APPROVED') {
      if (!goalId) {
        return NextResponse.json(
          { error: 'goalId is required when approving a task' },
          { status: 400 }
        )
      }

      // Verificar se a meta existe
      const goal = await prisma.goal.findUnique({
        where: { id: goalId }
      })

      if (!goal) {
        return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
      }

      // Criar tarefa real
      await prisma.task.create({
        data: {
          title: suggestedTask.suggestedTitle,
          status: 'PENDING',
          source: 'MEETING_TRANSCRIPT',
          goalId,
          responsibleId: user.id,
        }
      })
    }

    // Atualizar status da tarefa sugerida
    const updatedSuggestedTask = await prisma.suggestedTask.update({
      where: { id },
      data: {
        status,
        suggestedGoalId: goalId || null,
      },
      include: {
        suggestedGoal: true,
        suggestedResponsible: true,
      }
    })

    return NextResponse.json(updatedSuggestedTask)
  } catch (error) {
    console.error('Error updating suggested task:', error)
    return NextResponse.json({ error: 'Failed to update suggested task' }, { status: 500 })
  }
}

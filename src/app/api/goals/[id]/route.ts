import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { projectScopeWhere } from '@/lib/auth-scope'

export const dynamic = 'force-dynamic'

// GET /api/goals/[id] - Buscar meta específica da organização
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const scope = await projectScopeWhere(user.id)
    const { id } = await params

    const goal = await prisma.goal.findFirst({
      where: {
        id,
        project: scope
      },
      include: {
        responsible: true,
        project: true,
        tasks: {
          include: { responsible: true },
          orderBy: { createdAt: 'desc' }
        },
        checkins: {
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    })

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }

    return NextResponse.json(goal)
  } catch (error) {
    console.error('Error fetching goal:', error)
    return NextResponse.json({ error: 'Failed to fetch goal' }, { status: 500 })
  }
}

// PUT /api/goals/[id] - Atualizar meta da organização
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const scope = await projectScopeWhere(user.id)
    const { id } = await params

    const existingGoal = await prisma.goal.findFirst({
      where: {
        id,
        project: scope
      }
    })

    if (!existingGoal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }

    const body = await request.json()
    const { title, description, targetValue, currentValue, unit, status, dueDate, responsibleId } = body

    const goal = await prisma.goal.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(targetValue !== undefined && { targetValue }),
        ...(currentValue !== undefined && { currentValue }),
        ...(unit && { unit }),
        ...(status && { status }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(responsibleId && { responsibleId }),
      },
      include: {
        responsible: true,
        project: true
      }
    })

    return NextResponse.json(goal)
  } catch (error) {
    console.error('Error updating goal:', error)
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 })
  }
}

// DELETE /api/goals/[id] - Deletar meta da organização
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const scope = await projectScopeWhere(user.id)
    const { id } = await params

    const existingGoal = await prisma.goal.findFirst({
      where: {
        id,
        project: scope
      }
    })

    if (!existingGoal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }

    await prisma.goal.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting goal:', error)
    return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/goals - Listar metas do usuário
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    const goals = await prisma.goal.findMany({
      where: {
        ...(projectId && { projectId }),
        project: { userId: user.id }  // Filtrar apenas metas de projetos do usuário
      },
      include: {
        responsible: true,
        project: true,
        _count: {
          select: { tasks: true, checkins: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(goals)
  } catch (error) {
    console.error('Error fetching goals:', error)
    return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 })
  }
}

// POST /api/goals - Criar meta
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    const body = await request.json()
    const { title, description, targetValue, currentValue, unit, status, dueDate, projectId, responsibleId } = body

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    // Verificar se o projeto pertence ao usuário
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: user.id }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const goal = await prisma.goal.create({
      data: {
        title,
        description,
        targetValue: targetValue || 100,
        currentValue: currentValue || 0,
        unit: unit || '%',
        status: status || 'ON_TRACK',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        responsibleId: responsibleId || user.id,
      },
      include: {
        responsible: true,
        project: true
      }
    })

    return NextResponse.json(goal, { status: 201 })
  } catch (error) {
    console.error('Error creating goal:', error)
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 })
  }
}

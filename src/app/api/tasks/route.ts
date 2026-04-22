import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { projectScopeWhere } from '@/lib/auth-scope'

// GET /api/tasks - Listar tarefas da organização
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const scope = await projectScopeWhere(user.id)

    const { searchParams } = new URL(request.url)
    const goalId = searchParams.get('goalId')
    const projectId = searchParams.get('projectId')
    const status = searchParams.get('status')

    const tasks = await prisma.task.findMany({
      where: {
        ...(goalId && { goalId }),
        ...(projectId && { projectId }),
        ...(status && { status: status as any }),
        OR: [
          { goal: { project: scope } },
          { project: scope },
        ],
      },
      include: {
        responsible: true,
        goal: {
          include: {
            project: true
          }
        },
        project: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

// POST /api/tasks - Criar tarefa
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const scope = await projectScopeWhere(user.id)

    const body = await request.json()
    const { title, description, status, dueDate, goalId, projectId, responsibleId, responsibleName, origin, source } = body

    if (!goalId && !projectId) {
      return NextResponse.json({ error: 'Goal ID or Project ID is required' }, { status: 400 })
    }

    // Verificar ownership via escopo de organização
    if (goalId) {
      const goal = await prisma.goal.findFirst({
        where: { id: goalId, project: scope }
      })
      if (!goal) {
        return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
      }
    }

    if (projectId) {
      const project = await prisma.project.findFirst({
        where: { id: projectId, ...scope }
      })
      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 })
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'PENDING',
        dueDate: dueDate ? new Date(dueDate) : null,
        goalId: goalId || null,
        projectId: projectId || null,
        responsibleId: responsibleId || user.id,
        responsibleName: responsibleName || null,
        origin: origin || null,
        source: source || 'MANUAL',
      },
      include: {
        responsible: true,
        goal: true,
        project: true,
      }
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function validateAgentKey(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return false
  const key = authHeader.slice(7)
  return key === process.env.AGENT_API_KEY
}

// POST /api/agent/tasks - Criar tarefas via agente (meeting-notes)
export async function POST(request: NextRequest) {
  if (!validateAgentKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { projectToken, tasks } = body

    if (!projectToken || !Array.isArray(tasks) || tasks.length === 0) {
      return NextResponse.json(
        { error: 'projectToken and tasks array are required' },
        { status: 400 }
      )
    }

    const project = await prisma.project.findUnique({
      where: { publicToken: projectToken }
    })

    if (!project) {
      return NextResponse.json(
        { error: `Project not found for token: ${projectToken}` },
        { status: 404 }
      )
    }

    const created = await prisma.task.createMany({
      data: tasks.map((t: any) => ({
        title: t.title,
        description: t.description || null,
        status: t.status || 'PENDING',
        dueDate: t.dueDate ? new Date(t.dueDate) : null,
        responsibleName: t.responsibleName || null,
        origin: t.origin || null,
        source: 'AGENT',
        projectId: project.id,
      })),
    })

    return NextResponse.json(
      { success: true, count: created.count, projectId: project.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating agent tasks:', error)
    return NextResponse.json({ error: 'Failed to create tasks' }, { status: 500 })
  }
}

// GET /api/agent/tasks - Listar tarefas de um projeto via token
export async function GET(request: NextRequest) {
  if (!validateAgentKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const projectToken = searchParams.get('projectToken')

    if (!projectToken) {
      return NextResponse.json({ error: 'projectToken is required' }, { status: 400 })
    }

    const project = await prisma.project.findUnique({
      where: { publicToken: projectToken }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const tasks = await prisma.task.findMany({
      where: { projectId: project.id },
      include: { responsible: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching agent tasks:', error)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/portal/[token] - Dados públicos do projeto para o portal
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    const project = await prisma.project.findUnique({
      where: { publicToken: token },
      select: {
        id: true,
        name: true,
        color: true,
        tasks: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            dueDate: true,
            origin: true,
            responsibleName: true,
            source: true,
            createdAt: true,
            responsible: {
              select: { name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const now = new Date()
    now.setHours(0, 0, 0, 0)

    const tasks = project.tasks.map(t => ({
      ...t,
      responsavel: t.responsible?.name || t.responsibleName || 'Não atribuído',
    }))

    const total = tasks.length
    const pending = tasks.filter(t => t.status === 'PENDING').length
    const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length
    const completed = tasks.filter(t => t.status === 'COMPLETED').length
    const overdue = tasks.filter(t =>
      t.status !== 'COMPLETED' && t.dueDate && new Date(t.dueDate) < now
    ).length

    return NextResponse.json({
      project: { name: project.name, color: project.color },
      tasks,
      metrics: {
        total,
        pending,
        inProgress,
        completed,
        overdue,
        progress: total > 0 ? Math.round((completed / total) * 100) : 0,
      },
    })
  } catch (error) {
    console.error('Error fetching portal data:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}

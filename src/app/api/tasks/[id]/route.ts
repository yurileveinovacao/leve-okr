import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { projectScopeWhere } from '@/lib/auth-scope'

// GET /api/tasks/[id] - Buscar tarefa específica da organização
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const scope = await projectScopeWhere(user.id)
    const { id } = await params

    const task = await prisma.task.findFirst({
      where: {
        id,
        OR: [
          { goal: { project: scope } },
          { project: scope },
        ],
      },
      include: {
        responsible: true,
        goal: {
          include: { project: true }
        }
      }
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 })
  }
}

// PUT /api/tasks/[id] - Atualizar tarefa da organização
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const scope = await projectScopeWhere(user.id)
    const { id } = await params

    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        OR: [
          { goal: { project: scope } },
          { project: scope },
        ],
      }
    })

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const body = await request.json()
    const { title, description, status, dueDate, responsibleId } = body

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(responsibleId && { responsibleId }),
      },
      include: {
        responsible: true,
        goal: true
      }
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}

// DELETE /api/tasks/[id] - Deletar tarefa da organização
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const scope = await projectScopeWhere(user.id)
    const { id } = await params

    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        OR: [
          { goal: { project: scope } },
          { project: scope },
        ],
      }
    })

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    await prisma.task.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}

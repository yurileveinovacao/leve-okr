import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { projectScopeWhere } from '@/lib/auth-scope'

export const dynamic = 'force-dynamic'

// GET /api/projects/[id] - Get a specific project in the org
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const scope = await projectScopeWhere(user.id)
    const { id } = await params

    const project = await prisma.project.findFirst({
      where: {
        id,
        ...scope,
      },
      include: {
        goals: {
          include: {
            tasks: true,
            checkins: {
              orderBy: { createdAt: 'desc' },
              take: 5,
            },
            responsible: true,
          },
        },
        documents: {
          include: {
            uploadedBy: true,
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Calculate progress
    const totalGoals = project.goals.length
    let progress = 0
    if (totalGoals > 0) {
      const totalProgress = project.goals.reduce((sum, goal) => {
        const goalProgress = goal.targetValue > 0
          ? (goal.currentValue / goal.targetValue) * 100
          : 0
        return sum + Math.min(goalProgress, 100)
      }, 0)
      progress = Math.round(totalProgress / totalGoals)
    }

    return NextResponse.json({ ...project, progress })
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}

// PUT /api/projects/[id] - Update a project in the org
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const scope = await projectScopeWhere(user.id)
    const { id } = await params
    const body = await request.json()

    const { name, description, color, imageUrl } = body

    const existingProject = await prisma.project.findFirst({
      where: {
        id,
        ...scope,
      },
    })

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(color && { color }),
        ...(imageUrl !== undefined && { imageUrl }),
      },
      include: {
        goals: true,
        _count: {
          select: {
            goals: true,
            documents: true,
          },
        },
      },
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    )
  }
}

// DELETE /api/projects/[id] - Delete a project in the org
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const scope = await projectScopeWhere(user.id)
    const { id } = await params

    const existingProject = await prisma.project.findFirst({
      where: {
        id,
        ...scope,
      },
    })

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    await prisma.project.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}

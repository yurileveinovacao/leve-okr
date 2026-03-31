import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/projects - List all projects for the current user
export async function GET() {
  try {
    const user = await requireAuth()

    const projects = await prisma.project.findMany({
      where: {
        userId: user.id,
      },
      include: {
        goals: {
          include: {
            tasks: true,
            checkins: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
        _count: {
          select: {
            goals: true,
            documents: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Calculate progress for each project
    const projectsWithProgress = projects.map((project) => {
      const totalGoals = project.goals.length
      if (totalGoals === 0) {
        return { ...project, progress: 0 }
      }

      const totalProgress = project.goals.reduce((sum, goal) => {
        const goalProgress = goal.targetValue > 0
          ? (goal.currentValue / goal.targetValue) * 100
          : 0
        return sum + Math.min(goalProgress, 100)
      }, 0)

      return {
        ...project,
        progress: Math.round(totalProgress / totalGoals),
      }
    })

    return NextResponse.json(projectsWithProgress)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

// POST /api/projects - Create a new project
export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const { name, description, color } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      )
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        color: color || '#6366f1',
        userId: user.id,
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

    return NextResponse.json({ ...project, progress: 0 }, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}

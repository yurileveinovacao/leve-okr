import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function validateAgentKey(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return false
  const key = authHeader.slice(7)
  return key === process.env.AGENT_API_KEY
}

// GET /api/agent/projects - Listar projetos com tokens públicos
export async function GET(request: NextRequest) {
  if (!validateAgentKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const projects = await prisma.project.findMany({
      where: { publicToken: { not: null } },
      select: {
        id: true,
        name: true,
        publicToken: true,
        color: true,
        _count: { select: { tasks: true, goals: true } },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error fetching agent projects:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

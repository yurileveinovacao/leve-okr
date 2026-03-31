import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/checkins - Listar check-ins do usuário
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    const { searchParams } = new URL(request.url)
    const goalId = searchParams.get('goalId')

    // Filtrar apenas check-ins de metas que pertencem ao usuário
    const checkins = await prisma.checkin.findMany({
      where: {
        ...(goalId && { goalId }),
        goal: { project: { userId: user.id } }  // Filtrar por usuário
      },
      include: {
        goal: {
          select: {
            id: true,
            title: true,
            project: {
              select: {
                name: true,
                color: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(checkins)
  } catch (error) {
    console.error('Error fetching checkins:', error)
    return NextResponse.json({ error: 'Failed to fetch checkins' }, { status: 500 })
  }
}

// POST /api/checkins - Criar check-in (apenas para metas do usuário)
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    const body = await request.json()
    const { goalId, value, notes, weekNumber } = body

    if (!goalId) {
      return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 })
    }

    // Verificar se a meta pertence ao usuário
    const goal = await prisma.goal.findFirst({
      where: {
        id: goalId,
        project: { userId: user.id }
      }
    })

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }

    // Calcula o número da semana se não foi fornecido
    const week = weekNumber || getWeekNumber(new Date())

    // Cria o check-in
    const checkin = await prisma.checkin.create({
      data: {
        goalId,
        value,
        notes,
        weekNumber: week,
      },
      include: {
        goal: {
          select: {
            id: true,
            title: true,
            project: {
              select: {
                name: true,
                color: true
              }
            }
          }
        }
      }
    })

    // Atualiza o valor atual da meta
    await prisma.goal.update({
      where: { id: goalId },
      data: { currentValue: value }
    })

    return NextResponse.json(checkin, { status: 201 })
  } catch (error) {
    console.error('Error creating checkin:', error)
    return NextResponse.json({ error: 'Failed to create checkin' }, { status: 500 })
  }
}

function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}

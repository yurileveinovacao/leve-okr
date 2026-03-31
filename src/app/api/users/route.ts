import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/users - Listar usuários do time (apenas usuários convidados pelo atual ou o próprio)
export async function GET() {
  try {
    const currentUser = await requireAuth()

    // Retorna apenas:
    // 1. O próprio usuário
    // 2. Usuários convidados pelo usuário atual
    // 3. Usuários que convidaram o usuário atual (para ver o time do admin)
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { id: currentUser.id },  // O próprio usuário
          { invitedById: currentUser.id },  // Usuários que ele convidou
          { id: currentUser.invitedById || '' },  // Quem o convidou (se existir)
          // Também inclui outros membros do mesmo "time" (convidados pelo mesmo admin)
          ...(currentUser.invitedById ? [{ invitedById: currentUser.invitedById }] : [])
        ]
      },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
      }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

// POST /api/users - Convidar usuário para o time
export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireAuth()

    // Apenas admins podem convidar
    if (currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Apenas administradores podem convidar membros' }, { status: 403 })
    }

    const body = await request.json()
    const { email, name, phone, role } = body

    if (!email || !name) {
      return NextResponse.json({ error: 'Nome e email são obrigatórios' }, { status: 400 })
    }

    // Verifica se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Já existe um usuário com este email' }, { status: 400 })
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
        phone: phone || null,
        role: role || 'MEMBER',
        status: 'PENDING',
        invitedById: currentUser.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
      }
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Falha ao convidar membro' }, { status: 500 })
  }
}

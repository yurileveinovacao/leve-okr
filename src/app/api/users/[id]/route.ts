import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/users/[id] - Obter usuário por ID (apenas se for do mesmo time)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireAuth()
    const { id } = await params

    // Verificar se o usuário solicitado pertence ao mesmo time
    const user = await prisma.user.findFirst({
      where: {
        id,
        OR: [
          { id: currentUser.id },  // O próprio usuário
          { invitedById: currentUser.id },  // Usuários que ele convidou
          { id: currentUser.invitedById || '' },  // Quem o convidou
          ...(currentUser.invitedById ? [{ invitedById: currentUser.invitedById }] : [])
        ]
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

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Falha ao buscar usuário' }, { status: 500 })
  }
}

// PUT /api/users/[id] - Atualizar usuário (apenas do mesmo time)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireAuth()
    const { id } = await params

    // Verificar se o usuário pertence ao time do usuário atual
    const existingUser = await prisma.user.findFirst({
      where: {
        id,
        OR: [
          { id: currentUser.id },  // O próprio usuário
          { invitedById: currentUser.id },  // Usuários que ele convidou
        ]
      }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Apenas admins podem atualizar outros usuários
    if (currentUser.role !== 'ADMIN' && currentUser.id !== id) {
      return NextResponse.json({ error: 'Sem permissão para atualizar este usuário' }, { status: 403 })
    }

    const body = await request.json()
    const { name, phone, role, status } = body

    // Apenas admins podem mudar role e status
    const updateData: Record<string, unknown> = {}

    if (name) updateData.name = name
    if (phone !== undefined) updateData.phone = phone || null

    if (currentUser.role === 'ADMIN') {
      if (role) updateData.role = role
      if (status) updateData.status = status
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Falha ao atualizar usuário' }, { status: 500 })
  }
}

// DELETE /api/users/[id] - Desativar/remover usuário (apenas do mesmo time)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireAuth()
    const { id } = await params

    // Apenas admins podem remover usuários
    if (currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Apenas administradores podem remover membros' }, { status: 403 })
    }

    // Não pode remover a si mesmo
    if (currentUser.id === id) {
      return NextResponse.json({ error: 'Você não pode remover sua própria conta' }, { status: 400 })
    }

    // Verificar se o usuário foi convidado pelo admin atual
    const existingUser = await prisma.user.findFirst({
      where: {
        id,
        invitedById: currentUser.id  // Só pode remover usuários que convidou
      }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Em vez de deletar, apenas desativa o usuário
    await prisma.user.update({
      where: { id },
      data: { status: 'INACTIVE' }
    })

    return NextResponse.json({ success: true, message: 'Usuário desativado com sucesso' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Falha ao remover usuário' }, { status: 500 })
  }
}

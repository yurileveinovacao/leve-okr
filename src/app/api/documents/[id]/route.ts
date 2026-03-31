import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET /api/documents/[id] - Obter documento do usuário
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    // Buscar documento verificando ownership
    const document = await prisma.document.findFirst({
      where: {
        id,
        OR: [
          { project: { userId: user.id } },
          { goal: { project: { userId: user.id } } },
          { uploadedById: user.id }
        ]
      },
      include: {
        project: true,
        goal: true,
        uploadedBy: true,
      }
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    return NextResponse.json(document)
  } catch (error) {
    console.error('Error fetching document:', error)
    return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 })
  }
}

// DELETE /api/documents/[id] - Deletar documento do usuário
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    // Verificar se o documento pertence ao usuário
    const document = await prisma.document.findFirst({
      where: {
        id,
        OR: [
          { project: { userId: user.id } },
          { goal: { project: { userId: user.id } } },
          { uploadedById: user.id }
        ]
      }
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Extrair path do Supabase Storage da URL
    const url = new URL(document.fileUrl)
    const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/documents\/(.+)/)

    if (pathMatch) {
      const storagePath = pathMatch[1]
      await supabase.storage
        .from('documents')
        .remove([storagePath])
    }

    // Deletar do banco
    await prisma.document.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
  }
}

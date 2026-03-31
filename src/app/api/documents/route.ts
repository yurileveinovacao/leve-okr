import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET /api/documents - Listar documentos do usuário
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const goalId = searchParams.get('goalId')

    // Documentos que pertencem ao usuário (via projeto ou meta)
    const documents = await prisma.document.findMany({
      where: {
        ...(projectId && { projectId }),
        ...(goalId && { goalId }),
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
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(documents)
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
  }
}

// POST /api/documents - Upload de documento
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const projectId = formData.get('projectId') as string | null
    const goalId = formData.get('goalId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }

    // Verificar se o projeto ou meta pertence ao usuário
    if (projectId) {
      const project = await prisma.project.findFirst({
        where: { id: projectId, userId: user.id }
      })
      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 })
      }
    }

    if (goalId) {
      const goal = await prisma.goal.findFirst({
        where: { id: goalId, project: { userId: user.id } }
      })
      if (!goal) {
        return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
      }
    }

    // Upload para Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `documents/${user.id}/${fileName}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath)

    // Salvar no banco
    const document = await prisma.document.create({
      data: {
        title: title || file.name,
        fileUrl: publicUrl,
        fileType: fileExt || 'unknown',
        fileSize: file.size,
        projectId: projectId || null,
        goalId: goalId || null,
        uploadedById: user.id,
      },
      include: {
        project: true,
        goal: true,
        uploadedBy: true,
      }
    })

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    console.error('Error uploading document:', error)
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { projectScopeWhere } from '@/lib/auth-scope'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// POST /api/projects/[id]/image - Upload de imagem do projeto (escopo org)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const scope = await projectScopeWhere(user.id)
    const { id } = params

    const project = await prisma.project.findFirst({
      where: { id, ...scope }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Use JPG, PNG, GIF or WebP' }, { status: 400 })
    }

    // Validar tamanho (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 2MB' }, { status: 400 })
    }

    // Se já existe uma imagem, remover a anterior
    if (project.imageUrl) {
      try {
        const oldPath = project.imageUrl.split('/project-images/')[1]
        if (oldPath) {
          await supabase.storage.from('project-images').remove([oldPath])
        }
      } catch (err) {
        console.error('Error removing old image:', err)
      }
    }

    // Upload para Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${user.id}/${id}/${fileName}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabase.storage
      .from('project-images')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
    }

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('project-images')
      .getPublicUrl(filePath)

    // Atualizar projeto com a nova imageUrl
    const updatedProject = await prisma.project.update({
      where: { id },
      data: { imageUrl: publicUrl }
    })

    return NextResponse.json({ imageUrl: updatedProject.imageUrl }, { status: 200 })
  } catch (error) {
    console.error('Error uploading project image:', error)
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
  }
}

// DELETE /api/projects/[id]/image - Remover imagem do projeto (escopo org)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const scope = await projectScopeWhere(user.id)
    const { id } = params

    const project = await prisma.project.findFirst({
      where: { id, ...scope }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (project.imageUrl) {
      try {
        const oldPath = project.imageUrl.split('/project-images/')[1]
        if (oldPath) {
          await supabase.storage.from('project-images').remove([oldPath])
        }
      } catch (err) {
        console.error('Error removing image:', err)
      }
    }

    // Remover imageUrl do projeto
    await prisma.project.update({
      where: { id },
      data: { imageUrl: null }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing project image:', error)
    return NextResponse.json({ error: 'Failed to remove image' }, { status: 500 })
  }
}

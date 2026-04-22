import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

const LEVE_ORG_SLUG = 'leve-inovacao'
const OWNER_EMAIL = 'yuri@leveinovacao.com.br'

/**
 * Garante que o usuário é membro da organização da Leve.
 * Cria o OrganizationMember se não existir. Idempotente.
 */
async function ensureOrgMembership(userId: string, email: string) {
  const org = await prisma.organization.findUnique({
    where: { slug: LEVE_ORG_SLUG },
    select: { id: true },
  })

  // Se a org ainda não foi criada (primeiro deploy), não bloqueia o login —
  // apenas loga. O script setup-org-leve.mjs deve ter sido rodado.
  if (!org) {
    console.warn(
      `[auth] Organization "${LEVE_ORG_SLUG}" não existe. Rode: node --env-file=.env scripts/setup-org-leve.mjs`
    )
    return
  }

  const existing = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: org.id,
        userId,
      },
    },
    select: { id: true },
  })

  if (existing) return

  const isOwner = email.toLowerCase() === OWNER_EMAIL.toLowerCase()
  await prisma.organizationMember.create({
    data: {
      organizationId: org.id,
      userId,
      role: isOwner ? 'OWNER' : 'ADMIN',
    },
  })
}

export async function getCurrentUser() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  // Busca ou cria o usuário no banco Prisma
  let dbUser = await prisma.user.findUnique({
    where: { email: user.email! }
  })

  if (!dbUser) {
    // Cria o usuário se não existir
    dbUser = await prisma.user.create({
      data: {
        email: user.email!,
        name: user.user_metadata?.full_name || user.email!.split('@')[0],
        role: 'ADMIN', // Primeiro usuário é admin
        status: 'ACTIVE', // Usuário que criou conta está ativo
      }
    })
  } else if (dbUser.status === 'PENDING') {
    // Se o usuário foi convidado e está fazendo login, ativa ele
    dbUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        status: 'ACTIVE',
        // Atualiza o nome se vier do Google (caso diferente do cadastrado)
        name: user.user_metadata?.full_name || dbUser.name,
      }
    })
  }

  // Garante que o user é membro da org Leve (idempotente)
  await ensureOrgMembership(dbUser.id, dbUser.email)

  return {
    ...dbUser,
    supabaseUser: user
  }
}

export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  return user
}

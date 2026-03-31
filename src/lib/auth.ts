import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

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

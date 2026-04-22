import { prisma } from '@/lib/prisma'

const LEVE_ORG_SLUG = 'leve-inovacao'

/**
 * Retorna o organizationId do usuário atual.
 *
 * Hoje a Leve opera em uma única organização ("leve-inovacao"). Esse helper
 * centraliza a resolução do orgId para facilitar evoluir para multi-org no futuro
 * (ex: ler do header, da URL, ou do primeiro OrganizationMember do usuário).
 *
 * A resolução atual é: usar a única org da Leve. Se o user não for membro,
 * ainda assim retornamos o id da org (queries não encontrarão nada, o que
 * é o comportamento seguro).
 */
export async function getCurrentOrgId(_userId: string): Promise<string> {
  const org = await prisma.organization.findUnique({
    where: { slug: LEVE_ORG_SLUG },
    select: { id: true },
  })

  if (!org) {
    throw new Error(
      `Organization "${LEVE_ORG_SLUG}" não encontrada. Rode: node scripts/setup-org-leve.mjs`
    )
  }

  return org.id
}

/**
 * Verifica se o usuário é membro da organização atual.
 * Útil para rotas que precisam validar acesso antes de operações de escrita.
 */
export async function isOrgMember(userId: string): Promise<boolean> {
  const orgId = await getCurrentOrgId(userId)
  const member = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: orgId,
        userId,
      },
    },
    select: { id: true },
  })
  return !!member
}

/**
 * Retorna o `where` filter para buscar Projects do escopo do usuário.
 *
 * Uso:
 *   const where = await projectScopeWhere(user.id)
 *   const projects = await prisma.project.findMany({ where })
 *
 *   // Para filtrar através de relation (ex: Goal -> Project):
 *   prisma.goal.findMany({ where: { project: await projectScopeWhere(user.id) } })
 */
export async function projectScopeWhere(userId: string) {
  const orgId = await getCurrentOrgId(userId)
  return { organizationId: orgId }
}

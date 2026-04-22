/**
 * Seed/migração: cria a organização "Leve Inovação" e vincula usuários e projetos existentes.
 *
 * Idempotente — seguro para rodar múltiplas vezes.
 *
 * O que faz:
 *   1. Garante a existência de Organization { slug: 'leve-inovacao' }
 *   2. Para cada User no banco, cria OrganizationMember (role OWNER se email = yuri@leveinovacao.com.br, ADMIN caso contrário)
 *   3. Para cada Project com organizationId = null, atribui a org da Leve
 *
 * Uso:
 *   node --env-file=.env scripts/setup-org-leve.mjs
 *   (ou exporte DATABASE_URL manualmente antes)
 *
 * Requer Node 20+ para suportar --env-file.
 */

import { PrismaClient } from '@prisma/client'

const LEVE_ORG_SLUG = 'leve-inovacao'
const LEVE_ORG_NAME = 'Leve Inovação'
const OWNER_EMAIL = 'yuri@leveinovacao.com.br'

const prisma = new PrismaClient()

async function main() {
  console.log('=== Setup da Organização Leve Inovação ===\n')

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL não configurado no ambiente.')
    process.exit(1)
  }

  // 1. Garantir a organização
  let org = await prisma.organization.findUnique({
    where: { slug: LEVE_ORG_SLUG },
  })

  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: LEVE_ORG_NAME,
        slug: LEVE_ORG_SLUG,
      },
    })
    console.log(`✅ Organization criada: ${org.name} (id: ${org.id})`)
  } else {
    console.log(`ℹ️  Organization já existe: ${org.name} (id: ${org.id})`)
  }

  // 2. Vincular todos os users existentes como membros
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true },
  })

  console.log(`\n📋 ${users.length} usuários encontrados. Verificando memberships...`)

  let membersCreated = 0
  let membersSkipped = 0

  for (const user of users) {
    const isOwner = user.email.toLowerCase() === OWNER_EMAIL.toLowerCase()
    const role = isOwner ? 'OWNER' : 'ADMIN'

    const existing = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: org.id,
          userId: user.id,
        },
      },
    })

    if (existing) {
      membersSkipped++
      console.log(`  ↳ ${user.email} já é membro (${existing.role})`)
      continue
    }

    await prisma.organizationMember.create({
      data: {
        organizationId: org.id,
        userId: user.id,
        role,
      },
    })
    membersCreated++
    console.log(`  ✅ ${user.email} adicionado como ${role}`)
  }

  // 3. Atribuir orgId aos Projects existentes
  const projectsWithoutOrg = await prisma.project.findMany({
    where: { organizationId: null },
    select: { id: true, name: true },
  })

  console.log(`\n📦 ${projectsWithoutOrg.length} projetos sem organizationId.`)

  let projectsUpdated = 0
  for (const project of projectsWithoutOrg) {
    await prisma.project.update({
      where: { id: project.id },
      data: { organizationId: org.id },
    })
    projectsUpdated++
    console.log(`  ✅ ${project.name} → org ${org.slug}`)
  }

  // Resumo final
  console.log('\n=== Resumo ===')
  console.log(`Organização:        ${org.name} (${org.slug})`)
  console.log(`Membros criados:    ${membersCreated}`)
  console.log(`Membros já existentes: ${membersSkipped}`)
  console.log(`Projetos migrados:  ${projectsUpdated}`)

  // Contagem final para validação
  const totalMembers = await prisma.organizationMember.count({
    where: { organizationId: org.id },
  })
  const totalProjects = await prisma.project.count({
    where: { organizationId: org.id },
  })

  console.log(`\nEstado final:`)
  console.log(`  • ${totalMembers} membros na org`)
  console.log(`  • ${totalProjects} projetos na org`)

  console.log('\n✅ Setup concluído.')
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

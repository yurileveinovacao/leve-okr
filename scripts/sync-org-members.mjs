/**
 * Sincroniza os membros da organização "Leve Inovação" com a lista canônica
 * de emails da equipe. Adiciona faltantes, remove membros que não estão na lista.
 *
 * Idempotente. Rode sempre que alterar LEVE_TEAM_EMAILS.
 *
 * Uso:
 *   node --env-file=.env scripts/sync-org-members.mjs
 */

import { PrismaClient } from '@prisma/client'

const LEVE_ORG_SLUG = 'leve-inovacao'
const OWNER_EMAIL = 'yuri@leveinovacao.com.br'

// Fonte da verdade: apenas estes emails são membros da organização Leve.
// Qualquer OrganizationMember fora desta lista será REMOVIDO.
const LEVE_TEAM_EMAILS = [
  'yuri@leveinovacao.com.br',
  'rafael@leveinovacao.com.br',
  'guilherme@leveinovacao.com.br',
  'joaopedro@leveinovacao.com.br',
]

const prisma = new PrismaClient()

async function main() {
  console.log('=== Sync Membros Leve Inovação ===\n')

  const org = await prisma.organization.findUnique({
    where: { slug: LEVE_ORG_SLUG },
    select: { id: true, name: true },
  })

  if (!org) {
    console.error(`❌ Organization "${LEVE_ORG_SLUG}" não existe.`)
    console.error('   Rode primeiro: node --env-file=.env scripts/setup-org-leve.mjs')
    process.exit(1)
  }

  console.log(`Organização: ${org.name} (${org.id})\n`)

  // 1. Buscar membros atuais
  const currentMembers = await prisma.organizationMember.findMany({
    where: { organizationId: org.id },
    include: {
      user: { select: { id: true, email: true, name: true } },
    },
  })

  console.log(`Membros atuais: ${currentMembers.length}`)

  // 2. Identificar quem está fora da allowlist
  const allowSet = new Set(LEVE_TEAM_EMAILS.map((e) => e.toLowerCase()))
  const toRemove = currentMembers.filter(
    (m) => !allowSet.has(m.user.email.toLowerCase())
  )

  if (toRemove.length > 0) {
    console.log(`\n🗑️  Removendo ${toRemove.length} membros externos:`)
    for (const m of toRemove) {
      await prisma.organizationMember.delete({ where: { id: m.id } })
      console.log(`  ❌ ${m.user.email} (${m.role}) removido`)
    }
  } else {
    console.log('\n✅ Nenhum membro externo para remover.')
  }

  // 3. Garantir que todos os emails da allowlist tenham user + membership
  console.log('\n📋 Verificando allowlist:')
  let added = 0
  let skipped = 0

  for (const email of LEVE_TEAM_EMAILS) {
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      console.log(`  ⏭️  ${email} — User ainda não existe (entra no próximo login)`)
      continue
    }

    const existing = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: { organizationId: org.id, userId: user.id },
      },
    })

    if (existing) {
      skipped++
      console.log(`  ↳ ${email} já é membro (${existing.role})`)
      continue
    }

    const role = email.toLowerCase() === OWNER_EMAIL.toLowerCase() ? 'OWNER' : 'ADMIN'
    await prisma.organizationMember.create({
      data: { organizationId: org.id, userId: user.id, role },
    })
    added++
    console.log(`  ✅ ${email} adicionado como ${role}`)
  }

  // Estado final
  const finalCount = await prisma.organizationMember.count({
    where: { organizationId: org.id },
  })

  console.log('\n=== Resumo ===')
  console.log(`Removidos:  ${toRemove.length}`)
  console.log(`Adicionados: ${added}`)
  console.log(`Já existentes: ${skipped}`)
  console.log(`Total de membros na org: ${finalCount}`)
  console.log('\n✅ Sync concluído.')
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

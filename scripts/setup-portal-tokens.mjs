/**
 * Script para configurar publicToken nos projetos existentes.
 *
 * Busca projetos pelo nome e atribui o token correspondente.
 * Se o projeto não existir, cria um novo.
 *
 * Uso:
 *   node scripts/setup-portal-tokens.mjs
 *
 * Pré-requisitos:
 *   1. OKR rodando (local ou produção)
 *   2. AGENT_API_KEY configurada
 */

const OKR_BASE_URL = process.env.OKR_URL || 'http://localhost:3000'
const AGENT_API_KEY = process.env.AGENT_API_KEY || 'da613a54bd1ecab4cfce5ebdd15d065d3b63ea2ff734194d9df5ac97d0b65783'

const PROJECTS = [
  { token: 'smo-2026', name: 'Santa Maria Outlet', color: '#F0B503' },
  { token: 'sol-2026', name: 'SOL Engrenagens', color: '#20C4A6' },
  { token: 'ew-2026', name: 'EW Incorporadora', color: '#3B82F6' },
  { token: 'precifica-2026', name: 'Precifica Simples', color: '#F59E0B' },
  { token: 'compras-2026', name: 'Compras White Label', color: '#A78BFA' },
  { token: 'gestou-2026', name: 'Gestou', color: '#10B981' },
  { token: 'podpratas-2026', name: 'POD Pratas925', color: '#F0997B' },
]

async function main() {
  console.log('=== Configuração de Portal Tokens ===\n')

  // Verifica projetos existentes
  const res = await fetch(`${OKR_BASE_URL}/api/agent/projects`, {
    headers: { 'Authorization': `Bearer ${AGENT_API_KEY}` },
  })

  if (!res.ok) {
    console.error('❌ Erro ao buscar projetos. Verifique se o OKR está rodando e a API key está correta.')
    process.exit(1)
  }

  const existingProjects = await res.json()
  console.log(`Projetos existentes com token: ${existingProjects.length}\n`)

  for (const p of existingProjects) {
    console.log(`  ✅ ${p.name} → ${p.publicToken}`)
  }

  const existingTokens = new Set(existingProjects.map(p => p.publicToken))
  const missing = PROJECTS.filter(p => !existingTokens.has(p.token))

  if (missing.length === 0) {
    console.log('\n✅ Todos os tokens já estão configurados!')
    return
  }

  console.log(`\n⚠️  ${missing.length} projetos precisam de token:`)
  missing.forEach(p => console.log(`  - ${p.name} (${p.token})`))

  console.log('\n📝 Para configurar os tokens faltantes, execute no Prisma Studio ou diretamente no banco:')
  console.log('   npx prisma studio\n')

  missing.forEach(p => {
    console.log(`   UPDATE "Project" SET "publicToken" = '${p.token}' WHERE "name" ILIKE '%${p.name.split(' ')[0]}%';`)
  })

  console.log('\n   Ou crie novos projetos com esses tokens via interface da OKR.')
}

main().catch(console.error)

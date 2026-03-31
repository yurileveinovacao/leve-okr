/**
 * Script de migração: Google Sheets → Plataforma OKR
 *
 * Lê as tarefas de cada aba do Google Sheet e insere na plataforma OKR via API agent.
 *
 * Uso:
 *   node scripts/migrate-sheets-to-okr.mjs
 *
 * Pré-requisitos:
 *   1. OKR rodando (local ou produção)
 *   2. AGENT_API_KEY configurada
 *   3. Projetos criados na OKR com publicToken correspondente
 */

const OKR_BASE_URL = process.env.OKR_URL || 'http://localhost:3000'
const AGENT_API_KEY = process.env.AGENT_API_KEY || 'da613a54bd1ecab4cfce5ebdd15d065d3b63ea2ff734194d9df5ac97d0b65783'
const SHEET_ID = '1Bm0ck9rxEA9__RUMTe4D3-VWFyxl1Uwg5nQ2_BMJdFw'

const PROJECTS = [
  { token: 'smo-2026', sheet: 'SMO' },
  { token: 'sol-2026', sheet: 'SOL' },
  { token: 'ew-2026', sheet: 'EW' },
  { token: 'precifica-2026', sheet: 'PRECIFICA SIMPLES' },
  { token: 'compras-2026', sheet: 'COMPRAS WHITE LABEL' },
  { token: 'gestou-2026', sheet: 'GESTOU' },
  { token: 'podpratas-2026', sheet: 'PODPRATAS' },
]

async function fetchSheetData(sheetName) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`
  const res = await fetch(url)
  const text = await res.text()

  const match = text.match(/google\.visualization\.Query\.setResponse\((.+)\);?\s*$/s)
  if (!match) throw new Error(`Formato inválido para aba: ${sheetName}`)

  const json = JSON.parse(match[1])
  if (json.status === 'error') {
    throw new Error(json.errors?.[0]?.detailed_message || `Erro na aba ${sheetName}`)
  }

  const cols = json.table.cols.map(c => c.label.split(/\s+/)[0].toLowerCase().trim())
  const rows = json.table.rows.map(row => {
    const obj = {}
    row.c.forEach((cell, i) => {
      obj[cols[i]] = cell ? (cell.v ?? cell.f ?? '') : ''
    })
    return obj
  })

  return rows.filter(r => r.id || r.tarefa)
}

function mapStatus(status) {
  if (!status) return 'PENDING'
  const s = status.toLowerCase().trim()
  if (s.includes('conclu')) return 'COMPLETED'
  if (s.includes('andamento') || s.includes('progresso')) return 'IN_PROGRESS'
  return 'PENDING'
}

function parseDate(dateStr) {
  if (!dateStr || dateStr === 'a definir') return null
  // Tenta formato dd/mm/yyyy
  const parts = String(dateStr).match(/(\d{2})\/(\d{2})\/(\d{4})/)
  if (parts) return `${parts[3]}-${parts[2]}-${parts[1]}`
  // Tenta Date object do Google Sheets
  if (dateStr instanceof Date) return dateStr.toISOString().split('T')[0]
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0]
}

async function sendToOKR(projectToken, tasks) {
  const res = await fetch(`${OKR_BASE_URL}/api/agent/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AGENT_API_KEY}`,
    },
    body: JSON.stringify({
      projectToken,
      tasks: tasks.map(t => ({
        title: t.tarefa,
        responsibleName: t.responsavel || null,
        origin: t.origem || null,
        status: mapStatus(t.status),
        dueDate: parseDate(t.prazo),
      })),
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Erro ao enviar para OKR (${res.status}): ${body}`)
  }

  return res.json()
}

async function main() {
  console.log('=== Migração Google Sheets → OKR ===\n')

  for (const project of PROJECTS) {
    try {
      console.log(`📋 Lendo aba "${project.sheet}"...`)
      const tasks = await fetchSheetData(project.sheet)
      console.log(`   ${tasks.length} tarefas encontradas`)

      if (tasks.length === 0) {
        console.log('   ⏭️  Pulando (vazio)\n')
        continue
      }

      console.log(`   📤 Enviando para OKR (token: ${project.token})...`)
      const result = await sendToOKR(project.token, tasks)
      console.log(`   ✅ ${result.count} tarefas criadas\n`)
    } catch (err) {
      console.error(`   ❌ Erro em ${project.sheet}: ${err.message}\n`)
    }
  }

  console.log('=== Migração concluída ===')
}

main().catch(console.error)

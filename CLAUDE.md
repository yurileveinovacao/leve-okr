# Leve OKR

Plataforma de gestão de OKRs e acompanhamento de projetos da Leve Inovação Estratégica.

## Stack

- Next.js 14 (App Router, TypeScript)
- Prisma ORM + PostgreSQL (Supabase)
- Tailwind CSS + Radix UI
- Supabase Auth (Google OAuth)
- Deploy: Docker / Cloud Run

## Como rodar

```bash
npm install
npx prisma generate
npm run dev
```

## Portal de Clientes

O portal permite que clientes acompanhem tarefas sem login, via token na URL.

### Rotas públicas

- `/portal/[token]` — Visão do cliente (dark theme, design system Leve)
- `/api/portal/[token]` — API pública com dados do projeto

### Visão interna

- `/portal` — Painel consolidado (requer login, acessível via sidebar)

### API do Agente (meeting-notes)

Endpoints autenticados via `AGENT_API_KEY` para automações.

```
POST /api/agent/tasks — Criar tarefas em lote
GET  /api/agent/tasks?projectToken=smo-2026 — Listar tarefas
GET  /api/agent/projects — Listar projetos com tokens
```

Exemplo:
```bash
curl -X POST https://DOMINIO/api/agent/tasks \
  -H "Authorization: Bearer $AGENT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "projectToken": "smo-2026",
    "tasks": [{
      "title": "Tarefa exemplo",
      "responsibleName": "Yuri",
      "origin": "Reunião SMO - 31/03/2026",
      "status": "PENDING",
      "dueDate": "2026-04-07"
    }]
  }'
```

### Integração meeting-notes

Ao processar transcrições de reunião via skill `meeting-notes`, as tarefas extraídas devem ser enviadas para:

```
POST /api/agent/tasks
Authorization: Bearer {AGENT_API_KEY}
```

Com payload contendo `projectToken` e array de `tasks`.

### Tokens de projetos

| Token | Cliente |
|-------|---------|
| smo-2026 | Santa Maria Outlet |
| sol-2026 | SOL Engrenagens |
| ew-2026 | EW Incorporadora |
| precifica-2026 | Precifica Simples |
| compras-2026 | Compras White Label |
| gestou-2026 | Gestou |
| podpratas-2026 | POD Pratas925 |

### Scripts de migração

```bash
# Configurar tokens nos projetos
node scripts/setup-portal-tokens.mjs

# Importar tarefas do Google Sheets
node scripts/migrate-sheets-to-okr.mjs
```

## Design System (Portal)

```
Background: #041213 | Cards: #163436
Accent: #20C4A6 (teal)
Texto: #F1F5F9 | Secundário: #94A3B8
Fontes: Sora (títulos), DM Sans (corpo), DM Mono (código)
```

## Avatares de responsáveis

- Yuri (YG) = #20C4A6
- Rafael (RF) = #3B82F6
- João (JP) = #F59E0B
- Guilherme (GA) = #A78BFA

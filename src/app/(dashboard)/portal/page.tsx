'use client'

import { useEffect, useState, useMemo } from 'react'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'

interface Task {
  id: string
  title: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  dueDate: string | null
  origin: string | null
  responsibleName: string | null
  responsible: { name: string } | null
  project: { name: string; color: string; publicToken: string | null } | null
  createdAt: string
}

interface ProjectSummary {
  name: string
  color: string
  token: string | null
  total: number
  pending: number
  overdue: number
}

export default function InternalPortalPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filterProject, setFilterProject] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterResp, setFilterResp] = useState('all')

  useEffect(() => {
    fetch('/api/tasks')
      .then(r => r.json())
      .then(data => {
        setTasks(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const projects = useMemo(() => {
    const map = new Map<string, ProjectSummary>()
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    tasks.forEach(t => {
      const pName = t.project?.name || 'Sem projeto'
      if (!map.has(pName)) {
        map.set(pName, {
          name: pName,
          color: t.project?.color || '#6366f1',
          token: t.project?.publicToken || null,
          total: 0,
          pending: 0,
          overdue: 0,
        })
      }
      const p = map.get(pName)!
      p.total++
      if (t.status === 'PENDING') p.pending++
      if (t.status !== 'COMPLETED' && t.dueDate && new Date(t.dueDate) < now) p.overdue++
    })
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [tasks])

  const responsaveis = useMemo(() => {
    const set = new Set<string>()
    tasks.forEach(t => {
      const name = t.responsible?.name || t.responsibleName
      if (name) set.add(name)
    })
    return Array.from(set).sort()
  }, [tasks])

  const filteredTasks = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    return tasks.filter(t => {
      if (filterProject !== 'all' && t.project?.name !== filterProject) return false
      if (filterResp !== 'all') {
        const name = t.responsible?.name || t.responsibleName || ''
        if (name !== filterResp) return false
      }
      if (filterStatus !== 'all') {
        const isOverdue = t.status !== 'COMPLETED' && t.dueDate && new Date(t.dueDate) < now
        switch (filterStatus) {
          case 'PENDING': return t.status === 'PENDING'
          case 'IN_PROGRESS': return t.status === 'IN_PROGRESS'
          case 'COMPLETED': return t.status === 'COMPLETED'
          case 'OVERDUE': return !!isOverdue
          default: return true
        }
      }
      return true
    }).sort((a, b) => {
      const now = new Date()
      now.setHours(0, 0, 0, 0)
      const order = (t: Task) => {
        if (t.status !== 'COMPLETED' && t.dueDate && new Date(t.dueDate) < now) return 0
        if (t.status === 'PENDING') return 1
        if (t.status === 'IN_PROGRESS') return 2
        return 3
      }
      return order(a) - order(b)
    })
  }, [tasks, filterProject, filterStatus, filterResp])

  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const totalOverdue = tasks.filter(t =>
    t.status !== 'COMPLETED' && t.dueDate && new Date(t.dueDate) < now
  ).length

  const statusLabel: Record<string, string> = {
    PENDING: 'Pendente',
    IN_PROGRESS: 'Em andamento',
    COMPLETED: 'Concluída',
  }

  const statusColor: Record<string, string> = {
    PENDING: 'bg-yellow-500/15 text-yellow-500',
    IN_PROGRESS: 'bg-blue-500/15 text-blue-500',
    COMPLETED: 'bg-green-500/15 text-green-500',
  }

  return (
    <>
      <DashboardHeader title="Portal de Projetos" subtitle="Visão consolidada de todos os projetos de clientes" />

      <div className="p-6 space-y-6">
        {loading ? (
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Métricas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card border rounded-xl p-4 text-center">
                <div className="text-3xl font-bold">{tasks.length}</div>
                <div className="text-sm text-muted-foreground">Total de tarefas</div>
              </div>
              <div className="bg-card border rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-yellow-500">
                  {tasks.filter(t => t.status === 'PENDING').length}
                </div>
                <div className="text-sm text-muted-foreground">Pendentes</div>
              </div>
              <div className="bg-card border rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-red-500">{totalOverdue}</div>
                <div className="text-sm text-muted-foreground">Atrasadas</div>
              </div>
              <div className="bg-card border rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-green-500">
                  {tasks.filter(t => t.status === 'COMPLETED').length}
                </div>
                <div className="text-sm text-muted-foreground">Concluídas</div>
              </div>
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-4">
              <select
                value={filterProject}
                onChange={e => setFilterProject(e.target.value)}
                className="bg-card border rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">Todos os projetos</option>
                {projects.map(p => (
                  <option key={p.name} value={p.name}>{p.name}</option>
                ))}
              </select>

              <select
                value={filterResp}
                onChange={e => setFilterResp(e.target.value)}
                className="bg-card border rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">Todos os responsáveis</option>
                {responsaveis.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="bg-card border rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">Todos os status</option>
                <option value="PENDING">Pendente</option>
                <option value="IN_PROGRESS">Em andamento</option>
                <option value="OVERDUE">Atrasada</option>
                <option value="COMPLETED">Concluída</option>
              </select>
            </div>

            {/* Projects grid */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Projetos ({projects.length})</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {projects.map(p => (
                  <div
                    key={p.name}
                    className="bg-card border rounded-xl p-4 cursor-pointer hover:shadow-lg transition-shadow"
                    style={{ borderTopColor: p.color, borderTopWidth: 3 }}
                    onClick={() => setFilterProject(filterProject === p.name ? 'all' : p.name)}
                  >
                    <div className="w-2.5 h-2.5 rounded-full mb-2" style={{ backgroundColor: p.color }} />
                    <h4 className="font-semibold text-sm mb-2">{p.name}</h4>
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <div>{p.total} tarefas</div>
                      <div className="text-yellow-500">{p.pending} pendentes</div>
                      {p.overdue > 0 && <div className="text-red-500 font-semibold">{p.overdue} atrasadas</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Task list */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Tarefas ({filteredTasks.length})</h2>
              <div className="space-y-2">
                {filteredTasks.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">Nenhuma tarefa encontrada.</p>
                )}
                {filteredTasks.map(t => {
                  const isOverdue = t.status !== 'COMPLETED' && t.dueDate && new Date(t.dueDate) < now
                  const resp = t.responsible?.name || t.responsibleName || 'Não atribuído'

                  return (
                    <div
                      key={t.id}
                      className={`bg-card border rounded-lg p-4 ${isOverdue ? 'border-l-2 border-l-red-500' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm">{t.title}</h3>
                          {t.origin && (
                            <p className="text-xs text-muted-foreground font-mono mt-0.5">{t.origin}</p>
                          )}
                        </div>
                        <span className={`text-xs font-semibold font-mono px-2 py-0.5 rounded ${
                          isOverdue ? 'bg-red-500/15 text-red-500' : statusColor[t.status] || ''
                        }`}>
                          {isOverdue ? 'Atrasada' : statusLabel[t.status] || t.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span>{resp}</span>
                          {t.project && (
                            <span className="bg-muted px-1.5 py-0.5 rounded font-mono">
                              {t.project.name}
                            </span>
                          )}
                        </div>
                        {t.dueDate && (
                          <span className={isOverdue ? 'text-red-500 font-semibold' : ''}>
                            {new Date(t.dueDate).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import PortalHeader from '@/components/portal/PortalHeader'
import PortalMetrics from '@/components/portal/PortalMetrics'
import PortalTaskFilters from '@/components/portal/PortalTaskFilters'
import PortalTaskCard from '@/components/portal/PortalTaskCard'
import PortalFooter from '@/components/portal/PortalFooter'
import '@/components/portal/portal.css'

interface Task {
  id: string
  title: string
  description: string | null
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  dueDate: string | null
  origin: string | null
  responsavel: string
  createdAt: string
}

interface PortalData {
  project: { name: string; color: string }
  tasks: Task[]
  metrics: {
    total: number
    pending: number
    inProgress: number
    completed: number
    overdue: number
    progress: number
  }
}

export default function PortalPage() {
  const params = useParams()
  const token = params.token as string
  const [data, setData] = useState<PortalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('all')

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/portal/${token}`)
      if (res.status === 404) {
        setError('Projeto não encontrado. Verifique o token de acesso.')
        return
      }
      if (!res.ok) throw new Error('Erro ao carregar dados')
      const json = await res.json()
      setData(json)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [token])

  const filteredTasks = data?.tasks.filter(t => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const isOverdue = t.status !== 'COMPLETED' && t.dueDate && new Date(t.dueDate) < now

    switch (filter) {
      case 'pending': return t.status === 'PENDING'
      case 'in_progress': return t.status === 'IN_PROGRESS'
      case 'overdue': return isOverdue
      case 'completed': return t.status === 'COMPLETED'
      default: return true
    }
  }) || []

  if (loading) {
    return (
      <div className="portal-page">
        <PortalHeader />
        <div className="portal-content">
          <div className="portal-skeleton-grid">
            {[1, 2, 3, 4].map(i => <div key={i} className="portal-skeleton" />)}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="portal-page">
        <PortalHeader />
        <div className="portal-content">
          <div className="portal-error">
            <img src="/logo-leve.png" alt="Leve" className="portal-error-logo" />
            <h1>Token inválido</h1>
            <p>{error}</p>
            <button onClick={fetchData} className="portal-btn">Tentar novamente</button>
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  const filterOptions = [
    { label: 'Todas', value: 'all', count: data.metrics.total },
    { label: 'Pendentes', value: 'pending', count: data.metrics.pending },
    { label: 'Em andamento', value: 'in_progress', count: data.metrics.inProgress },
    { label: 'Atrasadas', value: 'overdue', count: data.metrics.overdue },
    { label: 'Concluídas', value: 'completed', count: data.metrics.completed },
  ]

  return (
    <div className="portal-page">
      <PortalHeader projectName={data.project.name} />

      <div className="portal-content">
        <section className="portal-hero">
          <h1>{data.project.name}</h1>
          <p>Acompanhamento de tarefas e entregas do projeto</p>
        </section>

        <PortalMetrics metrics={data.metrics} />

        <section className="portal-tasks-section">
          <PortalTaskFilters
            filters={filterOptions}
            active={filter}
            onFilter={setFilter}
          />
          <div className="portal-tasks-list">
            {filteredTasks.length === 0 && (
              <p className="portal-empty">Nenhuma tarefa encontrada para este filtro.</p>
            )}
            {filteredTasks.map(task => (
              <PortalTaskCard key={task.id} task={task} />
            ))}
          </div>
        </section>
      </div>

      <PortalFooter />
    </div>
  )
}

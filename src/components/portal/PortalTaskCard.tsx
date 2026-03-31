'use client'

const RESPONSAVEL_COLORS: Record<string, { initials: string; color: string }> = {
  yuri: { initials: 'YG', color: '#20C4A6' },
  rafael: { initials: 'RF', color: '#3B82F6' },
  'joão': { initials: 'JP', color: '#F59E0B' },
  joao: { initials: 'JP', color: '#F59E0B' },
  guilherme: { initials: 'GA', color: '#A78BFA' },
}

function getResponsavel(name: string) {
  const key = name.trim().toLowerCase().split(' ')[0]
  return RESPONSAVEL_COLORS[key] || {
    initials: name.trim().substring(0, 2).toUpperCase(),
    color: '#888780',
  }
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

interface Task {
  id: string
  title: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  dueDate: string | null
  origin: string | null
  responsavel: string
}

export default function PortalTaskCard({ task }: { task: Task }) {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const isOverdue = task.status !== 'COMPLETED' && task.dueDate && new Date(task.dueDate) < now
  const resp = getResponsavel(task.responsavel)

  const statusMap: Record<string, { label: string; className: string }> = {
    PENDING: { label: 'Pendente', className: 'portal-status-pending' },
    IN_PROGRESS: { label: 'Em andamento', className: 'portal-status-progress' },
    COMPLETED: { label: 'Concluída', className: 'portal-status-done' },
  }
  const displayStatus = isOverdue
    ? { label: 'Atrasada', className: 'portal-status-overdue' }
    : statusMap[task.status] || statusMap.PENDING

  return (
    <div className={`portal-task-card ${isOverdue ? 'portal-task-overdue' : ''}`}>
      <div className="portal-task-header">
        <h3 className="portal-task-title">{task.title}</h3>
        <span className={`portal-status-badge ${displayStatus.className}`}>
          {displayStatus.label}
        </span>
      </div>

      {task.origin && (
        <p className="portal-task-origin">{task.origin}</p>
      )}

      <div className="portal-task-footer">
        <div className="portal-task-meta">
          <div className="portal-avatar" style={{ backgroundColor: resp.color }}>
            {resp.initials}
          </div>
          <span className="portal-task-responsavel">{task.responsavel}</span>
        </div>
        <span className={`portal-task-prazo ${isOverdue ? 'portal-prazo-overdue' : ''}`}>
          {formatDate(task.dueDate)}
        </span>
      </div>
    </div>
  )
}

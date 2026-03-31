'use client'

interface Metrics {
  total: number
  pending: number
  inProgress: number
  completed: number
  overdue: number
  progress: number
}

function MetricCard({ label, value, variant }: { label: string; value: string | number; variant?: string }) {
  return (
    <div className={`portal-metric ${variant ? `portal-metric-${variant}` : ''}`}>
      <div className="portal-metric-value">{value}</div>
      <div className="portal-metric-label">{label}</div>
    </div>
  )
}

export default function PortalMetrics({ metrics }: { metrics: Metrics }) {
  const active = metrics.total - metrics.completed
  return (
    <div className="portal-metrics-grid">
      <MetricCard label="Tarefas ativas" value={active} />
      <MetricCard label="Concluídas" value={metrics.completed} variant="success" />
      <MetricCard label="Atrasadas" value={metrics.overdue} variant="danger" />
      <MetricCard label="Progresso geral" value={`${metrics.progress}%`} variant="info" />
    </div>
  )
}

'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ArrowLeft,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  TrendingUp,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

type Task = {
  id: string
  title: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  dueDate: string | null
  responsible?: { name: string } | null
}

type Checkin = {
  id: string
  value: number
  notes: string | null
  createdAt: string
}

type Goal = {
  id: string
  title: string
  description: string | null
  currentValue: number
  targetValue: number
  unit: string
  status: 'ON_TRACK' | 'AT_RISK' | 'BEHIND' | 'COMPLETED'
  dueDate: string | null
  responsible?: { name: string } | null
  project?: { name: string } | null
  tasks: Task[]
  checkins: Checkin[]
}

const statusIcons = {
  COMPLETED: CheckCircle2,
  IN_PROGRESS: Clock,
  PENDING: Circle,
}

const statusColors = {
  COMPLETED: 'text-green-500',
  IN_PROGRESS: 'text-yellow-500',
  PENDING: 'text-[var(--muted-foreground)]',
}

const statusBadges = {
  ON_TRACK: { label: 'No caminho', variant: 'success' as const },
  AT_RISK: { label: 'Em risco', variant: 'warning' as const },
  BEHIND: { label: 'Atrasado', variant: 'destructive' as const },
  COMPLETED: { label: 'Concluído', variant: 'default' as const },
}

export default function GoalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const goalId = params.id as string

  const [goal, setGoal] = useState<Goal | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Task modal state
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDueDate, setTaskDueDate] = useState('')
  const [savingTask, setSavingTask] = useState(false)

  // Checkin modal state
  const [showCheckinModal, setShowCheckinModal] = useState(false)
  const [checkinValue, setCheckinValue] = useState('')
  const [checkinNotes, setCheckinNotes] = useState('')
  const [savingCheckin, setSavingCheckin] = useState(false)

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    currentValue: 0,
    targetValue: 0,
    unit: '',
    status: 'ON_TRACK' as Goal['status'],
    dueDate: ''
  })
  const [savingEdit, setSavingEdit] = useState(false)

  useEffect(() => {
    fetchGoal()
  }, [goalId])

  const fetchGoal = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/goals/${goalId}`)
      if (!res.ok) {
        if (res.status === 404) {
          setError('Meta não encontrada')
        } else {
          setError('Erro ao carregar meta')
        }
        return
      }
      const data = await res.json()
      setGoal(data)
    } catch (err) {
      console.error('Error fetching goal:', err)
      setError('Erro ao carregar meta')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTask = async () => {
    if (!taskTitle.trim()) return

    setSavingTask(true)
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskTitle,
          goalId: goalId,
          dueDate: taskDueDate || null,
        })
      })

      if (res.ok) {
        setTaskTitle('')
        setTaskDueDate('')
        setShowTaskModal(false)
        fetchGoal() // Refresh data
      }
    } catch (err) {
      console.error('Error creating task:', err)
    } finally {
      setSavingTask(false)
    }
  }

  const handleCreateCheckin = async () => {
    if (!checkinValue) return

    setSavingCheckin(true)
    try {
      const res = await fetch('/api/checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalId: goalId,
          value: parseFloat(checkinValue),
          notes: checkinNotes || null,
        })
      })

      if (res.ok) {
        setCheckinValue('')
        setCheckinNotes('')
        setShowCheckinModal(false)
        fetchGoal() // Refresh data
      }
    } catch (err) {
      console.error('Error creating checkin:', err)
    } finally {
      setSavingCheckin(false)
    }
  }

  const openEditModal = () => {
    if (goal) {
      setEditForm({
        title: goal.title,
        description: goal.description || '',
        currentValue: goal.currentValue,
        targetValue: goal.targetValue,
        unit: goal.unit,
        status: goal.status,
        dueDate: goal.dueDate ? goal.dueDate.split('T')[0] : ''
      })
      setShowEditModal(true)
    }
  }

  const handleSaveEdit = async () => {
    if (!editForm.title.trim()) return

    setSavingEdit(true)
    try {
      const res = await fetch(`/api/goals/${goalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description || null,
          currentValue: editForm.currentValue,
          targetValue: editForm.targetValue,
          unit: editForm.unit,
          status: editForm.status,
          dueDate: editForm.dueDate || null,
        })
      })

      if (res.ok) {
        setShowEditModal(false)
        fetchGoal() // Refresh data
      }
    } catch (err) {
      console.error('Error updating goal:', err)
    } finally {
      setSavingEdit(false)
    }
  }

  const toggleTaskStatus = async (task: Task) => {
    const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'

    // Optimistic update - atualiza imediatamente
    setGoal(prev => prev ? {
      ...prev,
      tasks: prev.tasks.map(t =>
        t.id === task.id ? { ...t, status: newStatus } : t
      )
    } : null)

    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (!res.ok) {
        fetchGoal() // Rollback em caso de erro
      }
    } catch (err) {
      console.error('Error updating task:', err)
      fetchGoal() // Rollback em caso de erro
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <DashboardHeader title="Detalhes da Meta" />
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
        </div>
      </div>
    )
  }

  if (error || !goal) {
    return (
      <div className="min-h-screen">
        <DashboardHeader title="Detalhes da Meta" />
        <div className="p-6">
          <Link href="/goals" className="inline-flex items-center text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar para Metas
          </Link>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-[var(--muted-foreground)]">{error || 'Meta não encontrada'}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const percentage = Math.round((goal.currentValue / goal.targetValue) * 100)
  const statusBadge = statusBadges[goal.status] || statusBadges.ON_TRACK

  return (
    <div className="min-h-screen">
      <DashboardHeader title="Detalhes da Meta" />

      <div className="p-6 space-y-6">
        {/* Back button */}
        <Link href="/goals" className="inline-flex items-center text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar para Metas
        </Link>

        {/* Goal Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                  {goal.project && (
                    <Badge variant="outline">{goal.project.name}</Badge>
                  )}
                </div>
                <h2 className="text-2xl font-bold">{goal.title}</h2>
                {goal.description && (
                  <p className="text-[var(--muted-foreground)] mt-1">{goal.description}</p>
                )}
              </div>
              <Button variant="outline" onClick={openEditModal}>
                Editar
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3 mt-6">
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">Progresso</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-bold">
                    {goal.currentValue.toLocaleString('pt-BR')}
                  </span>
                  <span className="text-[var(--muted-foreground)]">
                    / {goal.targetValue.toLocaleString('pt-BR')} {goal.unit}
                  </span>
                </div>
                <Progress value={percentage} className="mt-2" />
                <p className="text-sm text-[var(--muted-foreground)] mt-1">{percentage}% concluído</p>
              </div>

              <div>
                <p className="text-sm text-[var(--muted-foreground)]">Responsável</p>
                <p className="text-lg font-medium mt-1">
                  {goal.responsible?.name || 'Não definido'}
                </p>
              </div>

              <div>
                <p className="text-sm text-[var(--muted-foreground)]">Prazo</p>
                <p className="text-lg font-medium mt-1">
                  {goal.dueDate
                    ? new Date(goal.dueDate).toLocaleDateString('pt-BR')
                    : 'Sem prazo definido'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Tasks */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Tarefas ({goal.tasks.length})</CardTitle>
              <Button size="sm" onClick={() => setShowTaskModal(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Nova Tarefa
              </Button>
            </CardHeader>
            <CardContent>
              {goal.tasks.length === 0 ? (
                <p className="text-center text-[var(--muted-foreground)] py-4">
                  Nenhuma tarefa criada
                </p>
              ) : (
                <div className="space-y-3">
                  {goal.tasks.map((task) => {
                    const Icon = statusIcons[task.status as keyof typeof statusIcons] || Circle
                    const colorClass = statusColors[task.status as keyof typeof statusColors] || statusColors.PENDING

                    return (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-[var(--accent)] transition-colors cursor-pointer"
                        onClick={() => toggleTaskStatus(task)}
                      >
                        <Icon className={`h-5 w-5 ${colorClass}`} />
                        <div className="flex-1">
                          <p className={task.status === 'COMPLETED' ? 'line-through text-[var(--muted-foreground)]' : ''}>
                            {task.title}
                          </p>
                          {task.dueDate && (
                            <p className="text-xs text-[var(--muted-foreground)]">
                              Vence em {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Checkins History */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Histórico de Check-ins ({goal.checkins.length})</CardTitle>
              <Button size="sm" onClick={() => setShowCheckinModal(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Novo Check-in
              </Button>
            </CardHeader>
            <CardContent>
              {goal.checkins.length === 0 ? (
                <p className="text-center text-[var(--muted-foreground)] py-4">
                  Nenhum check-in registrado
                </p>
              ) : (
                <div className="space-y-4">
                  {goal.checkins.map((checkin) => (
                    <div key={checkin.id} className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-white text-xs">
                        <TrendingUp className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">
                            {new Date(checkin.createdAt).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                          <span className="text-sm font-semibold">
                            {checkin.value.toLocaleString('pt-BR')} {goal.unit}
                          </span>
                        </div>
                        {checkin.notes && (
                          <p className="text-sm text-[var(--muted-foreground)]">{checkin.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Task Modal */}
      <Dialog open={showTaskModal} onOpenChange={setShowTaskModal}>
        <DialogContent className="p-6">
          <DialogHeader>
            <DialogTitle>Nova Tarefa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium">Título</label>
              <Input
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Ex: Contatar leads qualificados"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Data de vencimento</label>
              <Input
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowTaskModal(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleCreateTask} disabled={savingTask || !taskTitle.trim()} className="flex-1">
                {savingTask ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Criar Tarefa'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Checkin Modal */}
      <Dialog open={showCheckinModal} onOpenChange={setShowCheckinModal}>
        <DialogContent className="p-6">
          <DialogHeader>
            <DialogTitle>Novo Check-in</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium">Valor atual ({goal.unit})</label>
              <Input
                type="number"
                value={checkinValue}
                onChange={(e) => setCheckinValue(e.target.value)}
                placeholder={`Ex: ${goal.currentValue}`}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Notas (opcional)</label>
              <Textarea
                value={checkinNotes}
                onChange={(e) => setCheckinNotes(e.target.value)}
                placeholder="O que aconteceu nesta semana?"
                className="mt-1"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowCheckinModal(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleCreateCheckin} disabled={savingCheckin || !checkinValue} className="flex-1">
                {savingCheckin ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Registrar Check-in'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Goal Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="p-6 max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Meta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label className="text-sm font-medium">Título</label>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Aumentar receita mensal"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Descrição</label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva sua meta..."
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Valor atual</label>
                <Input
                  type="number"
                  value={editForm.currentValue}
                  onChange={(e) => setEditForm(prev => ({ ...prev, currentValue: parseFloat(e.target.value) || 0 }))}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Valor alvo</label>
                <Input
                  type="number"
                  value={editForm.targetValue}
                  onChange={(e) => setEditForm(prev => ({ ...prev, targetValue: parseFloat(e.target.value) || 0 }))}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Unidade</label>
                <Input
                  value={editForm.unit}
                  onChange={(e) => setEditForm(prev => ({ ...prev, unit: e.target.value }))}
                  placeholder="Ex: R$, %, unidades"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value as Goal['status'] }))}
                  className="mt-1 w-full h-9 rounded-md border border-[var(--input)] bg-transparent px-3 py-1 text-sm"
                >
                  <option value="ON_TRACK">No caminho</option>
                  <option value="AT_RISK">Em risco</option>
                  <option value="BEHIND">Atrasado</option>
                  <option value="COMPLETED">Concluído</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Prazo</label>
              <Input
                type="date"
                value={editForm.dueDate}
                onChange={(e) => setEditForm(prev => ({ ...prev, dueDate: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowEditModal(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleSaveEdit} disabled={savingEdit || !editForm.title.trim()} className="flex-1">
                {savingEdit ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Alterações'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

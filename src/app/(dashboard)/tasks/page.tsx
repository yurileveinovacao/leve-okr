'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Plus, CheckCircle2, Circle, Clock, Loader2, CheckSquare, GripVertical, MoreVertical, Edit, Trash2, Target } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type Task = {
  id: string
  title: string
  description?: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  dueDate?: string
  goal?: { id: string; title: string; project?: { name: string; color: string } }
  responsible?: { id: string; name: string }
  goalId?: string
  responsibleId?: string
}

type Goal = {
  id: string
  title: string
  project?: {
    name: string
    color: string
  }
}

type User = {
  id: string
  name: string
  email: string
}

const statusConfig = {
  COMPLETED: { label: 'Concluída', icon: CheckCircle2, variant: 'success' as const, color: 'text-green-500' },
  IN_PROGRESS: { label: 'Em progresso', icon: Clock, variant: 'warning' as const, color: 'text-yellow-500' },
  PENDING: { label: 'Pendente', icon: Circle, variant: 'secondary' as const, color: 'text-[var(--muted-foreground)]' },
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [filterGoalId, setFilterGoalId] = useState<string | null>(null)
  const [filterResponsibleId, setFilterResponsibleId] = useState<string | null>(null)
  const [filterSearch, setFilterSearch] = useState('')
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Form states
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [goalId, setGoalId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [responsibleId, setResponsibleId] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const fetchData = async () => {
    try {
      const [tasksRes, goalsRes, usersRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/goals'),
        fetch('/api/users')
      ])

      const tasksData = await tasksRes.json()
      const goalsData = await goalsRes.json()
      const usersData = await usersRes.json()

      setTasks(Array.isArray(tasksData) ? tasksData : [])
      setGoals(Array.isArray(goalsData) ? goalsData : [])
      setUsers(Array.isArray(usersData) ? usersData : [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Limpar busca ao fechar filtro
  useEffect(() => {
    if (!isFilterOpen) {
      setFilterSearch('')
    }
  }, [isFilterOpen])

  // Filtrar metas para o dropdown
  const filteredGoals = goals.filter(goal =>
    goal.title.toLowerCase().includes(filterSearch.toLowerCase()) ||
    goal.project?.name.toLowerCase().includes(filterSearch.toLowerCase())
  )

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          goalId: goalId || undefined,
          dueDate: dueDate || undefined,
          responsibleId: responsibleId || undefined,
          status: 'PENDING',
        }),
      })

      if (res.ok) {
        const newTask = await res.json()
        setTasks([newTask, ...tasks])
        setIsModalOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error('Error creating task:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setGoalId('')
    setDueDate('')
    setResponsibleId('')
    setEditingTask(null)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setTitle(task.title)
    setDescription(task.description || '')
    setGoalId(task.goalId || '')
    setDueDate(task.dueDate?.split('T')[0] || '')
    setResponsibleId(task.responsibleId || '')
    setIsEditModalOpen(true)
  }

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTask) return

    setIsSaving(true)
    try {
      const res = await fetch(`/api/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          goalId: goalId || undefined,
          dueDate: dueDate || undefined,
          responsibleId: responsibleId || undefined
        })
      })
      if (res.ok) {
        const updated = await res.json()
        setTasks(tasks.map(t => t.id === updated.id ? updated : t))
        setIsEditModalOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error('Error updating task:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return

    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
      if (res.ok) {
        setTasks(tasks.filter(t => t.id !== taskId))
      }
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const handleUpdateStatus = async (taskId: string, newStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED') => {
    // Optimistic update
    setTasks(tasks.map(t =>
      t.id === taskId ? { ...t, status: newStatus } : t
    ))

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        // Revert on error
        fetchData()
      }
    } catch (error) {
      console.error('Error updating task:', error)
      fetchData()
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id)
    setActiveTask(task || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null)

    const { active, over } = event
    if (!over) return

    const taskId = active.id as string
    const overId = over.id as string

    // Se dropou diretamente na coluna
    if (['PENDING', 'IN_PROGRESS', 'COMPLETED'].includes(overId)) {
      const newStatus = overId as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
      const task = tasks.find(t => t.id === taskId)
      if (task && task.status !== newStatus) {
        handleUpdateStatus(taskId, newStatus)
      }
      return
    }

    // Se dropou sobre outro card, descobrir a coluna do card de destino
    const overTask = tasks.find(t => t.id === overId)
    if (overTask) {
      const newStatus = overTask.status
      const task = tasks.find(t => t.id === taskId)
      if (task && task.status !== newStatus) {
        handleUpdateStatus(taskId, newStatus)
      }
    }
  }

  // Apply filter (meta + responsável)
  const filteredTasks = tasks.filter(t =>
    (!filterGoalId || t.goalId === filterGoalId || t.goal?.id === filterGoalId) &&
    (!filterResponsibleId || t.responsibleId === filterResponsibleId)
  )

  const pendingTasks = filteredTasks.filter(t => t.status === 'PENDING')
  const inProgressTasks = filteredTasks.filter(t => t.status === 'IN_PROGRESS')
  const completedTasks = filteredTasks.filter(t => t.status === 'COMPLETED')

  const filterGoal = filterGoalId ? goals.find(g => g.id === filterGoalId) : null

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <DashboardHeader title="Tarefas" subtitle="Gerencie todas as suas tarefas" />
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader title="Tarefas" subtitle="Gerencie todas as suas tarefas" />

      <div className="p-6">
        {/* Goals icons with horizontal scroll */}
        <div className="mb-6">
          <div className="overflow-x-auto pb-2 -mx-6 px-6">
            <div className="flex gap-3 min-w-max">
              {/* Botão "Todas" */}
              <button
                onClick={() => setFilterGoalId(null)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all min-w-[80px] ${
                  !filterGoalId
                    ? 'bg-[var(--accent)] ring-2 ring-[var(--primary)]'
                    : 'hover:bg-[var(--accent)]'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-[var(--muted)] flex items-center justify-center">
                  <CheckSquare className="h-6 w-6" />
                </div>
                <span className="text-xs font-medium text-center">Todas</span>
                <span className="text-[10px] text-[var(--muted-foreground)]">
                  {tasks.length} tarefas
                </span>
              </button>

              {/* Goals como ícones */}
              {goals.map((goal) => {
                const goalTasks = tasks.filter(t => t.goalId === goal.id || t.goal?.id === goal.id)
                return (
                  <button
                    key={goal.id}
                    onClick={() => setFilterGoalId(goal.id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all min-w-[80px] ${
                      filterGoalId === goal.id
                        ? 'bg-[var(--accent)] ring-2 ring-[var(--primary)]'
                        : 'hover:bg-[var(--accent)]'
                    }`}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md"
                      style={{ backgroundColor: goal.project?.color || '#6366f1' }}
                    >
                      {goal.title.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-medium text-center max-w-[70px] truncate">
                      {goal.title}
                    </span>
                    <span className="text-[10px] text-[var(--muted-foreground)]">
                      {goalTasks.length} tarefas
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Filtro por Responsável */}
          {users.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 mt-2">
              <span className="text-sm text-[var(--muted-foreground)] whitespace-nowrap">Responsável:</span>
              <Button
                variant={filterResponsibleId === null ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterResponsibleId(null)}
                className="whitespace-nowrap"
              >
                Todos
              </Button>
              {users.map(user => {
                const userTaskCount = tasks.filter(t => t.responsibleId === user.id).length
                return (
                  <Button
                    key={user.id}
                    variant={filterResponsibleId === user.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterResponsibleId(user.id)}
                    className="whitespace-nowrap flex items-center gap-2"
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white"
                      style={{ backgroundColor: '#6366f1' }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span>{user.name.split(' ')[0]}</span>
                    <span className="text-xs opacity-70">({userTaskCount})</span>
                  </Button>
                )
              })}
            </div>
          )}
        </div>

        {/* Header with stats and new task button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <Badge variant="secondary">{pendingTasks.length} pendentes</Badge>
            <Badge variant="warning">{inProgressTasks.length} em progresso</Badge>
            <Badge variant="success">{completedTasks.length} concluídas</Badge>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Nova Tarefa
          </Button>
        </div>

        {/* Progress bar */}
        {filteredTasks.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="font-medium">Progresso Geral</span>
              <span className="text-[var(--muted-foreground)]">
                {Math.round((completedTasks.length / filteredTasks.length) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${(completedTasks.length / filteredTasks.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {tasks.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckSquare className="h-12 w-12 mx-auto mb-4 text-[var(--muted-foreground)]" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma tarefa ainda</h3>
              <p className="text-[var(--muted-foreground)] mb-4">
                Crie sua primeira tarefa para começar a organizar seu trabalho.
              </p>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Tarefa
              </Button>
            </CardContent>
          </Card>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="overflow-x-auto pb-4 -mx-6 px-6">
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 min-w-0 sm:min-w-[600px] lg:min-w-0">
              {/* Pending */}
              <KanbanColumn
                id="PENDING"
                title="Pendentes"
                icon={Circle}
                iconColor="text-[var(--muted-foreground)]"
                tasks={pendingTasks}
                variant="secondary"
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />

              {/* In Progress */}
              <KanbanColumn
                id="IN_PROGRESS"
                title="Em Progresso"
                icon={Clock}
                iconColor="text-yellow-500"
                tasks={inProgressTasks}
                variant="warning"
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />

              {/* Completed */}
              <KanbanColumn
                id="COMPLETED"
                title="Concluídas"
                icon={CheckCircle2}
                iconColor="text-green-500"
                tasks={completedTasks}
                variant="success"
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />
              </div>
            </div>

            <DragOverlay>
              {activeTask && (
                <div className="opacity-80">
                  <TaskCard task={activeTask} isDragging />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Modal de criar tarefa */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent onClose={() => setIsModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>Nova Tarefa</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTask}>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium">Título da Tarefa *</label>
                <Input
                  placeholder="Ex: Preparar proposta comercial"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Input
                  placeholder="Descreva a tarefa..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Meta relacionada</label>
                <select
                  value={goalId}
                  onChange={(e) => setGoalId(e.target.value)}
                  className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Selecione uma meta (opcional)</option>
                  {goals.map((goal) => (
                    <option key={goal.id} value={goal.id}>{goal.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Responsável</label>
                <select
                  value={responsibleId}
                  onChange={(e) => setResponsibleId(e.target.value)}
                  className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Selecione um responsável (opcional)</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Data de vencimento</label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setIsModalOpen(false); resetForm(); }}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving || !title}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Criar Tarefa
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de editar tarefa */}
      <Dialog open={isEditModalOpen} onOpenChange={(open) => { setIsEditModalOpen(open); if (!open) resetForm(); }}>
        <DialogContent onClose={() => { setIsEditModalOpen(false); resetForm(); }}>
          <DialogHeader>
            <DialogTitle>Editar Tarefa</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateTask}>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium">Título da Tarefa *</label>
                <Input
                  placeholder="Ex: Preparar proposta comercial"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Input
                  placeholder="Descreva a tarefa..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Meta relacionada</label>
                <select
                  value={goalId}
                  onChange={(e) => setGoalId(e.target.value)}
                  className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Selecione uma meta (opcional)</option>
                  {goals.map((goal) => (
                    <option key={goal.id} value={goal.id}>{goal.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Responsável</label>
                <select
                  value={responsibleId}
                  onChange={(e) => setResponsibleId(e.target.value)}
                  className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Selecione um responsável (opcional)</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Data de vencimento</label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setIsEditModalOpen(false); resetForm(); }}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving || !title}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function KanbanColumn({
  id,
  title,
  icon: Icon,
  iconColor,
  tasks,
  variant,
  onEdit,
  onDelete,
}: {
  id: string
  title: string
  icon: typeof Circle
  iconColor: string
  tasks: Task[]
  variant: 'secondary' | 'warning' | 'success'
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[200px] p-3 rounded-lg transition-colors ${
        isOver ? 'bg-[var(--accent)] ring-2 ring-[var(--primary)]' : ''
      }`}
    >
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`h-5 w-5 ${iconColor}`} />
        <h3 className="font-semibold">{title}</h3>
        <Badge variant={variant}>{tasks.length}</Badge>
      </div>
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}

function SortableTaskCard({ task, onEdit, onDelete }: { task: Task; onEdit: (task: Task) => void; onDelete: (taskId: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <TaskCard task={task} isDragging={isDragging} listeners={listeners} onEdit={onEdit} onDelete={onDelete} />
    </div>
  )
}

function TaskCard({
  task,
  isDragging,
  listeners,
  onEdit,
  onDelete,
}: {
  task: Task
  isDragging?: boolean
  listeners?: Record<string, unknown>
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => void
}) {
  const config = statusConfig[task.status]
  const StatusIcon = config.icon
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED'

  return (
    <Card className={`transition-shadow ${isDragging ? 'shadow-lg ring-2 ring-[var(--primary)]' : 'hover:shadow-md'}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            {...listeners}
            className="cursor-grab active:cursor-grabbing mt-0.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            <GripVertical className="h-5 w-5" />
          </div>
          <StatusIcon className={`h-5 w-5 mt-0.5 ${config.color}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className={`font-medium ${task.status === 'COMPLETED' ? 'line-through text-[var(--muted-foreground)]' : ''}`}>
                {task.title}
              </p>
              {onEdit && onDelete && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 hover:bg-[var(--accent)] rounded flex-shrink-0">
                      <MoreVertical className="h-4 w-4 text-[var(--muted-foreground)]" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(task)}>
                      <Edit className="h-4 w-4 mr-2" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(task.id)}
                      className="text-[var(--destructive)]"
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            {/* Descrição */}
            {task.description && (
              <p className="text-sm text-[var(--muted-foreground)] mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
            {/* Meta relacionada */}
            {task.goal && (
              <p className="text-xs text-[var(--muted-foreground)] mt-1 flex items-center gap-1">
                <Target className="h-3 w-3" />
                {task.goal.title}
              </p>
            )}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                {task.responsible && (
                  <>
                    <div className="h-6 w-6 rounded-full bg-[var(--secondary)] flex items-center justify-center text-xs">
                      {task.responsible.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-xs text-[var(--muted-foreground)]">{task.responsible.name}</span>
                  </>
                )}
              </div>
              {task.dueDate && (
                <span className={`text-xs ${isOverdue ? 'text-[var(--destructive)]' : 'text-[var(--muted-foreground)]'}`}>
                  {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

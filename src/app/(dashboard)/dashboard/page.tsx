export const dynamic = 'force-dynamic'

import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { GoalCard } from '@/components/dashboard/goal-card'
import { Card, CardContent } from '@/components/ui/card'
import { CheckSquare, Clock, AlertTriangle, TrendingUp, Plus, FolderKanban, Users } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { projectScopeWhere } from '@/lib/auth-scope'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'

async function getProjectsWithGoals(userId: string) {
  const scope = await projectScopeWhere(userId)
  const projects = await prisma.project.findMany({
    where: scope,
    orderBy: { createdAt: 'desc' },
    include: {
      goals: {
        include: {
          responsible: true,
          _count: {
            select: { tasks: true }
          }
        }
      },
      _count: {
        select: { goals: true, documents: true }
      }
    }
  })

  return projects.map((project) => {
    const totalGoals = project.goals.length
    let progress = 0
    if (totalGoals > 0) {
      const totalProgress = project.goals.reduce((sum, goal) => {
        const goalProgress = goal.targetValue > 0
          ? (goal.currentValue / goal.targetValue) * 100
          : 0
        return sum + Math.min(goalProgress, 100)
      }, 0)
      progress = Math.round(totalProgress / totalGoals)
    }
    return { ...project, progress }
  })
}

async function getStats(userId: string) {
  const scope = await projectScopeWhere(userId)

  const pendingTasks = await prisma.task.count({
    where: {
      status: 'PENDING',
      goal: { project: scope }
    }
  })

  const now = new Date()
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const dueSoonTasks = await prisma.task.count({
    where: {
      status: { not: 'COMPLETED' },
      dueDate: {
        gte: now,
        lte: weekFromNow
      },
      goal: { project: scope }
    }
  })

  const atRiskGoals = await prisma.goal.count({
    where: {
      status: { in: ['AT_RISK', 'BEHIND'] },
      project: scope
    }
  })

  return {
    pendingTasks,
    dueSoonTasks,
    atRiskGoals
  }
}

type TasksByResponsible = {
  id: string | null
  name: string
  total: number
  pending: number
  inProgress: number
  completed: number
}

async function getTasksByResponsible(userId: string): Promise<TasksByResponsible[]> {
  const scope = await projectScopeWhere(userId)
  const tasks = await prisma.task.findMany({
    where: {
      goal: {
        project: scope
      }
    },
    include: {
      responsible: true
    }
  })

  // Agrupar por responsável
  const grouped: Record<string, TasksByResponsible> = {}

  tasks.forEach(task => {
    const key = task.responsibleId || 'unassigned'
    if (!grouped[key]) {
      grouped[key] = {
        id: task.responsibleId,
        name: task.responsible?.name || 'Não atribuído',
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0
      }
    }
    grouped[key].total++
    if (task.status === 'PENDING') grouped[key].pending++
    if (task.status === 'IN_PROGRESS') grouped[key].inProgress++
    if (task.status === 'COMPLETED') grouped[key].completed++
  })

  // Converter para array e ordenar por total
  return Object.values(grouped).sort((a, b) => b.total - a.total)
}

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const projects = await getProjectsWithGoals(user.id)
  const stats = await getStats(user.id)
  const tasksByResponsible = await getTasksByResponsible(user.id)

  // Se não há projetos, mostra tela de boas-vindas
  if (projects.length === 0) {
    return (
      <div className="min-h-screen">
        <DashboardHeader title="Dashboard" subtitle="Visão geral dos seus OKRs" />
        <div className="p-6">
          <Card className="max-w-2xl mx-auto mt-12">
            <CardContent className="p-12 text-center">
              <div className="mb-6">
                <div className="w-20 h-20 bg-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Bem-vindo ao Leve OKR!</h2>
                <p className="text-[var(--muted-foreground)]">
                  Comece criando seu primeiro projeto para organizar suas metas.
                </p>
              </div>
              <Link href="/goals">
                <Button size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Criar Primeiro Projeto
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Estatísticas gerais
  const allGoals = projects.flatMap(p => p.goals)
  const totalGoals = allGoals.length
  const completedGoals = allGoals.filter(g => g.status === 'COMPLETED').length
  const overallProgress = totalGoals > 0
    ? Math.round(allGoals.reduce((acc, goal) => {
        const progress = goal.targetValue > 0
          ? (goal.currentValue / goal.targetValue) * 100
          : 0
        return acc + Math.min(progress, 100)
      }, 0) / totalGoals)
    : 0

  const statsData = [
    { label: 'Tarefas pendentes', value: stats.pendingTasks, icon: CheckSquare, color: 'text-blue-500' },
    { label: 'Vencendo esta semana', value: stats.dueSoonTasks, icon: Clock, color: 'text-yellow-500' },
    { label: 'Metas em risco', value: stats.atRiskGoals, icon: AlertTriangle, color: 'text-red-500' },
    { label: 'Progresso geral', value: `${overallProgress}%`, icon: TrendingUp, color: 'text-green-500' },
  ]

  return (
    <div className="min-h-screen">
      <DashboardHeader title="Dashboard" subtitle="Visão geral dos seus OKRs" />

      <div className="p-6 space-y-6">
        {/* Stats rápidos */}
        <div className="grid gap-4 md:grid-cols-4">
          {statsData.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className={`rounded-lg bg-[var(--secondary)] p-2 ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Projetos */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Seus Projetos</h3>
            <Link href="/goals">
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Projeto
              </Button>
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link key={project.id} href="/goals">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      {project.imageUrl ? (
                        <img
                          src={project.imageUrl}
                          alt={project.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: project.color + '20' }}
                        >
                          <FolderKanban
                            className="h-5 w-5"
                            style={{ color: project.color }}
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{project.name}</h4>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          {project._count.goals} metas
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--muted-foreground)]">Progresso</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${project.progress}%`,
                            backgroundColor: project.color,
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Tarefas por Responsável */}
        {tasksByResponsible.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Tarefas por Responsável</h3>
              <Link href="/tasks">
                <Button variant="outline" size="sm" className="gap-2">
                  <Users className="h-4 w-4" />
                  Ver Tarefas
                </Button>
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tasksByResponsible.map((item) => {
                const completionRate = item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0
                return (
                  <Card key={item.id || 'unassigned'}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-bold">
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.name}</p>
                          <p className="text-sm text-[var(--muted-foreground)]">{item.total} tarefas</p>
                        </div>
                      </div>

                      {/* Métricas */}
                      <div className="grid grid-cols-3 gap-2 text-center mb-3">
                        <div className="p-2 bg-[var(--muted)] rounded">
                          <p className="text-lg font-bold text-yellow-500">{item.pending}</p>
                          <p className="text-[10px] text-[var(--muted-foreground)]">Pendentes</p>
                        </div>
                        <div className="p-2 bg-[var(--muted)] rounded">
                          <p className="text-lg font-bold text-blue-500">{item.inProgress}</p>
                          <p className="text-[10px] text-[var(--muted-foreground)]">Em Progresso</p>
                        </div>
                        <div className="p-2 bg-[var(--muted)] rounded">
                          <p className="text-lg font-bold text-green-500">{item.completed}</p>
                          <p className="text-[10px] text-[var(--muted-foreground)]">Concluídas</p>
                        </div>
                      </div>

                      {/* Barra de progresso */}
                      <div>
                        <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full transition-all duration-500"
                            style={{ width: `${completionRate}%` }}
                          />
                        </div>
                        <p className="text-xs text-right mt-1 text-[var(--muted-foreground)]">
                          {completionRate}% concluído
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Metas em destaque (todas as metas de todos os projetos) */}
        {allGoals.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Todas as Metas</h3>
              <Link href="/goals">
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nova Meta
                </Button>
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {allGoals.slice(0, 6).map((goal) => {
                const project = projects.find(p => p.id === goal.projectId)
                return (
                  <GoalCard
                    key={goal.id}
                    title={goal.title}
                    currentValue={goal.currentValue}
                    targetValue={goal.targetValue}
                    unit={goal.unit}
                    status={goal.status as 'ON_TRACK' | 'AT_RISK' | 'BEHIND' | 'COMPLETED'}
                    responsible={goal.responsible?.name || 'Não atribuído'}
                    projectName={project?.name}
                    projectColor={project?.color}
                  />
                )
              })}
            </div>

            {allGoals.length > 6 && (
              <div className="text-center mt-4">
                <Link href="/goals">
                  <Button variant="link">Ver todas as {allGoals.length} metas</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

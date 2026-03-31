'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, Save, Loader2, Target } from 'lucide-react'
import Link from 'next/link'

type Goal = {
  id: string
  title: string
  currentValue: number
  targetValue: number
  unit: string
  projectId: string
  project?: {
    name: string
    color: string
  }
  checkins?: {
    id: string
    value: number
    notes?: string
    weekNumber: number
    createdAt: string
  }[]
}

export default function CheckinPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [values, setValues] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})

  const currentWeek = getWeekNumber(new Date())

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    try {
      const res = await fetch('/api/goals')
      const data = await res.json()
      setGoals(data)

      // Pre-fill with current values
      const initialValues: Record<string, string> = {}
      data.forEach((goal: Goal) => {
        initialValues[goal.id] = goal.currentValue.toString()
      })
      setValues(initialValues)
    } catch (error) {
      console.error('Error fetching goals:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (goalId: string) => {
    const newValue = parseFloat(values[goalId])
    if (isNaN(newValue)) return

    setSaving(prev => ({ ...prev, [goalId]: true }))

    try {
      // Create check-in
      await fetch('/api/checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalId,
          value: newValue,
          notes: notes[goalId] || '',
          weekNumber: currentWeek,
        }),
      })

      // Update goal's currentValue
      await fetch(`/api/goals/${goalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentValue: newValue,
        }),
      })

      // Update local state
      setGoals(prev =>
        prev.map(g =>
          g.id === goalId
            ? { ...g, currentValue: newValue }
            : g
        )
      )

      setSaved(prev => ({ ...prev, [goalId]: true }))
      setNotes(prev => ({ ...prev, [goalId]: '' }))

      setTimeout(() => {
        setSaved(prev => ({ ...prev, [goalId]: false }))
      }, 2000)
    } catch (error) {
      console.error('Error saving check-in:', error)
    } finally {
      setSaving(prev => ({ ...prev, [goalId]: false }))
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <DashboardHeader title="Check-in Semanal" subtitle={`Semana ${currentWeek} de 2026`} />
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
        </div>
      </div>
    )
  }

  if (goals.length === 0) {
    return (
      <div className="min-h-screen">
        <DashboardHeader title="Check-in Semanal" subtitle={`Semana ${currentWeek} de 2026`} />
        <div className="p-6">
          <Card className="max-w-2xl mx-auto mt-12">
            <CardContent className="p-12 text-center">
              <div className="mb-6">
                <div className="w-20 h-20 bg-[var(--muted)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-10 w-10 text-[var(--muted-foreground)]" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Nenhuma meta cadastrada</h2>
                <p className="text-[var(--muted-foreground)]">
                  Crie metas para poder fazer check-ins semanais.
                </p>
              </div>
              <Link href="/goals">
                <Button size="lg">Criar Metas</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader title="Check-in Semanal" subtitle={`Semana ${currentWeek} de 2026`} />

      <div className="p-6">
        <Card className="mb-6">
          <CardContent className="p-4">
            <p className="text-[var(--muted-foreground)]">
              Atualize o progresso de cada meta para esta semana. O check-in ajuda a manter o acompanhamento
              consistente e identificar possíveis bloqueios.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {goals.map((goal) => {
            const percentage = Math.min(Math.round((goal.currentValue / goal.targetValue) * 100), 100)
            const inputValue = values[goal.id] || goal.currentValue.toString()
            const newValue = parseFloat(inputValue) || 0
            const change = newValue - goal.currentValue
            const lastCheckin = goal.checkins?.[0]

            return (
              <Card key={goal.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{goal.title}</CardTitle>
                    {goal.project && (
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: goal.project.color }}
                        />
                        <span className="text-sm text-[var(--muted-foreground)]">
                          {goal.project.name}
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-2xl font-bold">
                          {goal.currentValue.toLocaleString('pt-BR')}
                        </span>
                        <span className="text-[var(--muted-foreground)]">
                          / {goal.targetValue.toLocaleString('pt-BR')} {goal.unit}
                        </span>
                      </div>
                      <Progress value={percentage} className="mb-2" />
                      {lastCheckin && (
                        <p className="text-sm text-[var(--muted-foreground)]">
                          Último check-in: {lastCheckin.value.toLocaleString('pt-BR')} {goal.unit}
                          {lastCheckin.notes && ` - ${lastCheckin.notes}`}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Novo valor</label>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <Input
                            type="number"
                            placeholder={goal.currentValue.toString()}
                            value={inputValue}
                            onChange={(e) => setValues(prev => ({ ...prev, [goal.id]: e.target.value }))}
                            className="w-full sm:w-32"
                          />
                          <span className="text-[var(--muted-foreground)]">{goal.unit}</span>
                          {change !== 0 && (
                            <span className={`text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {change >= 0 ? '+' : ''}{change.toLocaleString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Observações</label>
                        <Input
                          placeholder="O que aconteceu esta semana?"
                          value={notes[goal.id] || ''}
                          onChange={(e) => setNotes(prev => ({ ...prev, [goal.id]: e.target.value }))}
                          className="mt-1"
                        />
                      </div>

                      <Button
                        onClick={() => handleSave(goal.id)}
                        disabled={saving[goal.id] || change === 0}
                        className="w-full"
                      >
                        {saving[goal.id] ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Salvando...
                          </>
                        ) : saved[goal.id] ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Salvo!
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Salvar Check-in
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}

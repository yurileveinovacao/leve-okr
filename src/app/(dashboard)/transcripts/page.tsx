'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Upload,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  FileText,
  Loader2,
  X,
  Target
} from 'lucide-react'

type Goal = {
  id: string
  title: string
  projectId: string
  project?: {
    name: string
    color: string
  }
}

type SuggestedTask = {
  id: string
  suggestedTitle: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  suggestedGoal?: {
    id: string
    title: string
  }
  transcriptId: string
}

type Transcript = {
  id: string
  title: string
  transcriptText: string
  meetingDate: string
  processed: boolean
  createdAt: string
  goalId?: string | null
  goal?: {
    id: string
    title: string
    project?: {
      name: string
      color: string
    }
  } | null
  suggestedTasks: SuggestedTask[]
  approvedTasks: number
  pendingTasks: number
  _count: {
    suggestedTasks: number
  }
}

export default function TranscriptsPage() {
  const [transcripts, setTranscripts] = useState<Transcript[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTranscript, setSelectedTranscript] = useState<Transcript | null>(null)

  // Upload state
  const [showUpload, setShowUpload] = useState(false)
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadText, setUploadText] = useState('')
  const [uploadDate, setUploadDate] = useState('')
  const [uploadGoalId, setUploadGoalId] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  // Approve modal state
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [taskToApprove, setTaskToApprove] = useState<SuggestedTask | null>(null)
  const [selectedGoalId, setSelectedGoalId] = useState('')
  const [isApproving, setIsApproving] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [transcriptsRes, goalsRes] = await Promise.all([
        fetch('/api/transcripts'),
        fetch('/api/goals')
      ])

      const [transcriptsData, goalsData] = await Promise.all([
        transcriptsRes.json(),
        goalsRes.json()
      ])

      setTranscripts(transcriptsData)
      setGoals(goalsData)

      // Select first transcript by default
      if (transcriptsData.length > 0 && !selectedTranscript) {
        setSelectedTranscript(transcriptsData[0])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const text = await file.text()
      setUploadText(text)
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ''))
      setUploadDate(new Date().toISOString().split('T')[0])
    }
  }

  const handleUpload = async () => {
    if (!uploadTitle || !uploadText) return

    setIsUploading(true)

    try {
      const res = await fetch('/api/transcripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: uploadTitle,
          transcriptText: uploadText,
          meetingDate: uploadDate || new Date().toISOString(),
          goalId: uploadGoalId || undefined,
        })
      })

      if (res.ok) {
        const newTranscript = await res.json()
        setTranscripts(prev => [{ ...newTranscript, approvedTasks: 0, pendingTasks: 0 }, ...prev])
        closeUploadModal()
      }
    } catch (error) {
      console.error('Error uploading:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const closeUploadModal = () => {
    setShowUpload(false)
    setUploadTitle('')
    setUploadText('')
    setUploadDate('')
    setUploadGoalId('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const openApproveModal = (task: SuggestedTask) => {
    setTaskToApprove(task)
    setSelectedGoalId('')
    setShowApproveModal(true)
  }

  const handleApprove = async () => {
    if (!taskToApprove || !selectedGoalId) return

    setIsApproving(true)

    try {
      const res = await fetch(`/api/suggested-tasks/${taskToApprove.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'APPROVED',
          goalId: selectedGoalId,
        })
      })

      if (res.ok) {
        // Atualizar estado local
        updateTaskStatus(taskToApprove.id, 'APPROVED')
        setShowApproveModal(false)
        setTaskToApprove(null)
      }
    } catch (error) {
      console.error('Error approving task:', error)
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async (taskId: string) => {
    try {
      const res = await fetch(`/api/suggested-tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED' })
      })

      if (res.ok) {
        updateTaskStatus(taskId, 'REJECTED')
      }
    } catch (error) {
      console.error('Error rejecting task:', error)
    }
  }

  const updateTaskStatus = (taskId: string, status: 'APPROVED' | 'REJECTED') => {
    setTranscripts(prev => prev.map(t => ({
      ...t,
      suggestedTasks: t.suggestedTasks.map(st =>
        st.id === taskId ? { ...st, status } : st
      ),
      approvedTasks: t.suggestedTasks.filter(st =>
        st.id === taskId ? status === 'APPROVED' : st.status === 'APPROVED'
      ).length,
      pendingTasks: t.suggestedTasks.filter(st =>
        st.id === taskId ? false : st.status === 'PENDING'
      ).length,
    })))

    if (selectedTranscript) {
      setSelectedTranscript(prev => prev ? {
        ...prev,
        suggestedTasks: prev.suggestedTasks.map(st =>
          st.id === taskId ? { ...st, status } : st
        )
      } : null)
    }
  }

  // Get all suggested tasks from selected transcript or all
  const suggestedTasks = selectedTranscript
    ? selectedTranscript.suggestedTasks
    : transcripts.flatMap(t => t.suggestedTasks)

  const pendingTasks = suggestedTasks.filter(t => t.status === 'PENDING')

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <DashboardHeader title="Transcrições" subtitle="Extraia tarefas das suas reuniões com IA" />
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader title="Transcrições" subtitle="Extraia tarefas das suas reuniões com IA" />

      <div className="p-6 space-y-6">
        {/* Upload section */}
        <Card className="border-dashed">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-[var(--primary)] p-3">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Processar nova transcrição</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Faça upload da transcrição do Google Meet para analisar e criar tarefas
                  </p>
                </div>
              </div>
              <Button onClick={() => setShowUpload(!showUpload)} className="w-full sm:w-auto">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>

            {showUpload && (
              <div className="mt-4 p-4 border rounded-lg bg-[var(--secondary)]">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Título da reunião</label>
                    <Input
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      placeholder="Ex: Reunião de Planejamento Q1"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Data da reunião</label>
                    <Input
                      type="date"
                      value={uploadDate}
                      onChange={(e) => setUploadDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Vincular à Meta (opcional)</label>
                    <select
                      value={uploadGoalId}
                      onChange={(e) => setUploadGoalId(e.target.value)}
                      className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="">Selecione uma meta</option>
                      {goals.map(g => (
                        <option key={g.id} value={g.id}>
                          {g.project?.name ? `[${g.project.name}] ` : ''}{g.title}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">
                      As tarefas sugeridas serão pré-vinculadas a esta meta
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Transcrição</label>
                    <div className="mt-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      {uploadText ? (
                        <div className="border rounded-lg p-3 bg-white max-h-40 overflow-y-auto">
                          <pre className="text-sm whitespace-pre-wrap">{uploadText.slice(0, 500)}...</pre>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-[var(--border)] rounded-lg p-8 text-center cursor-pointer hover:bg-[var(--accent)]"
                        >
                          <FileText className="h-10 w-10 mx-auto text-[var(--muted-foreground)] mb-2" />
                          <p className="text-sm text-[var(--muted-foreground)]">
                            Arraste o arquivo aqui ou clique para selecionar
                          </p>
                          <p className="text-xs text-[var(--muted-foreground)] mt-1">
                            Suporta qualquer arquivo de texto (.txt, .vtt, .srt, .md, etc.)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={closeUploadModal}>
                      Cancelar
                    </Button>
                    <Button onClick={handleUpload} disabled={isUploading || !uploadTitle || !uploadText}>
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Enviar Transcrição
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {transcripts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-[var(--muted)] rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-[var(--muted-foreground)]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhuma transcrição encontrada</h3>
              <p className="text-[var(--muted-foreground)] mb-4">
                Faça upload de uma transcrição de reunião para começar.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 lg:gap-6 grid-cols-1 lg:grid-cols-2">
            {/* Transcripts list */}
            <Card>
              <CardHeader>
                <CardTitle>Transcrições Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transcripts.map((transcript) => (
                    <div
                      key={transcript.id}
                      onClick={() => setSelectedTranscript(transcript)}
                      className={`flex items-center justify-between p-3 rounded-lg border hover:bg-[var(--accent)] transition-colors cursor-pointer ${
                        selectedTranscript?.id === transcript.id ? 'bg-[var(--accent)] ring-2 ring-[var(--primary)]' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <MessageSquare className="h-5 w-5 text-[var(--primary)]" />
                        <div>
                          <p className="font-medium">{transcript.title}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            {new Date(transcript.meetingDate).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {transcript._count.suggestedTasks > 0 ? (
                          <Badge variant="default">
                            {transcript.approvedTasks}/{transcript._count.suggestedTasks} tarefas
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            Sem tarefas
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Suggested tasks */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>
                  Tarefas Sugeridas
                  {selectedTranscript && (
                    <span className="text-sm font-normal text-[var(--muted-foreground)] ml-2">
                      ({selectedTranscript.title})
                    </span>
                  )}
                </CardTitle>
                <Badge variant="secondary">{pendingTasks.length} pendentes</Badge>
              </CardHeader>
              <CardContent>
                {suggestedTasks.length === 0 ? (
                  <div className="text-center py-8 text-[var(--muted-foreground)]">
                    <Target className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma tarefa sugerida</p>
                    <p className="text-sm">As tarefas aparecerão aqui após processamento</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {suggestedTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`p-3 rounded-lg border ${
                          task.status === 'APPROVED'
                            ? 'bg-green-50 border-green-200'
                            : task.status === 'REJECTED'
                            ? 'bg-red-50 border-red-200 opacity-60'
                            : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className={`font-medium ${task.status === 'REJECTED' ? 'line-through' : ''}`}>
                              {task.suggestedTitle}
                            </p>
                            {task.suggestedGoal && (
                              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                                Meta: {task.suggestedGoal.title}
                              </p>
                            )}
                          </div>
                          {task.status === 'PENDING' && (
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-50"
                                onClick={() => openApproveModal(task)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => handleReject(task.id)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          {task.status === 'APPROVED' && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                          {task.status === 'REJECTED' && (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Approve Modal */}
      {showApproveModal && taskToApprove && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Aprovar Tarefa</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowApproveModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="mb-4 p-3 bg-[var(--muted)] rounded-lg">
                <p className="font-medium">{taskToApprove.suggestedTitle}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Vincular à Meta *</label>
                  <select
                    value={selectedGoalId}
                    onChange={(e) => setSelectedGoalId(e.target.value)}
                    className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="">Selecione uma meta</option>
                    {goals.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.project?.name ? `[${g.project.name}] ` : ''}{g.title}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">
                    A tarefa será criada vinculada a esta meta
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setShowApproveModal(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleApprove}
                    disabled={isApproving || !selectedGoalId}
                    className="flex-1"
                  >
                    {isApproving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Aprovando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Aprovar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

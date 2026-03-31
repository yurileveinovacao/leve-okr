'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { GoalCard } from '@/components/dashboard/goal-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Plus, Target, Loader2, FolderKanban, Camera, Pencil } from 'lucide-react'
import { useRef } from 'react'

type Goal = {
  id: string
  title: string
  description?: string
  currentValue: number
  targetValue: number
  unit: string
  status: 'ON_TRACK' | 'AT_RISK' | 'BEHIND' | 'COMPLETED'
  responsible?: { name: string }
  projectId: string
}

type Project = {
  id: string
  name: string
  description?: string
  color: string
  imageUrl?: string
  progress: number
  goals: Goal[]
  _count: {
    goals: number
    documents: number
  }
}

const PROJECT_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#14b8a6', // Teal
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
]

export default function GoalsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  // Goal form states
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetValue, setTargetValue] = useState('')
  const [unit, setUnit] = useState('')

  // Project form states
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [projectColor, setProjectColor] = useState('#6366f1')

  const fetchData = async () => {
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      setProjects(data)

      if (data.length > 0 && !selectedProject) {
        setSelectedProject(data[0])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: projectName,
          description: projectDescription,
          color: projectColor,
        }),
      })

      if (res.ok) {
        const newProject = await res.json()
        setProjects([newProject, ...projects])
        setSelectedProject(newProject)
        setIsProjectModalOpen(false)
        setProjectName('')
        setProjectDescription('')
        setProjectColor('#6366f1')
      }
    } catch (error) {
      console.error('Error creating project:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProject) return

    setIsSaving(true)

    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          targetValue: parseFloat(targetValue) || 100,
          currentValue: 0,
          unit: unit || '%',
          projectId: selectedProject.id,
          status: 'ON_TRACK',
        }),
      })

      if (res.ok) {
        const newGoal = await res.json()
        // Update local state
        const updatedProjects = projects.map((p) =>
          p.id === selectedProject.id
            ? { ...p, goals: [...p.goals, newGoal] }
            : p
        )
        setProjects(updatedProjects)
        setSelectedProject({
          ...selectedProject,
          goals: [...selectedProject.goals, newGoal],
        })
        setIsModalOpen(false)
        setTitle('')
        setDescription('')
        setTargetValue('')
        setUnit('')
      }
    } catch (error) {
      console.error('Error creating goal:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setProjectName(project.name)
    setProjectDescription(project.description || '')
    setProjectColor(project.color)
    setImagePreview(project.imageUrl || null)
    setImageFile(null)
    setIsEditProjectModalOpen(true)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Imagem muito grande. Máximo 2MB')
        return
      }
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProject) return

    setIsSaving(true)
    try {
      // Se tem nova imagem, fazer upload primeiro
      if (imageFile) {
        const formData = new FormData()
        formData.append('file', imageFile)

        const uploadRes = await fetch(`/api/projects/${editingProject.id}/image`, {
          method: 'POST',
          body: formData,
        })

        if (!uploadRes.ok) {
          console.error('Erro ao fazer upload da imagem')
        }
      }

      // Atualizar dados do projeto
      const res = await fetch(`/api/projects/${editingProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: projectName,
          description: projectDescription,
          color: projectColor,
        }),
      })

      if (res.ok) {
        // Recarregar dados
        await fetchData()
        setIsEditProjectModalOpen(false)
        resetProjectForm()
      }
    } catch (error) {
      console.error('Error updating project:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteProject = async () => {
    if (!editingProject) return
    if (!confirm(`Tem certeza que deseja excluir o projeto "${editingProject.name}"? Todas as metas e tarefas serão excluídas.`)) return

    setIsSaving(true)
    try {
      const res = await fetch(`/api/projects/${editingProject.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setProjects(projects.filter(p => p.id !== editingProject.id))
        if (selectedProject?.id === editingProject.id) {
          setSelectedProject(projects.filter(p => p.id !== editingProject.id)[0] || null)
        }
        setIsEditProjectModalOpen(false)
        resetProjectForm()
      }
    } catch (error) {
      console.error('Error deleting project:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const resetProjectForm = () => {
    setProjectName('')
    setProjectDescription('')
    setProjectColor('#6366f1')
    setImageFile(null)
    setImagePreview(null)
    setEditingProject(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <DashboardHeader title="Metas" subtitle="Gerencie suas metas por projeto" />
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
        </div>
      </div>
    )
  }

  // Se não há projetos, mostra tela para criar
  if (projects.length === 0) {
    return (
      <div className="min-h-screen">
        <DashboardHeader title="Metas" subtitle="Gerencie suas metas por projeto" />
        <div className="p-6">
          <Card className="max-w-2xl mx-auto mt-12">
            <CardContent className="p-12 text-center">
              <div className="mb-6">
                <div className="w-20 h-20 bg-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <FolderKanban className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Crie seu Primeiro Projeto</h2>
                <p className="text-[var(--muted-foreground)]">
                  Projetos agrupam suas metas. Quando todas as metas atingirem 100%, você alcançou o objetivo do projeto.
                </p>
              </div>
              <Button size="lg" className="gap-2" onClick={() => setIsProjectModalOpen(true)}>
                <Plus className="h-5 w-5" />
                Criar Projeto
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Modal de criar projeto */}
        <Dialog open={isProjectModalOpen} onOpenChange={setIsProjectModalOpen}>
          <DialogContent onClose={() => setIsProjectModalOpen(false)}>
            <DialogHeader>
              <DialogTitle>Novo Projeto</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateProject}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium">Nome do Projeto *</label>
                  <Input
                    placeholder="Ex: Expansão de Mercado Q1 2026"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Descrição</label>
                  <Input
                    placeholder="Descreva o objetivo do projeto..."
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Cor do Projeto</label>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {PROJECT_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setProjectColor(color)}
                        className={`w-8 h-8 rounded-full transition-all ${
                          projectColor === color ? 'ring-2 ring-offset-2 ring-[var(--primary)]' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsProjectModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving || !projectName}>
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Criar Projeto
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  const goals = selectedProject?.goals || []

  return (
    <div className="min-h-screen">
      <DashboardHeader title="Metas" subtitle="Gerencie suas metas por projeto" />

      <div className="p-6">
        {/* Project icons with horizontal scroll */}
        <div className="mb-6">
          <div className="overflow-x-auto pb-2 -mx-6 px-6">
            <div className="flex gap-3 min-w-max">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className={`relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all min-w-[80px] group ${
                    selectedProject?.id === project.id
                      ? 'bg-[var(--accent)] ring-2 ring-[var(--primary)]'
                      : 'hover:bg-[var(--accent)]'
                  }`}
                >
                  <button
                    onClick={() => setSelectedProject(project)}
                    className="flex flex-col items-center gap-2"
                  >
                    {project.imageUrl ? (
                      <img
                        src={project.imageUrl}
                        alt={project.name}
                        className="w-12 h-12 rounded-full object-cover shadow-md"
                      />
                    ) : (
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md"
                        style={{ backgroundColor: project.color }}
                      >
                        {project.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-xs font-medium text-center max-w-[70px] truncate">
                      {project.name}
                    </span>
                    <span className="text-[10px] text-[var(--muted-foreground)]">
                      {project._count.goals} metas
                    </span>
                  </button>
                  {/* Botão de editar */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditProject(project)
                    }}
                    className="absolute top-1 right-1 p-1.5 rounded-full bg-[var(--card)] shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--accent)]"
                  >
                    <Pencil className="h-3 w-3 text-[var(--muted-foreground)]" />
                  </button>
                </div>
              ))}

              {/* Botão Novo Projeto */}
              <button
                onClick={() => setIsProjectModalOpen(true)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[var(--accent)] text-[var(--primary)] min-w-[80px]"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-dashed border-[var(--primary)]">
                  <Plus className="h-6 w-6" />
                </div>
                <span className="text-xs font-medium">Novo</span>
                <span className="text-[10px] text-transparent">-</span>
              </button>
            </div>
          </div>
        </div>

        {/* Header with stats and new goal button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="text-sm text-[var(--muted-foreground)]">
            {goals.length} {goals.length === 1 ? 'meta' : 'metas'} • {selectedProject?.progress || 0}% completo
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Nova Meta
          </Button>
        </div>

        {/* Progress bar for project */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="font-medium">Progresso do Projeto</span>
            <span className="text-[var(--muted-foreground)]">{selectedProject?.progress || 0}%</span>
          </div>
          <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${selectedProject?.progress || 0}%`,
                backgroundColor: selectedProject?.color || '#6366f1',
              }}
            />
          </div>
        </div>

        {goals.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {goals.map((goal) => (
              <Link key={goal.id} href={`/goals/${goal.id}`}>
                <GoalCard
                  title={goal.title}
                  currentValue={goal.currentValue}
                  targetValue={goal.targetValue}
                  unit={goal.unit}
                  status={goal.status}
                  responsible={goal.responsible?.name || 'Não atribuído'}
                />
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Target className="h-12 w-12 mx-auto mb-4 text-[var(--muted-foreground)]" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma meta ainda</h3>
              <p className="text-[var(--muted-foreground)] mb-4">
                Crie sua primeira meta para começar a acompanhar o progresso do projeto.
              </p>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Meta
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de criar projeto */}
      <Dialog open={isProjectModalOpen} onOpenChange={setIsProjectModalOpen}>
        <DialogContent onClose={() => setIsProjectModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>Novo Projeto</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateProject}>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium">Nome do Projeto *</label>
                <Input
                  placeholder="Ex: Expansão de Mercado Q1 2026"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Input
                  placeholder="Descreva o objetivo do projeto..."
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Cor do Projeto</label>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {PROJECT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setProjectColor(color)}
                      className={`w-8 h-8 rounded-full transition-all ${
                        projectColor === color ? 'ring-2 ring-offset-2 ring-[var(--primary)]' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsProjectModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving || !projectName}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Criar Projeto
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de criar meta */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent onClose={() => setIsModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>Nova Meta</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateGoal}>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium">Projeto</label>
                <div className="mt-1 flex items-center gap-2 px-3 py-2 bg-[var(--muted)] rounded-md">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedProject?.color || '#6366f1' }}
                  />
                  <span className="text-sm">{selectedProject?.name}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Título da Meta *</label>
                <Input
                  placeholder="Ex: Aumentar receita mensal"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Input
                  placeholder="Descreva a meta..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Valor Alvo *</label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Unidade *</label>
                  <Input
                    placeholder="Ex: %, R$, clientes"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving || !title || !targetValue || !unit}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Criar Meta
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de editar projeto */}
      <Dialog open={isEditProjectModalOpen} onOpenChange={(open) => { setIsEditProjectModalOpen(open); if (!open) resetProjectForm(); }}>
        <DialogContent onClose={() => { setIsEditProjectModalOpen(false); resetProjectForm(); }}>
          <DialogHeader>
            <DialogTitle>Editar Projeto</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateProject}>
            <div className="p-6 space-y-4">
              {/* Upload de Imagem */}
              <div className="flex justify-center">
                <label className="cursor-pointer relative group">
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/gif,image/webp"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-20 h-20 rounded-full object-cover shadow-md"
                    />
                  ) : (
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md"
                      style={{ backgroundColor: projectColor }}
                    >
                      {projectName.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                </label>
              </div>
              <p className="text-xs text-center text-[var(--muted-foreground)]">
                Clique para alterar o logo (PNG, JPG, max 2MB)
              </p>

              <div>
                <label className="text-sm font-medium">Nome do Projeto *</label>
                <Input
                  placeholder="Ex: Expansão de Mercado Q1 2026"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Input
                  placeholder="Descreva o objetivo do projeto..."
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Cor do Projeto</label>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {PROJECT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setProjectColor(color)}
                      className={`w-8 h-8 rounded-full transition-all ${
                        projectColor === color ? 'ring-2 ring-offset-2 ring-[var(--primary)]' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter className="flex justify-between">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteProject}
                disabled={isSaving}
              >
                Excluir Projeto
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => { setIsEditProjectModalOpen(false); resetProjectForm(); }}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving || !projectName}>
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Salvar
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  )
}

'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Plus,
  FileText,
  FileSpreadsheet,
  FileImage,
  File,
  Download,
  Trash2,
  Search,
  Folder,
  Loader2,
  X,
  Upload
} from 'lucide-react'

type Project = {
  id: string
  name: string
  color: string
}

type Goal = {
  id: string
  title: string
  projectId: string
}

type Document = {
  id: string
  title: string
  fileUrl: string
  fileType: string
  fileSize: number | null
  createdAt: string
  project?: {
    id: string
    name: string
    color: string
  }
  goal?: {
    id: string
    title: string
  }
  uploadedBy: {
    id: string
    name: string
  }
}

const fileIcons: Record<string, typeof FileText> = {
  pdf: FileText,
  xlsx: FileSpreadsheet,
  xls: FileSpreadsheet,
  png: FileImage,
  jpg: FileImage,
  jpeg: FileImage,
  gif: FileImage,
  default: File,
}

const fileColors: Record<string, string> = {
  pdf: 'text-red-500 bg-red-50',
  xlsx: 'text-green-500 bg-green-50',
  xls: 'text-green-500 bg-green-50',
  png: 'text-purple-500 bg-purple-50',
  jpg: 'text-purple-500 bg-purple-50',
  jpeg: 'text-purple-500 bg-purple-50',
  gif: 'text-purple-500 bg-purple-50',
  default: 'text-gray-500 bg-gray-50',
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '-'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadProjectId, setUploadProjectId] = useState('')
  const [uploadGoalId, setUploadGoalId] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [docsRes, projectsRes, goalsRes] = await Promise.all([
        fetch('/api/documents'),
        fetch('/api/projects'),
        fetch('/api/goals')
      ])

      const [docsData, projectsData, goalsData] = await Promise.all([
        docsRes.json(),
        projectsRes.json(),
        goalsRes.json()
      ])

      setDocuments(docsData)
      setProjects(projectsData)
      setGoals(goalsData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadFile(file)
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ''))
      setShowUploadModal(true)
    }
  }

  const handleUpload = async () => {
    if (!uploadFile) return

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', uploadFile)
      formData.append('title', uploadTitle || uploadFile.name)
      if (uploadProjectId) formData.append('projectId', uploadProjectId)
      if (uploadGoalId) formData.append('goalId', uploadGoalId)

      const res = await fetch('/api/documents', {
        method: 'POST',
        body: formData
      })

      if (res.ok) {
        const newDoc = await res.json()
        setDocuments(prev => [newDoc, ...prev])
        closeUploadModal()
      } else {
        const error = await res.json()
        alert(error.error || 'Erro ao fazer upload')
      }
    } catch (error) {
      console.error('Error uploading:', error)
      alert('Erro ao fazer upload')
    } finally {
      setIsUploading(false)
    }
  }

  const closeUploadModal = () => {
    setShowUploadModal(false)
    setUploadFile(null)
    setUploadTitle('')
    setUploadProjectId('')
    setUploadGoalId('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este documento?')) return

    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setDocuments(prev => prev.filter(d => d.id !== id))
      }
    } catch (error) {
      console.error('Error deleting:', error)
    }
  }

  const handleDownload = (doc: Document) => {
    window.open(doc.fileUrl, '_blank')
  }

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = searchQuery === '' ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesProject = selectedProject === null ||
      selectedProject === 'all' ||
      doc.project?.id === selectedProject
    return matchesSearch && matchesProject
  })

  // Get project folders with counts
  const projectFolders = [
    { id: 'all', name: 'Todos os arquivos', color: '#6366f1', count: documents.length },
    ...projects.map(p => ({
      ...p,
      count: documents.filter(d => d.project?.id === p.id).length
    }))
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <DashboardHeader title="Documentos" subtitle="Central de arquivos do projeto" />
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader title="Documentos" subtitle="Central de arquivos do projeto" />

      <div className="p-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <Input
              placeholder="Buscar documentos..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button onClick={() => fileInputRef.current?.click()} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>

        {/* Quick access folders */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 mb-6">
          {projectFolders.map((folder) => (
            <Card
              key={folder.id}
              className={`hover:shadow-md transition-shadow cursor-pointer ${
                selectedProject === folder.id ? 'ring-2 ring-[var(--primary)]' : ''
              }`}
              onClick={() => setSelectedProject(folder.id === selectedProject ? null : folder.id)}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <div
                  className="rounded-lg p-2"
                  style={{ backgroundColor: folder.color + '20' }}
                >
                  <Folder className="h-5 w-5" style={{ color: folder.color }} />
                </div>
                <div>
                  <p className="font-medium text-sm">{folder.name}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {folder.count} arquivos
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Documents list */}
        {filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-[var(--muted)] rounded-full flex items-center justify-center mx-auto mb-4">
                <File className="h-8 w-8 text-[var(--muted-foreground)]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhum documento encontrado</h3>
              <p className="text-[var(--muted-foreground)] mb-4">
                {documents.length === 0
                  ? 'Faça upload do primeiro documento para começar.'
                  : 'Nenhum documento corresponde aos filtros selecionados.'}
              </p>
              {documents.length === 0 && (
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 text-sm font-medium text-[var(--muted-foreground)]">Nome</th>
                    <th className="text-left p-4 text-sm font-medium text-[var(--muted-foreground)] hidden sm:table-cell">Projeto</th>
                    <th className="text-left p-4 text-sm font-medium text-[var(--muted-foreground)] hidden lg:table-cell">Meta</th>
                    <th className="text-left p-4 text-sm font-medium text-[var(--muted-foreground)] hidden md:table-cell">Enviado por</th>
                    <th className="text-left p-4 text-sm font-medium text-[var(--muted-foreground)]">Data</th>
                    <th className="text-left p-4 text-sm font-medium text-[var(--muted-foreground)] hidden sm:table-cell">Tamanho</th>
                    <th className="text-right p-4 text-sm font-medium text-[var(--muted-foreground)]">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map((doc) => {
                    const Icon = fileIcons[doc.fileType] || fileIcons.default
                    const colorClass = fileColors[doc.fileType] || fileColors.default

                    return (
                      <tr key={doc.id} className="border-b last:border-0 hover:bg-[var(--accent)]">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`rounded-lg p-2 ${colorClass}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium">{doc.title}</p>
                              <p className="text-xs text-[var(--muted-foreground)] uppercase">{doc.fileType}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden sm:table-cell">
                          {doc.project ? (
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: doc.project.color }}
                              />
                              <span className="text-sm">{doc.project.name}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-[var(--muted-foreground)]">-</span>
                          )}
                        </td>
                        <td className="p-4 text-sm hidden lg:table-cell">
                          {doc.goal?.title || '-'}
                        </td>
                        <td className="p-4 text-sm hidden md:table-cell">{doc.uploadedBy.name}</td>
                        <td className="p-4 text-sm text-[var(--muted-foreground)]">
                          {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="p-4 text-sm text-[var(--muted-foreground)] hidden sm:table-cell">
                          {formatFileSize(doc.fileSize)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDownload(doc)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(doc.id)}
                            >
                              <Trash2 className="h-4 w-4 text-[var(--destructive)]" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Upload de Documento</h3>
                <Button variant="ghost" size="icon" onClick={closeUploadModal}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {uploadFile && (
                <div className="mb-4 p-3 bg-[var(--muted)] rounded-lg flex items-center gap-3">
                  <File className="h-8 w-8 text-[var(--muted-foreground)]" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{uploadFile.name}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {formatFileSize(uploadFile.size)}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Título</label>
                  <Input
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="Nome do documento"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Projeto (opcional)</label>
                  <select
                    value={uploadProjectId}
                    onChange={(e) => {
                      setUploadProjectId(e.target.value)
                      setUploadGoalId('')
                    }}
                    className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="">Selecione um projeto</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {uploadProjectId && (
                  <div>
                    <label className="text-sm font-medium">Meta (opcional)</label>
                    <select
                      value={uploadGoalId}
                      onChange={(e) => setUploadGoalId(e.target.value)}
                      className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="">Selecione uma meta</option>
                      {goals
                        .filter(g => g.projectId === uploadProjectId)
                        .map(g => (
                          <option key={g.id} value={g.id}>{g.title}</option>
                        ))
                      }
                    </select>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={closeUploadModal} className="flex-1">
                    Cancelar
                  </Button>
                  <Button onClick={handleUpload} disabled={isUploading} className="flex-1">
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Enviar
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

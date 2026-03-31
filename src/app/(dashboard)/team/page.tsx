'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Mail, Phone, UserPlus, Edit, Trash2, Shield, User } from 'lucide-react'

type TeamMember = {
  id: string
  name: string
  email: string
  phone: string | null
  role: 'ADMIN' | 'MEMBER'
  status: 'PENDING' | 'ACTIVE' | 'INACTIVE'
  createdAt: string
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)

  // Form states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/users')
      if (res.ok) {
        const data = await res.json()
        setMembers(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Erro ao buscar membros:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone: phone || undefined, role }),
      })

      if (res.ok) {
        await fetchMembers()
        resetForm()
        setIsInviteOpen(false)
      } else {
        const error = await res.json()
        alert(error.error || 'Erro ao convidar membro')
      }
    } catch (error) {
      console.error('Erro ao convidar membro:', error)
      alert('Erro ao convidar membro')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingMember || !name.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/users/${editingMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone: phone || undefined, role }),
      })

      if (res.ok) {
        await fetchMembers()
        resetForm()
        setIsEditOpen(false)
        setEditingMember(null)
      } else {
        const error = await res.json()
        alert(error.error || 'Erro ao atualizar membro')
      }
    } catch (error) {
      console.error('Erro ao atualizar membro:', error)
      alert('Erro ao atualizar membro')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (member: TeamMember) => {
    if (!confirm(`Deseja realmente remover ${member.name} da equipe?`)) return

    try {
      const res = await fetch(`/api/users/${member.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        await fetchMembers()
      } else {
        const error = await res.json()
        alert(error.error || 'Erro ao remover membro')
      }
    } catch (error) {
      console.error('Erro ao remover membro:', error)
      alert('Erro ao remover membro')
    }
  }

  const resetForm = () => {
    setName('')
    setEmail('')
    setPhone('')
    setRole('MEMBER')
  }

  const openEditModal = (member: TeamMember) => {
    setEditingMember(member)
    setName(member.name)
    setEmail(member.email)
    setPhone(member.phone || '')
    setRole(member.role)
    setIsEditOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Ativo</span>
      case 'PENDING':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">Pendente</span>
      case 'INACTIVE':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">Inativo</span>
      default:
        return null
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700">
            <Shield className="h-3 w-3" />
            Admin
          </span>
        )
      case 'MEMBER':
        return (
          <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
            <User className="h-3 w-3" />
            Membro
          </span>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <DashboardHeader title="Equipe" subtitle="Gerencie os membros do seu time" />
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader title="Equipe" subtitle="Gerencie os membros do seu time" />

      <div className="p-6">
        {/* Header com botão de adicionar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[var(--muted-foreground)]">
              {members.length} {members.length === 1 ? 'membro' : 'membros'} na equipe
            </p>
          </div>

          <Button className="gap-2" onClick={() => setIsInviteOpen(true)}>
            <UserPlus className="h-4 w-4" />
            Convidar Membro
          </Button>

          <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Convidar Membro</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleInvite} className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium">Nome *</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nome completo"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Email *</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@empresa.com"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Telefone (WhatsApp)</label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+55 11 99999-9999"
                    className="mt-1"
                  />
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">
                    Usado para envio de lembretes via WhatsApp
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium">Papel</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'ADMIN' | 'MEMBER')}
                    className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="MEMBER">Membro</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsInviteOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Convidando...' : 'Convidar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de membros */}
        {members.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhum membro na equipe</h3>
              <p className="text-[var(--muted-foreground)] mb-4">
                Convide membros para colaborar nos seus OKRs
              </p>
              <Button onClick={() => setIsInviteOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Convidar Primeiro Membro
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <Card key={member.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-bold text-lg">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold truncate">{member.name}</h4>
                        <div className="flex gap-2 mt-1">
                          {getRoleBadge(member.role)}
                          {getStatusBadge(member.status)}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditModal(member)}
                        className="p-2 hover:bg-[var(--accent)] rounded-lg"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4 text-[var(--muted-foreground)]" />
                      </button>
                      <button
                        onClick={() => handleDelete(member)}
                        className="p-2 hover:bg-red-50 rounded-lg"
                        title="Remover"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    {member.phone && (
                      <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                        <Phone className="h-4 w-4" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Modal de Edição */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Membro</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium">Nome *</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome completo"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={email}
                  disabled
                  className="mt-1 bg-[var(--muted)]"
                />
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  O email não pode ser alterado
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Telefone (WhatsApp)</label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+55 11 99999-9999"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Papel</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'ADMIN' | 'MEMBER')}
                  className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="MEMBER">Membro</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

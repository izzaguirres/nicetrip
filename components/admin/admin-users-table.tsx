"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { AdminUser } from '@/lib/admin-users'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AdminUserForm } from './admin-user-form'
import { useToast } from '@/hooks/use-toast'
import { AdminSurface } from '@/components/admin/surface'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Plus, UserCog, Trash2, Pencil, ShieldCheck } from 'lucide-react'

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  editor: 'Editor',
  viewer: 'Visualizador',
}

const getInitials = (name?: string | null, email?: string | null) => {
  const source = name || email || '?'
  return source
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

interface AdminUsersTableProps {
  users: AdminUser[]
  currentUserId?: string
  currentUser?: AdminUser
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

export function AdminUsersTable({ users, currentUserId, currentUser }: AdminUsersTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [removing, setRemoving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleRemove = async (userId: string) => {
    if (!confirm('Tem certeza que deseja revogar acesso deste usuário?')) return
    setRemoving(userId)
    setError(null)
    try {
      const response = await fetch(`/api/admin/users?user_id=${userId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Falha ao remover usuário')
      }
      toast({
        title: 'Acesso revogado',
        description: 'O usuário não pode mais acessar o painel.',
      })
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
      toast({
        variant: 'destructive',
        title: 'Falha ao revogar acesso',
        description: err instanceof Error ? err.message : 'Erro inesperado',
      })
    } finally {
      setRemoving(null)
    }
  }

  const openCreateForm = () => {
    setFormMode('create')
    setSelectedUser(null)
    setOpen(true)
  }

  const openEditForm = (user: AdminUser) => {
    setFormMode('edit')
    setSelectedUser(user)
    setOpen(true)
  }

  const openMyProfile = () => {
    if (currentUser) {
      openEditForm(currentUser)
    } else {
      toast({ title: 'Erro', description: 'Perfil não encontrado.', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Usuários & Permissões</h2>
          <p className="text-sm text-slate-500 mt-1">
            Gerencie o acesso da equipe ao painel administrativo.
          </p>
        </div>
        <div className="flex gap-2">
          {currentUser && (
            <Button
              variant="outline"
              onClick={openMyProfile}
              className="gap-2 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <UserCog className="h-4 w-4" />
              Meu Perfil
            </Button>
          )}
          <Button
            onClick={openCreateForm}
            className="bg-orange-600 hover:bg-orange-700 text-white shadow-sm gap-2"
          >
            <Plus className="h-4 w-4" /> Novo Usuário
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

      <AdminSurface className="overflow-hidden p-0 shadow-sm border border-slate-200">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="border-b border-slate-100 hover:bg-transparent">
              <TableHead className="w-[300px]">Usuário</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Data de Cadastro</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.user_id} className="border-b border-slate-50 hover:bg-slate-50/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-slate-100">
                      <AvatarImage src={user.avatar_url || undefined} alt={user.display_name ?? user.email} />
                      <AvatarFallback className="bg-orange-50 text-orange-600 font-bold text-xs">{getInitials(user.display_name, user.email)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-slate-900">{user.display_name || 'Usuário sem nome'}</div>
                      <div className="text-xs text-slate-500">{user.email || 'Email oculto'}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-slate-600">{user.phone || '—'}</div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={`rounded-md px-2 py-0.5 font-medium border-0 ${
                        user.role === 'admin' 
                            ? 'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-700/10' 
                            : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {user.role === 'admin' && <ShieldCheck className="w-3 h-3 mr-1" />}
                    {ROLE_LABELS[user.role ?? 'admin'] || user.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-500 text-sm font-mono">{formatDate(user.created_at)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-600" onClick={() => openEditForm(user)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(user.user_id)}
                      disabled={removing === user.user_id || user.user_id === currentUserId}
                      className="h-8 w-8 p-0 text-slate-500 hover:text-red-600 hover:bg-red-50 disabled:opacity-30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-slate-500">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </AdminSurface>

      <AdminUserForm
        open={open}
        onOpenChange={(value) => {
          setOpen(value)
          if (!value) setSelectedUser(null)
        }}
        mode={formMode}
        initialUser={selectedUser ?? undefined}
        onSaved={() => router.refresh()}
      />
    </div>
  )
}

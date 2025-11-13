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

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  editor: 'Editor',
  viewer: 'Operação',
}

const roleBadgeVariant = (role?: string | null) => {
  switch (role) {
    case 'admin':
      return 'default'
    case 'editor':
      return 'secondary'
    default:
      return 'outline'
  }
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
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

export function AdminUsersTable({ users, currentUserId }: AdminUsersTableProps) {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Usuários administradores</h2>
          <p className="text-sm text-slate-500">
            Controle quem possui acesso ao cockpit e mantenha a operação segura.
          </p>
        </div>
        <Button
          onClick={openCreateForm}
          className="rounded-full bg-gradient-to-br from-orange-400 to-orange-500 px-5 text-white shadow-lg hover:from-orange-500 hover:to-orange-600"
        >
          Novo usuário
        </Button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <AdminSurface className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.user_id} className="transition hover:bg-white/70">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.avatar_url || undefined} alt={user.display_name ?? user.email} />
                      <AvatarFallback>{getInitials(user.display_name, user.email)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-slate-900">{user.display_name || 'Sem nome'}</div>
                      <div className="text-xs text-muted-foreground">{user.email || user.user_id}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-slate-600">{user.phone || '—'}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={roleBadgeVariant(user.role)} className="uppercase tracking-wide">
                    {ROLE_LABELS[user.role ?? 'admin'] || user.role || 'Admin'}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(user.created_at)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditForm(user)}>
                      Editar
                    </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(user.user_id)}
                    disabled={removing === user.user_id || user.user_id === currentUserId}
                    className="rounded-full text-red-500 hover:bg-red-50"
                  >
                    Revogar
                  </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                  Nenhum usuário cadastrado ainda.
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

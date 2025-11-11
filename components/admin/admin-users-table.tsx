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

interface AdminUsersTableProps {
  users: AdminUser[]
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

export function AdminUsersTable({ users }: AdminUsersTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
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
          onClick={() => setOpen(true)}
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
              <TableHead>Email</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead>Função</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.user_id} className="transition hover:bg-white/70">
                <TableCell className="font-medium">{user.email || user.user_id}</TableCell>
                <TableCell>{formatDate(user.created_at)}</TableCell>
                <TableCell>{user.role ?? 'admin'}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(user.user_id)}
                    disabled={removing === user.user_id}
                    className="rounded-full text-red-500 hover:bg-red-50"
                  >
                    Revogar
                  </Button>
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

      <AdminUserForm open={open} onOpenChange={setOpen} />
    </div>
  )
}

import { listAdminUsers } from '@/lib/admin-users'
import { AdminUsersTable } from '@/components/admin/admin-users-table'

export default async function AdminUsersPage() {
  const users = await listAdminUsers()

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Usuários do painel</h1>
        <p className="text-muted-foreground">
          Gerencie quem pode acessar o admin da Nice Trip.
        </p>
      </div>
      <AdminUsersTable users={users} />
    </div>
  )
}


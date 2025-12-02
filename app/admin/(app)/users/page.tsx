import { listAdminUsers } from '@/lib/admin-users'
import { AdminUsersTable } from '@/components/admin/admin-users-table'
import { supabaseServer } from '@/app/supabase-server'

export default async function AdminUsersPage() {
  const users = await listAdminUsers()
  const supabase = await supabaseServer()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const currentUserId = session?.user?.id
  const currentUser = users.find(u => u.user_id === currentUserId)

  return (
    <div>
      <AdminUsersTable users={users} currentUserId={currentUserId} currentUser={currentUser} />
    </div>
  )
}

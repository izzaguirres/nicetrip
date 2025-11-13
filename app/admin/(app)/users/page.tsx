import { listAdminUsers } from '@/lib/admin-users'
import { AdminUsersTable } from '@/components/admin/admin-users-table'
import { ProfileSettingsCard } from '@/components/admin/profile-settings-card'
import { supabaseServer } from '@/app/supabase-server'

export default async function AdminUsersPage() {
  const users = await listAdminUsers()
  const supabase = await supabaseServer()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  let profile: { displayName: string; phone: string; avatarUrl: string; email: string } | null = null
  let currentUserId: string | undefined

  if (session?.user) {
    currentUserId = session.user.id
    const { data: adminRecord } = await supabase
      .from('admin_users')
      .select('display_name, phone, avatar_url')
      .eq('user_id', session.user.id)
      .maybeSingle()

    profile = {
      displayName: adminRecord?.display_name ?? '',
      phone: adminRecord?.phone ?? '',
      avatarUrl: adminRecord?.avatar_url ?? '',
      email: session.user.email ?? '',
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Usuários do painel</h1>
        <p className="text-muted-foreground">
          Gerencie quem pode acessar o admin da Nice Trip.
        </p>
      </div>
      <ProfileSettingsCard profile={profile} />
      <AdminUsersTable users={users} currentUserId={currentUserId} />
    </div>
  )
}

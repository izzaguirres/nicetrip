'use server'

import { createClient } from '@supabase/supabase-js'
import { supabaseServer } from '@/app/supabase-server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL não configurada')
}

const supabaseService = serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null

export interface AdminUser {
  user_id: string
  email: string
  role: string | null
  created_at: string
}

export async function listAdminUsers(): Promise<AdminUser[]> {
  const client = supabaseService ?? (await supabaseServer())
  const { data, error } = await client
    .from('admin_users')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Erro ao listar admin_users: ${error.message}`)
  }

  const entries = data ?? []
  if (!entries.length || !supabaseService) {
    return entries.map((entry) => ({ ...entry, email: '' }))
  }

  const { data: userList, error: listError } = await supabaseService.auth.admin.listUsers({ perPage: 1000 })
  if (listError) {
    throw new Error(`Erro ao buscar usuários: ${listError.message}`)
  }

  const emailMap = new Map<string, string>()
  userList.users.forEach((user) => {
    if (user.email && user.id) {
      emailMap.set(user.id, user.email)
    }
  })

  return entries.map((entry) => ({
    user_id: entry.user_id,
    role: entry.role ?? null,
    created_at: entry.created_at,
    email: emailMap.get(entry.user_id) ?? '',
  }))
}

export async function createAdminUser({
  email,
  password,
  role = 'admin',
}: {
  email: string
  password: string
  role?: string
}) {
  if (!supabaseService) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY não configurada')
  }

  const { data, error } = await supabaseService.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error) {
    throw new Error(`Erro ao criar usuário: ${error.message}`)
  }

  const userId = data.user?.id
  if (!userId) {
    throw new Error('Usuário criado, porém sem ID retornado')
  }

  const client = supabaseService ?? (await supabaseServer())
  const { error: insertError } = await client.from('admin_users').insert({
    user_id: userId,
    role,
  })

  if (insertError) {
    throw new Error(`Erro ao registrar admin: ${insertError.message}`)
  }

  return { userId }
}

export async function removeAdminUser(userId: string, { deleteAuthUser = false } = {}) {
  const client = supabaseService ?? (await supabaseServer())
  const { error } = await client.from('admin_users').delete().eq('user_id', userId)
  if (error) {
    throw new Error(`Erro ao remover admin: ${error.message}`)
  }

  if (deleteAuthUser && supabaseService) {
    const { error: deleteError } = await supabaseService.auth.admin.deleteUser(userId)
    if (deleteError) {
      throw new Error(`Usuário removido da tabela, mas falhou ao apagar credenciais: ${deleteError.message}`)
    }
  }
}

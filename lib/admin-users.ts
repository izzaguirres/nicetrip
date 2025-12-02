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
  display_name: string | null
  phone: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string | null
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
    return entries.map((entry) => ({
      user_id: entry.user_id,
      role: entry.role ?? null,
      created_at: entry.created_at,
      updated_at: entry.updated_at ?? null,
      display_name: entry.display_name ?? null,
      phone: entry.phone ?? null,
      avatar_url: entry.avatar_url ?? null,
      email: '',
    }))
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
    updated_at: entry.updated_at ?? null,
    display_name: entry.display_name ?? null,
    phone: entry.phone ?? null,
    avatar_url: entry.avatar_url ?? null,
    email: emailMap.get(entry.user_id) ?? '',
  }))
}

export async function createAdminUser({
  email,
  password,
  role = 'admin',
  displayName,
  phone,
  avatarUrl,
}: {
  email: string
  password: string
  role?: string
  displayName?: string
  phone?: string
  avatarUrl?: string
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
    display_name: displayName ?? null,
    phone: phone ?? null,
    avatar_url: avatarUrl ?? null,
  })

  if (insertError) {
    throw new Error(`Erro ao registrar admin: ${insertError.message}`)
  }

  return { userId }
}

export async function updateAdminUserProfile({
  userId,
  displayName,
  phone,
  avatarUrl,
  role,
}: {
  userId: string
  displayName?: string | null
  phone?: string | null
  avatarUrl?: string | null
  role?: string | null
}) {
  const client = supabaseService ?? (await supabaseServer())
  const payload: Record<string, unknown> = {}
  if (displayName !== undefined) payload.display_name = displayName
  if (phone !== undefined) payload.phone = phone
  if (avatarUrl !== undefined) payload.avatar_url = avatarUrl
  if (role !== undefined) payload.role = role

  if (Object.keys(payload).length === 0) return

  const executeUpdate = async (data: Record<string, unknown>) =>
    client.from('admin_users').update(data).eq('user_id', userId)

  let attemptPayload = { ...payload }
  let { error } = await executeUpdate(attemptPayload)

  if (error && error.code === '42703' && error.message) {
    const match = error.message.match(/column "([^"]+)"/i)
    if (match?.[1]) {
      delete attemptPayload[match[1]]
      if (Object.keys(attemptPayload).length) {
        ({ error } = await executeUpdate(attemptPayload))
      } else {
        error = null
      }
    }
  }

  if (error) {
    throw new Error(`Erro ao atualizar usuário: ${error.message}`)
  }
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

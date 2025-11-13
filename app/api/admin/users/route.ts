'use server'

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseServer } from '@/app/supabase-server'
import { createAdminUser, removeAdminUser, updateAdminUserProfile } from '@/lib/admin-users'
import { ADMIN_USER_ROLES } from '@/lib/admin-user-roles'

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(ADMIN_USER_ROLES).optional(),
  display_name: z.string().max(120).nullable().optional(),
  phone: z.string().max(40).nullable().optional(),
  avatar_url: z.string().url().nullable().optional(),
})

const updateSchema = z.object({
  user_id: z.string().uuid().optional(),
  display_name: z.string().max(120).nullable().optional(),
  phone: z.string().max(40).nullable().optional(),
  avatar_url: z.string().url().nullable().optional(),
  role: z.enum(ADMIN_USER_ROLES).optional(),
})

const sanitizeText = (value: unknown) => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

const sanitizeUrl = (value: unknown) => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed
}

export async function POST(request: Request) {
  try {
    const raw = await request.json()
    const body = {
      ...raw,
      display_name: sanitizeText(raw.display_name),
      phone: sanitizeText(raw.phone),
      avatar_url: sanitizeUrl(raw.avatar_url),
    }
    const { email, password, role, display_name, phone, avatar_url } = createSchema.parse(body)

    const supabase = await supabaseServer()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await createAdminUser({
      email,
      password,
      role,
      displayName: display_name ?? undefined,
      phone: phone ?? undefined,
      avatarUrl: avatar_url ?? undefined,
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao criar usuário' },
      { status: 400 },
    )
  }
}

export async function PUT(request: Request) {
  try {
    const raw = await request.json()
    const body = {
      ...raw,
      display_name: sanitizeText(raw.display_name),
      phone: sanitizeText(raw.phone),
      avatar_url: sanitizeUrl(raw.avatar_url),
    }
    const parsed = updateSchema.parse(body)

    const supabase = await supabaseServer()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const targetUserId = parsed.user_id ?? session.user.id

    await updateAdminUserProfile({
      userId: targetUserId,
      displayName: parsed.display_name === undefined ? undefined : parsed.display_name,
      phone: parsed.phone === undefined ? undefined : parsed.phone,
      avatarUrl: parsed.avatar_url === undefined ? undefined : parsed.avatar_url,
      role: parsed.role,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao atualizar usuário' },
      { status: 400 },
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    if (!userId) {
      return NextResponse.json({ error: 'user_id obrigatório' }, { status: 400 })
    }

    const supabase = await supabaseServer()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const deleteAuth = searchParams.get('delete_auth') === 'true'
    await removeAdminUser(userId, { deleteAuthUser: deleteAuth })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao remover usuário' },
      { status: 400 },
    )
  }
}

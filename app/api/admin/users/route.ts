'use server'

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseServer } from '@/app/supabase-server'
import { createAdminUser, removeAdminUser } from '@/lib/admin-users'

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, role } = createSchema.parse(body)

    const supabase = await supabaseServer()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await createAdminUser({ email, password, role })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao criar usuário' },
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

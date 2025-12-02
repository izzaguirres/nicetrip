'use server'

import { NextResponse } from 'next/server'
import { supabaseServer } from '@/app/supabase-server'
import { listDiscountRules, upsertDiscountRule, deleteDiscountRule } from '@/lib/admin-discounts'
import { z } from 'zod'

const payloadSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2),
  transport_type: z.string().max(50).nullable().optional(),
  destinations: z.array(z.string().min(1)).optional(),
  package_slugs: z.array(z.string().min(1)).optional(),
  hotel_names: z.array(z.string().min(1)).optional(),
  age_groups: z.array(z.string().min(1)).optional(),
  age_min: z.number().int().min(0).nullable().optional(),
  age_max: z.number().int().min(0).nullable().optional(),
  amount: z.number(),
  amount_currency: z.string().length(3),
  amount_type: z.enum(['fixed', 'percent']),
  valid_from: z.string().nullable().optional(),
  valid_to: z.string().nullable().optional(),
  is_active: z.boolean(),
})

export async function GET() {
  try {
    const records = await listDiscountRules()
    return NextResponse.json({ records })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao listar regras' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = payloadSchema.parse(body)
    const supabase = await supabaseServer()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const record = await upsertDiscountRule(parsed, session?.user.id)
    return NextResponse.json({ record })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao salvar regra' },
      { status: 400 },
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })
    }
    const supabase = await supabaseServer()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    await deleteDiscountRule(id, session?.user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao remover regra' },
      { status: 400 },
    )
  }
}

'use server'

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseServer } from '@/app/supabase-server'
import { deletePromotion, listPromotions, reorderPromotions, upsertPromotion } from '@/lib/admin-promotions'

const promotionSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.enum(['paquete', 'hospedaje', 'paseo']),
  position: z.number().int().min(0).optional(),
  title: z.string().min(2),
  subtitle: z.string().nullable().optional(),
  destino: z.string().nullable().optional(),
  hotel: z.string().nullable().optional(),
  transporte: z.string().nullable().optional(),
  departure_date: z.string().nullable().optional(),
  slug_disponibilidade: z.string().nullable().optional(),
  slug_hospedagem: z.string().nullable().optional(),
  slug_paseo: z.string().nullable().optional(),
  price_single: z.number().nullable().optional(),
  price_double: z.number().nullable().optional(),
  price_triple: z.number().nullable().optional(),
  price_quad: z.number().nullable().optional(),
  price_quint: z.number().nullable().optional(),
  cta_label: z.string().nullable().optional(),
  cta_url: z.string().nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  valid_until: z.string().nullable().optional(),
  auto_hide: z.boolean().optional(),
  is_active: z.boolean().optional(),
})

const reorderSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') as 'paquete' | 'hospedaje' | 'paseo' | null
  try {
    const records = await listPromotions(type ?? undefined)
    return NextResponse.json({ records })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao listar promoções' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = promotionSchema.parse(body)
    const supabase = await supabaseServer()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const record = await upsertPromotion(parsed, session?.user.id)
    return NextResponse.json({ record })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao salvar promoção' },
      { status: 400 },
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const parsed = reorderSchema.parse(body)
    await reorderPromotions(parsed.ids)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao reordenar promoções' },
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
    await deletePromotion(id, session?.user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao remover promoção' },
      { status: 400 },
    )
  }
}

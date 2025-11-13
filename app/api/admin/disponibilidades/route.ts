'use server'

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseServer } from '@/app/supabase-server'
import {
  deleteDisponibilidade,
  listAdminDisponibilidades,
  upsertDisponibilidade,
} from '@/lib/admin-disponibilidades'

const availabilitySchema = z.object({
  id: z.number().int().positive().optional(),
  destino: z.string().min(2),
  data_saida: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  transporte: z.string().min(2),
  hotel: z.string().min(2),
  quarto_tipo: z.string().optional(),
  slug: z.string().optional().nullable(),
  slug_hospedagem: z.string().optional().nullable(),
  slug_pacote: z.string().optional().nullable(),
  slug_pacote_principal: z.string().optional().nullable(),
  capacidade: z.coerce.number().int().min(0).nullable().optional(),
  preco_adulto: z.coerce.number().min(0).nullable().optional(),
  preco_crianca_0_3: z.coerce.number().min(0).nullable().optional(),
  preco_crianca_4_5: z.coerce.number().min(0).nullable().optional(),
  preco_crianca_6_mais: z.coerce.number().min(0).nullable().optional(),
  preco_adulto_aereo: z.coerce.number().min(0).nullable().optional(),
  preco_crianca_0_2_aereo: z.coerce.number().min(0).nullable().optional(),
  preco_crianca_2_5_aereo: z.coerce.number().min(0).nullable().optional(),
  preco_crianca_6_mais_aereo: z.coerce.number().min(0).nullable().optional(),
  taxa_aereo_por_pessoa: z.coerce.number().min(0).nullable().optional(),
  noites_hotel: z.coerce.number().int().min(0).nullable().optional(),
  dias_viagem: z.coerce.number().int().min(0).nullable().optional(),
  dias_totais: z.coerce.number().int().min(0).nullable().optional(),
  link_imagem: z.string().optional().nullable(),
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const destino = searchParams.get('destino') || undefined
    const transporte = searchParams.get('transporte') || undefined
    const data_saida = searchParams.get('data_saida') || undefined
    const hotel = searchParams.get('hotel') || undefined
    const limit = Number(searchParams.get('limit') || '50')
    const page = Number(searchParams.get('page') || '1')
    const offset = Math.max(0, (page - 1) * limit)

    const result = await listAdminDisponibilidades({
      destino,
      transporte,
      data_saida,
      hotel,
      limit,
      offset,
    })

    return NextResponse.json({
      records: result.records,
      total: result.total,
      page,
      limit,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao listar disponibilidades' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = availabilitySchema.parse(body)
    const supabase = await supabaseServer()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const record = await upsertDisponibilidade(parsed, session?.user.id)
    return NextResponse.json({ record })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao salvar disponibilidade' },
      { status: 400 },
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const idParam = searchParams.get('id')
    if (!idParam) {
      return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })
    }
    const id = Number(idParam)
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const supabase = await supabaseServer()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    await deleteDisponibilidade(id, session?.user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao remover disponibilidade' },
      { status: 400 },
    )
  }
}

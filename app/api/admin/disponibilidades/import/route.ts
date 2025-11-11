'use server'

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseServer } from '@/app/supabase-server'
import {
  parseDisponibilidadeCsv,
  upsertDisponibilidade,
  type DisponibilidadeUpsertInput,
} from '@/lib/admin-disponibilidades'

const payloadSchema = z.object({
  csv: z.string().min(1),
  dryRun: z.boolean().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { csv, dryRun } = payloadSchema.parse(body)

    const rows = parseDisponibilidadeCsv(csv)

    if (rows.length === 0) {
      return NextResponse.json({ imported: 0, message: 'Nenhum registro encontrado no CSV.' })
    }

    if (dryRun) {
      return NextResponse.json({ imported: rows.length, dryRun: true })
    }

    const supabase = await supabaseServer()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const userId = session?.user.id
    let success = 0
    const errors: Array<{ index: number; error: string }> = []

    for (let index = 0; index < rows.length; index += 1) {
      const payload: DisponibilidadeUpsertInput = rows[index]
      try {
        await upsertDisponibilidade(payload, userId)
        success += 1
      } catch (error) {
        errors.push({ index: index + 2, error: (error as Error).message })
      }
    }

    return NextResponse.json({ imported: success, errors })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao importar CSV' },
      { status: 400 },
    )
  }
}

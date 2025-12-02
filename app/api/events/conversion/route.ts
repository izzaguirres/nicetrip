'use server'

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { insertConversionEvent } from '@/lib/supabase-service'

const payloadSchema = z.object({
  context: z.record(z.any()).optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = payloadSchema.parse(body)
    await insertConversionEvent({
      context: parsed.context ?? null,
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao registrar conversão' },
      { status: 400 },
    )
  }
}


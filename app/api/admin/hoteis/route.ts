import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/app/supabase-server"
import { insertAuditLog } from "@/lib/supabase-service"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, slug, nome, destino, descricao_completa, images, amenities, highlights } = body

    if (!slug || !nome) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    const supabase = await supabaseServer()
    
    const record = {
      slug,
      nome,
      destino,
      descricao_completa,
      images,
      comodidades: amenities,
      highlights
    }

    // Upsert baseado no slug
    const { data, error } = await supabase
      .from('hospedagens')
      .upsert(record, { onConflict: 'slug' })
      .select()
      .single()

    if (error) throw error

    // Log
    await insertAuditLog({
      entity: 'hospedagem',
      entityId: data.id,
      action: id ? 'update' : 'create',
      data: record,
      performedBy: 'admin' // Pegar do session se possível, mas aqui simplificado
    }, supabase)

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao salvar hotel:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno" },
      { status: 500 }
    )
  }
}

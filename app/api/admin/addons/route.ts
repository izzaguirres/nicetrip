import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { upsertAddon, deleteAddon } from "@/lib/admin-addons"

// Inicializar cliente Supabase com Service Role para admin
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticação (básico, ideal usar middleware + getUser)
    // Como estamos num ambiente controlado admin, assumimos que o middleware já protegeu a rota /admin
    
    const body = await req.json()
    const addon = await upsertAddon(body)
    
    return NextResponse.json(addon)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID obrigatório" }, { status: 400 })
    }

    await deleteAddon(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno" },
      { status: 500 }
    )
  }
}

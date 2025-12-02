import { supabaseServer } from '@/app/supabase-server'

export async function getHotelBySlug(slug: string) {
  const supabase = await supabaseServer()
  const { data, error } = await supabase
    .from('hospedagens')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function getHotelByName(nome: string) {
  const supabase = await supabaseServer()
  const { data, error } = await supabase
    .from('hospedagens')
    .select('*')
    .ilike('nome', `%${nome}%`)
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function upsertHotel(data: any) {
  // Essa função será chamada via API Route, não diretamente aqui no server component se for usada em Client Component via fetch
  // Mas deixamos aqui para referência ou uso server-side
  const supabase = await supabaseServer()
  // ...
}

import { supabaseAdmin } from './admin-hoteis'
import { clearCache } from './supabase-service'

export interface CidadeSaida {
  id?: number
  cidade: string
  provincia: string
  pais: string
  transporte: string
  ativo: boolean
  ordem?: number
}

export async function getCidadesSaidaAdmin() {
  const { data, error } = await supabaseAdmin
    .from('cidades_saida')
    .select('*')
    .order('transporte', { ascending: true })
    .order('cidade', { ascending: true })

  if (error) throw error
  return data as CidadeSaida[]
}

export async function upsertCidadeSaida(cidade: CidadeSaida) {
  const payload = { ...cidade }
  
  let query;
  
  if (payload.id) {
    // Update explícito
    const updateData = {
        cidade: payload.cidade,
        provincia: payload.provincia,
        pais: payload.pais,
        transporte: payload.transporte,
        ativo: payload.ativo
    }
    
    query = supabaseAdmin
      .from('cidades_saida')
      .update(updateData)
      .eq('id', payload.id)
      .select()
      .maybeSingle()
  } else {
    // Insert explícito
    delete payload.id // garante que não vai id undefined
    query = supabaseAdmin
      .from('cidades_saida')
      .insert(payload)
      .select()
      .maybeSingle()
  }

  const { data, error } = await query

  if (error) throw error
  
  // Limpar cache do frontend
  clearCache()
  
  return data
}

export async function deleteCidadeSaida(id: number) {
  const { error } = await supabaseAdmin
    .from('cidades_saida')
    .delete()
    .eq('id', id)

  if (error) throw error
  
  // Limpar cache
  clearCache()
}

export async function toggleCidadeSaidaStatus(id: number, currentStatus: boolean) {
  const { error } = await supabaseAdmin
    .from('cidades_saida')
    .update({ ativo: !currentStatus })
    .eq('id', id)

  if (error) throw error
  
  clearCache()
}

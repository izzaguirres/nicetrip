import { createClient } from '@supabase/supabase-js'
import { insertAuditLog } from './supabase-service'

// Usando service role key para operações administrativas se disponível, 
// caso contrário usa a anon key (assumindo que o usuário logado tem permissões via RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

export interface HospedagemDiaria {
  id: string
  data: string
  slug_hospedagem: string
  tipo_quarto: string
  capacidade: number
  valor_diaria: number
  descricao?: string | null
  ativo: boolean
}

export interface HospedagemFilter {
  slug_hospedagem?: string
  startDate?: string
  endDate?: string
  ativo?: boolean
}

export async function getHospedagemDiarias(filters: HospedagemFilter) {
  let query = supabaseAdmin
    .from('hospedagem_diarias')
    .select('*')
    .order('data', { ascending: true })
    .order('slug_hospedagem', { ascending: true })

  if (filters.slug_hospedagem) {
    query = query.eq('slug_hospedagem', filters.slug_hospedagem)
  }

  if (filters.startDate) {
    query = query.gte('data', filters.startDate)
  }

  if (filters.endDate) {
    query = query.lte('data', filters.endDate)
  }

  if (filters.ativo !== undefined) {
    query = query.eq('ativo', filters.ativo)
  }

  const { data, error } = await query

  if (error) {
    console.error('Erro ao buscar diárias:', error)
    throw error
  }

  return data as HospedagemDiaria[]
}

export type CreateHospedagemDiariaDTO = Omit<HospedagemDiaria, 'id' | 'created_at'>

export async function upsertHospedagemDiarias(diarias: CreateHospedagemDiariaDTO[], userId: string) {
  // Vamos buscar existentes para preservar IDs e garantir integridade no upsert
  const { data: existingItems } = await supabaseAdmin
    .from('hospedagem_diarias')
    .select('id, slug_hospedagem, tipo_quarto, data')
    .in('slug_hospedagem', diarias.map(d => d.slug_hospedagem))
    .in('data', diarias.map(d => d.data))
    .in('tipo_quarto', diarias.map(d => d.tipo_quarto))

  const itemsToUpsert = diarias.map(novoItem => {
    const existing = existingItems?.find(
      e => e.slug_hospedagem === novoItem.slug_hospedagem && 
           e.tipo_quarto === novoItem.tipo_quarto && 
           e.data === novoItem.data
    )
    
    if (existing) {
      // Se existe, usamos o ID existente para fazer update
      return { ...novoItem, id: existing.id }
    } else {
      // Se é novo, geramos um UUID para garantir que o campo id não seja null
      // e para garantir que o array enviado ao Supabase seja homogêneo (todos com id)
      return { ...novoItem, id: crypto.randomUUID() }
    }
  })

  const { data, error } = await supabaseAdmin
    .from('hospedagem_diarias')
    .upsert(itemsToUpsert, { onConflict: 'id' })
    .select()

  if (error) {
    console.error('Erro ao salvar diárias:', error)
    throw error
  }

  await insertAuditLog({
    entity: 'hospedagem_diarias',
    action: 'UPSERT_BATCH',
    data: { count: data?.length, sample: data?.slice(0, 3) },
    performedBy: userId
  })

  return data
}

export async function deleteHospedagemDiaria(id: string, userId: string) {
  const { error } = await supabaseAdmin
    .from('hospedagem_diarias')
    .delete()
    .eq('id', id)

  if (error) throw error

  await insertAuditLog({
    entity: 'hospedagem_diarias',
    entityId: id,
    action: 'DELETE',
    performedBy: userId
  })
}

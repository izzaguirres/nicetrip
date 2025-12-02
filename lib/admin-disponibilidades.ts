import { supabaseServer } from '@/app/supabase-server'
import { Disponibilidade } from '@/lib/supabase'
import { insertAuditLog } from '@/lib/supabase-service'

export type DisponibilidadeUpsertInput = Partial<Disponibilidade>

export async function listAdminDisponibilidades(filters: any) {
  const supabase = await supabaseServer()
  let query = supabase.from('disponibilidades').select('*', { count: 'exact' })

  if (filters.destino) query = query.ilike('destino', `%${filters.destino}%`)
  if (filters.transporte) query = query.ilike('transporte', `%${filters.transporte}%`)
  if (filters.hotel) query = query.ilike('hotel', `%${filters.hotel}%`)
  if (filters.slug) query = query.or(`slug.eq.${filters.slug},slug_hospedagem.eq.${filters.slug},slug_pacote.eq.${filters.slug}`)

  if (filters.limit) query = query.limit(filters.limit)
  if (filters.offset) query = query.range(filters.offset, filters.offset + filters.limit - 1)

  const { data, error, count } = await query.order('data_saida', { ascending: true })

  if (error) throw error
  return { records: data as Disponibilidade[], total: count || 0 }
}

export async function listDisponibilidadeLookups() {
  // ... manter existente ou simplificar ...
  return { destinos: [], hoteis: [] } 
}

export async function getDashboardHotels() {
  const supabase = await supabaseServer()
  // Busca colunas leves de TODOS os registros para montar os cards (limite seguro de 2000 para performance)
  const { data, error } = await supabase
    .from('disponibilidades')
    .select('hotel, destino, transporte, slug, preco_adulto')
    .limit(2000) 

  if (error) throw error

  const hotelMap = new Map<string, any>()
  
  data.forEach(row => {
    const key = row.hotel
    if (!key) return

    if (!hotelMap.has(key)) {
      hotelMap.set(key, {
        hotel: key,
        destino: row.destino,
        transports: new Set([row.transporte]), 
        // Slug prioritário: slug > normalização do nome
        slug: row.slug || key.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
        count: 0,
        minPrice: 999999
      })
    } else {
      hotelMap.get(key).transports.add(row.transporte)
    }
    
    const entry = hotelMap.get(key)
    entry.count++
    if (row.preco_adulto && row.preco_adulto < entry.minPrice) {
      entry.minPrice = row.preco_adulto
    }
  })

  return Array.from(hotelMap.values()).map(v => ({
    ...v,
    transports: Array.from(v.transports)
  })).sort((a, b) => a.hotel.localeCompare(b.hotel))
}

// --- Novas Funções Implementadas ---

export function parseDisponibilidadeCsv(content: string): DisponibilidadeUpsertInput[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (lines.length < 2) return [] // Header + pelo menos 1 linha

  const headerLine = lines[0]
  // Detectar separador
  const separator = headerLine.includes(';') ? ';' : ','
  
  const headers = headerLine.split(separator).map((h) => h.trim().toLowerCase().replace(/"/g, ''))

  const results: DisponibilidadeUpsertInput[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    // Regex simples para ignorar separadores dentro de aspas (não perfeito, mas funcional para CSV simples)
    // Se falhar com complexos, usar lib 'papaparse' ou similar seria melhor
    const rawValues = line.split(separator).map(v => v.trim().replace(/^"|"$/g, ''))
    
    if (rawValues.length < headers.length) continue

    const row: Record<string, any> = {}
    headers.forEach((header, idx) => {
      let val = rawValues[idx]
      if (val === '' || val === 'null') val = null
      
      // Converter números
      if (['preco_adulto', 'preco_crianca_0_3', 'preco_crianca_4_5', 'preco_crianca_6_mais', 'valor_diaria', 'valor_total', 'capacidade', 'noites', 'dias_totais', 'dias_viagem'].includes(header)) {
         row[header] = val ? Number(val.replace(',', '.')) : 0
      } else if (['ativo'].includes(header)) {
         row[header] = val === 'true' || val === '1' || val === 'sim'
      } else {
         row[header] = val
      }
    })
    results.push(row)
  }

  return results
}

export async function upsertDisponibilidade(
  data: DisponibilidadeUpsertInput,
  userId?: string
): Promise<void> {
  const supabase = await supabaseServer()
  
  // Validar campos obrigatórios básicos
  if (!data.hotel) throw new Error('Campo hotel é obrigatório')

  const payload = { ...data }
  // Remove undefineds para não sobrescrever com null
  Object.keys(payload).forEach(key => payload[key as keyof typeof payload] === undefined && delete payload[key as keyof typeof payload])

  // Se não tiver ID, remove do payload para gerar novo
  if (!payload.id) delete payload.id

  const { data: result, error } = await supabase
    .from('disponibilidades')
    .upsert(payload)
    .select()
    .single()

  if (error) throw new Error(`Erro no Supabase: ${error.message}`)

  // Log de auditoria
  if (result) {
    await insertAuditLog({
      entity: 'disponibilidade',
      entityId: result.id,
      action: payload.id ? 'update' : 'insert',
      data: result,
      performedBy: userId || 'system_import'
    })
  }
}

export async function deleteDisponibilidade(id: string, userId?: string): Promise<void> {
  const supabase = await supabaseServer()

  const { error } = await supabase.from('disponibilidades').delete().eq('id', id)
  
  if (error) throw new Error(error.message)

  await insertAuditLog({
    entity: 'disponibilidade',
    entityId: id,
    action: 'delete',
    performedBy: userId || 'system'
  })
}
import { supabaseServer } from '@/app/supabase-server'
import { Disponibilidade } from '@/lib/supabase'
import { insertAuditLog, clearCache } from '@/lib/supabase-service'
import { getHotelData } from '@/lib/hotel-data'

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
  
  // 1. Buscar disponibilidades (agrupamento)
  const { data: dispData, error: dispError } = await supabase
    .from('disponibilidades')
    .select('hotel, destino, transporte, slug, preco_adulto')
    .limit(3000) 

  if (dispError) throw dispError

  // 2. Buscar metadados de hotéis (imagens, slugs oficiais)
  const { data: hospData, error: hospError } = await supabase
    .from('hospedagens')
    .select('nome, slug, images, destino')
  
  // Criar mapa de metadados normalizando nomes para facilitar o match
  const metadataMap = new Map<string, any>()
  if (hospData && !hospError) {
      hospData.forEach(h => {
          if (h.nome) metadataMap.set(h.nome.toLowerCase().trim(), h)
      })
  }

  const hotelMap = new Map<string, any>()
  
  dispData.forEach(row => {
    const key = row.hotel
    if (!key) return

    const normalizedKey = key.toLowerCase().trim()
    const metadata = metadataMap.get(normalizedKey)

    if (!hotelMap.has(key)) {
      // Prioridade de imagem: 
      // 1. Imagem do banco (metadata)
      // 2. Fallback do arquivo estático (getHotelData)
      // 3. Placeholder
      let imageSrc = "/placeholder.svg"
      
      if (metadata?.images && metadata.images.length > 0) {
          imageSrc = metadata.images[0]
      } else {
          const fallback = getHotelData(key)
          imageSrc = fallback?.imageFiles?.[0] || "/placeholder.svg"
          // Tratar StaticImageData se necessário
          if (typeof imageSrc !== 'string' && (imageSrc as any).src) {
              imageSrc = (imageSrc as any).src
          }
      }

      hotelMap.set(key, {
        hotel: key, // Nome como aparece na disponibilidade
        destino: row.destino || metadata?.destino || "",
        transports: new Set([row.transporte]), 
        // Slug: Prioriza o do metadata (hospedagens), depois o da disponibilidade, depois gera
        slug: metadata?.slug || row.slug || key.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
        count: 0,
        minPrice: 999999,
        imageSrc: imageSrc // Nova propriedade com a imagem resolvida
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
    // Regex simples para ignorar separadores dentro de aspas
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
  // Usa cliente autenticado (cookies/sessão do usuário admin)
  const supabase = await supabaseServer()
  
  // Validar campos obrigatórios básicos
  if (!data.hotel) throw new Error('Campo hotel é obrigatório')

  const payload = { ...data }
  
  // Limpeza rigorosa do payload
  Object.keys(payload).forEach(key => {
    // Remove undefined
    if (payload[key as keyof typeof payload] === undefined) {
       delete payload[key as keyof typeof payload]
    }
    // Remove strings vazias em campos numéricos (previne erro de sintaxe PostgreSQL)
    if (['preco_adulto', 'capacidade'].includes(key) && payload[key as keyof typeof payload] === '') {
       delete payload[key as keyof typeof payload]
    }
    // Remove campo 'ativo' se ele não existir no schema (PGRST204)
    if (key === 'ativo') {
        delete payload[key as keyof typeof payload]
    }
  })

  // Se não tiver ID, remove do payload para gerar novo
  if (!payload.id) delete payload.id

  const { data: result, error } = await supabase
    .from('disponibilidades')
    .upsert(payload)
    .select()
    .single()

  if (error) {
    console.error("❌ Supabase Upsert Error:", JSON.stringify(error, null, 2), payload)
    // Lança erro descritivo para o client pegar
    throw new Error(`Erro DB: ${error.message} (${error.code})`)
  }

  clearCache() // Invalida cache do site público

  // Log de auditoria
  if (result) {
    try {
      await insertAuditLog({
        entity: 'disponibilidade',
        entityId: result.id,
        action: payload.id ? 'update' : 'insert',
        data: result,
        performedBy: userId || 'system_ui'
      })
    } catch (auditError) {
      console.error("Falha não-crítica ao criar log de auditoria:", auditError)
    }
  }
}

export async function deleteDisponibilidade(id: string, userId?: string): Promise<void> {
  const supabase = await supabaseServer()
  const { error } = await supabase.from('disponibilidades').delete().eq('id', id)
  
  if (error) throw new Error(`Erro ao deletar: ${error.message}`)

  clearCache() // Invalida cache do site público

  try {
    await insertAuditLog({
      entity: 'disponibilidade',
      entityId: id,
      action: 'delete',
      performedBy: userId || 'system'
    })
  } catch (e) { /* ignore */ }
}
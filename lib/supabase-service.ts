import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Disponibilidade, DiscountRule, Promotion, PromotionType } from './supabase'
import { createLogger } from './logger'
import { FALLBACK_DISPONIBILIDADES, FALLBACK_ADDONS } from './fallback-data'

// ✅ SERVIÇO ÚNICO DE DADOS - SEMPRE SUPABASE
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Evita crash no build time se variáveis não existirem
if ((!supabaseUrl || !supabaseKey) && process.env.NODE_ENV !== 'production') {
  console.warn('⚠️ SUPABASE CREDENTIALS MISSING - Operations will fail')
}

const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder')
const log = createLogger('supabase-service')
log.debug('🎯 SUPABASE SERVICE: Inicializado com conexão real')
log.debug('🔗 URL configured?', !!supabaseUrl)
log.debug('🔑 Key exists?', !!supabaseKey)

const FALLBACK_ENABLED =
  typeof process !== 'undefined' &&
  (process.env.NEXT_PUBLIC_ENABLE_FALLBACK || '').toLowerCase() === 'true'

// ✅ CACHE INTELIGENTE (5 minutos)
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos
let dataCache: {
  data: any[] | null
  timestamp: number
} = {
  data: null,
  timestamp: 0
}

const PROMOTION_CACHE_DURATION = 60 * 1000
const promotionCache = new Map<string, { timestamp: number; data: Promotion[] }>()

const normalizeText = (value?: string) =>
  (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const matchesNormalizedTarget = (value: string | undefined, targets?: string[] | null) => {
  if (!targets || targets.length === 0) return true
  if (!value) return false
  const normalizedValue = normalizeText(value)
  return targets.map((target) => normalizeText(target)).includes(normalizedValue)
}

const filterFallbackDisponibilidades = (rows: Disponibilidade[], filters?: SearchFilters) => {
  if (!filters) return rows

  return rows.filter((row) => {
    if (filters.destino) {
      const destino = row.destino?.toLowerCase() || ''
      if (!destino.includes(filters.destino.toLowerCase())) return false
    }
    if (filters.transporte) {
      const transporte = normalizeText(row.transporte || '')
      const target = normalizeText(filters.transporte)
      if (transporte !== target) return false
    }
    if (filters.data_saida && row.data_saida < filters.data_saida) return false
    if (filters.preco_min != null && (row.preco_adulto ?? 0) < filters.preco_min) return false
    if (filters.preco_max != null && (row.preco_adulto ?? 0) > filters.preco_max) return false
    if (filters.capacidade_min != null && (row.capacidade ?? 0) < filters.capacidade_min) return false
    return true
  })
}

// ✅ INTERFACE LIMPA PARA FILTROS
export interface SearchFilters {
  destino?: string
  transporte?: string
  data_saida?: string
  cidade_saida?: string
  preco_min?: number
  preco_max?: number
  capacidade_min?: number
}

// ✅ NOVA INTERFACE PARA FILTROS DE HABITACIONES
export interface HabitacionSearchFilters {
  destino?: string;
  checkin?: string;
  checkout?: string;
}

// ✅ FUNÇÃO PRINCIPAL: BUSCAR DADOS REAIS
export async function fetchRealData(filters?: SearchFilters): Promise<any[]> {
  try {
    log.debug('🔍 SUPABASE SERVICE: Buscando dados reais...', filters)

    // ✅ VERIFICAR CACHE PRIMEIRO
    const now = Date.now()
    const cacheValid = dataCache.data && (now - dataCache.timestamp) < CACHE_DURATION
    
    if (cacheValid && !filters) {
      log.debug('⚡ CACHE HIT: Usando dados em cache')
      return dataCache.data!
    }

    // ✅ BUSCAR DADOS FRESCOS DO SUPABASE
    log.debug('🔄 CACHE MISS: Buscando dados frescos do Supabase...')
    
    let query = supabase
      .from('disponibilidades')
      .select('*')
    
    // ✅ APLICAR FILTROS NO SUPABASE (não em JavaScript)
    if (filters?.destino) {
      query = query.ilike('destino', `%${filters.destino}%`)
    }
    
    if (filters?.transporte) {
      // Normalizar Bus/Bús
      const transporteNorm = filters.transporte.replace('ú', 'u').toLowerCase()
      query = query.or(`transporte.ilike.%${filters.transporte}%,transporte.ilike.%${transporteNorm}%`)
    }
    
    if (filters?.data_saida) {
      query = query.gte('data_saida', filters.data_saida)
    }
    
    // Note: cidade_saida is in a separate table 'cidades_saida', not in 'disponibilidades'
    // This filter is not applicable to the disponibilidades table
    
    if (filters?.preco_min) {
      query = query.gte('preco_adulto', filters.preco_min)
    }
    
    if (filters?.preco_max) {
      query = query.lte('preco_adulto', filters.preco_max)
    }
    
    if (filters?.capacidade_min) {
      query = query.gte('capacidade', filters.capacidade_min)
    }

    const { data, error } = await query.order('data_saida', { ascending: true })

    if (error) {
      log.error('❌ SUPABASE ERROR:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    if (!data || data.length === 0) {
      log.debug('⚠️ NO DATA FOUND in Supabase with filters:', filters)
      return []
    }

    log.debug(`✅ SUPABASE SUCCESS: ${data.length} records found`, {
      sample: data.slice(0, 2),
    })

    // ✅ ATUALIZAR CACHE (só para consultas sem filtros)
    if (!filters) {
      dataCache = {
        data,
        timestamp: now,
      }
      log.debug('💾 CACHE UPDATED')
    }

    return data

  } catch (error) {
    log.error('💥 SUPABASE SERVICE ERROR:', error)
    if (FALLBACK_ENABLED) {
      log.warn('⚠️ ENABLE_FALLBACK ativo – retornando dados mockados', {
        filters,
      })
      return filterFallbackDisponibilidades(FALLBACK_DISPONIBILIDADES, filters)
    }
    throw error
  }
}

// ✅ NOVA FUNÇÃO: BUSCAR DADOS DE HABITACIONES
export async function fetchHabitacionesData(filters?: HabitacionSearchFilters): Promise<any[]> {
  try {
    log.debug('🏨 SUPABASE SERVICE: Buscando diárias de habitaciones...', filters)

    let query = supabase.from('hospedagem_diarias').select('*').eq('ativo', true)

    if (filters?.checkin) {
      query = query.gte('data', filters.checkin)
    }
    if (filters?.checkout) {
      // O checkout é o último dia, então buscamos até o dia anterior para contar as noites
      const checkoutDate = new Date(filters.checkout);
      checkoutDate.setDate(checkoutDate.getDate() - 1);
      const checkoutString = checkoutDate.toISOString().split('T')[0];
      query = query.lte('data', checkoutString)
    }
    
    // TODO: Quando houver múltiplos destinos, filtrar por `slug_hospedagem` que pertencem ao `destino`
    // Por enquanto, todos os hotéis são de Canasvieiras.

    const { data, error } = await query.order('valor_diaria', { ascending: true })

    if (error) {
      log.error('❌ SUPABASE ERROR (hospedagem_diarias):', error)
      throw new Error(`Database error: ${error.message}`)
    }

    if (!data || data.length === 0) {
      log.debug('⚠️ Nenhuma diária encontrada na tabela `hospedagem_diarias` com os filtros:', filters)
      return []
    }

    log.debug(`✅ SUPABASE SUCCESS (hospedagem_diarias): ${data.length} diárias encontradas`)
    return data

  } catch (error) {
    log.error('💥 FETCH HABITACIONES DATA ERROR:', error)
    throw error
  }
}


// ✅ FUNÇÃO ESPECÍFICA PARA SMART FILTER
export async function fetchDataForSmartFilter(filters: SearchFilters): Promise<{
  allData: any[]
  filteredData: any[]
  uniqueHotels: string[]
}> {
  try {
    log.debug('🧠 SMART FILTER DATA SERVICE')
    
    // Buscar TODOS os dados primeiro
    const allData = await fetchRealData()
    
    // Filtrar em JavaScript para análise detalhada
    let filteredData = [...allData]
    
    if (filters.destino) {
      filteredData = filteredData.filter(item => 
        item.destino?.toLowerCase().includes(filters.destino!.toLowerCase())
      )
    }
    
    if (filters.transporte) {
      const transporteNorm = filters.transporte.replace('ú', 'u').toLowerCase()
      filteredData = filteredData.filter(item => {
        if (!item.transporte) return false
        const itemTransporte = item.transporte.replace('ú', 'u').toLowerCase()
        return itemTransporte.includes(transporteNorm)
      })
    }
    
    if (filters.data_saida) {
      filteredData = filteredData.filter(item => 
        item.data_saida && item.data_saida >= filters.data_saida!
      )
    }

    const uniqueHotels = [...new Set(filteredData.map(item => item.hotel))].filter(Boolean)
    
    log.debug('🎯 SMART FILTER RESULTS', {
      total: allData.length,
      filtered: filteredData.length,
      uniqueHotels: uniqueHotels.length,
      hotelsPreview: uniqueHotels.slice(0, 5),
    })

    return {
      allData,
      filteredData,
      uniqueHotels
    }

  } catch (error) {
    log.error('💥 SMART FILTER DATA ERROR:', error)
    throw error
  }
}

export async function fetchDisponibilidadeById(id: string): Promise<Disponibilidade | null> {
  if (!id) return null

  const { data, error } = await supabase
    .from<Disponibilidade>('disponibilidades')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data
}

interface DiscountRuleOptions {
  transportType?: string
  destination?: string
  packageSlug?: string
  hotelName?: string
  includeInactive?: boolean
  includeExpired?: boolean
}

export async function fetchActiveDiscountRules(
  options: DiscountRuleOptions = {},
): Promise<DiscountRule[]> {
  try {
    let query = supabase.from<DiscountRule>('discount_rules').select('*')

    if (!options.includeInactive) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      log.error('❌ Erro ao buscar discount_rules', error)
      return []
    }

    const rules = (data || []) as DiscountRule[]
    const today = new Date().toISOString().slice(0, 10)

    return rules.filter((rule) => {
      if (!options.includeInactive && !rule.is_active) return false
      if (!options.includeExpired) {
        // valid_from: se definido, today deve ser >= valid_from
        if (rule.valid_from && today < rule.valid_from) return false
        // valid_to: se definido, today deve ser <= valid_to
        if (rule.valid_to && today > rule.valid_to) return false
      }
      if (options.transportType) {
        const match = normalizeText(rule.transport_type || '') === normalizeText(options.transportType)
        if (!match) return false
      }
      if (options.destination) {
        if (rule.destinations && rule.destinations.length > 0) {
          const destMatch = rule.destinations
            .map((destination) => normalizeText(destination))
            .includes(normalizeText(options.destination))
          if (!destMatch) return false
        }
      }
      if (!matchesNormalizedTarget(options.packageSlug, rule.package_slugs)) return false
      if (!matchesNormalizedTarget(options.hotelName, rule.hotel_names)) return false
      return true
    })
  } catch (error) {
    log.error('❌ fetchActiveDiscountRules error', error)
    return []
  }
}

interface PromotionQueryOptions {
  type?: PromotionType
  limit?: number
  includeInactive?: boolean
}

export async function fetchPromotions(options: PromotionQueryOptions = {}): Promise<Promotion[]> {
  try {
    const cacheKey = `${options.type || 'all'}_${options.includeInactive ? 'all' : 'active'}_${options.limit || 'all'}`
    const cached = promotionCache.get(cacheKey)
    const now = Date.now()
    if (cached && now - cached.timestamp < PROMOTION_CACHE_DURATION) {
      return cached.data
    }

    let query = supabase.from<Promotion>('promotions').select('*')
    if (options.type) {
      query = query.eq('type', options.type)
    }
    if (!options.includeInactive) {
      query = query.eq('is_active', true)
    }
    query = query.order('position', { ascending: true }).order('created_at', { ascending: true })
    if (options.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query
    if (error) {
      log.error('❌ Erro ao buscar promoções', error)
      return []
    }

    const result = (data || []) as Promotion[]
    promotionCache.set(cacheKey, { timestamp: now, data: result })
    return result
  } catch (error) {
    log.error('❌ fetchPromotions error', error)
    return []
  }
}

export async function insertSearchEvent(payload: {
  filters: Record<string, unknown>
  resultCount?: number
  userAgent?: string
  ipHash?: string
}) {
  try {
    await supabase.from('search_events').insert({
      filters: payload.filters,
      result_count: payload.resultCount ?? null,
      user_agent: payload.userAgent ?? null,
      ip_hash: payload.ipHash ?? null,
    })
  } catch (error) {
    log.error('❌ insertSearchEvent error', error)
  }
}

export async function insertConversionEvent(payload: { context?: Record<string, unknown> }) {
  try {
    await supabase.from('conversion_events').insert({
      context: payload.context ?? null,
    })
  } catch (error) {
    log.error('❌ insertConversionEvent error', error)
  }
}

export async function insertAuditLog(
  payload: {
    entity: string
    entityId?: string
    action: string
    data?: Record<string, unknown>
    performedBy?: string
  },
  client?: SupabaseClient,
) {
  const target = client ?? supabase
  try {
    await target.from('audit_logs').insert({
      entity: payload.entity,
      entity_id: payload.entityId ?? null,
      action: payload.action,
      payload: payload.data ?? null,
      performed_by: payload.performedBy ?? null,
    })
  } catch (error) {
    log.error('❌ insertAuditLog error', error)
  }
}

// ✅ FUNÇÃO PARA LIMPAR CACHE (útil para desenvolvimento)
export function clearCache() {
  dataCache = { data: null, timestamp: 0 }
  log.debug('🧹 CACHE CLEARED')
}

// ✅ NOVA FUNÇÃO: Buscar cidades de saída da tabela específica
export async function fetchCidadesSaida(transporte?: string): Promise<any[]> {
  try {
    log.debug('🏙️ BUSCANDO CIDADES DE SAÍDA...')
    
    let query = supabase
      .from('cidades_saida')
      .select('*')
      .order('cidade')
    
    if (transporte) {
      query = query.eq('transporte', transporte)
    }
    
    const { data, error } = await query
    
    if (error) {
      log.error('❌ SUPABASE ERROR (cidades_saida):', error)
      throw error
    }
    
    log.debug(`✅ CIDADES DE SAÍDA ENCONTRADAS: ${data?.length || 0}`)
    return data || []
    
  } catch (error) {
    log.error('❌ FETCH CIDADES SAIDA ERROR:', error)
    throw error
  }
}

// ✅ NOVA FUNÇÃO: BUSCAR ADDONS (SERVIÇOS ADICIONAIS)
export async function fetchAddons(transportType?: string): Promise<any[]> {
  try {
    log.debug('➕ BUSCANDO ADDONS DO SUPABASE...')
    let query = supabase
      .from('package_addons')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true })

    const { data, error } = await query

    let finalData = data || []
    if (error || finalData.length === 0) {
      log.warn('⚠️ Falha ao buscar addons ou tabela vazia. Usando fallback.')
      finalData = FALLBACK_ADDONS as any[]
    }

    // Filtragem em memória para o campo 'transport_type' que pode ser null (ambos)
    const filtered = finalData.filter(addon => {
      if (!addon.transport_type) return true // Aplica para todos
      if (!transportType) return true
      return normalizeText(addon.transport_type) === normalizeText(transportType)
    })

    log.debug(`✅ ADDONS ENCONTRADOS: ${filtered.length}`)
    return filtered
  } catch (error) {
    log.error('❌ FETCH ADDONS ERROR:', error)
    return FALLBACK_ADDONS.filter(addon => {
       if (!addon.transport_type) return true
       if (!transportType) return true
       return normalizeText(addon.transport_type) === normalizeText(transportType)
    }) as any[]
  }
}

// ✅ STATUS DO SERVIÇO
export function getServiceStatus() {
  return {
    connected: !!supabase,
    cacheSize: dataCache.data?.length || 0,
    cacheAge: dataCache.timestamp ? Date.now() - dataCache.timestamp : 0,
    cacheValid: dataCache.data && (Date.now() - dataCache.timestamp) < CACHE_DURATION
  }
} 

import { createClient } from '@supabase/supabase-js'

// ✅ SERVIÇO ÚNICO DE DADOS - SEMPRE SUPABASE
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error('❌ SUPABASE CREDENTIALS MISSING - System cannot work without database')
}

const supabase = createClient(supabaseUrl, supabaseKey)

const DEBUG = process.env.NEXT_PUBLIC_DEBUG_LOGS === 'true' || process.env.DEBUG_LOGS === 'true'
if (DEBUG) {
  console.log('🎯 SUPABASE SERVICE: Inicializado com conexão real')
  console.log('🔗 URL configured?', !!supabaseUrl)
  console.log('🔑 Key exists?', !!supabaseKey)
}

// ✅ CACHE INTELIGENTE (5 minutos)
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos
let dataCache: {
  data: any[] | null
  timestamp: number
} = {
  data: null,
  timestamp: 0
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
    if (DEBUG) {
      console.log('🔍 SUPABASE SERVICE: Buscando dados reais...')
      console.log('📋 Filtros:', filters)
    }

    // ✅ VERIFICAR CACHE PRIMEIRO
    const now = Date.now()
    const cacheValid = dataCache.data && (now - dataCache.timestamp) < CACHE_DURATION
    
    if (cacheValid && !filters) {
      if (DEBUG) console.log('⚡ CACHE HIT: Usando dados em cache')
      return dataCache.data!
    }

    // ✅ BUSCAR DADOS FRESCOS DO SUPABASE
    if (DEBUG) console.log('🔄 CACHE MISS: Buscando dados frescos do Supabase...')
    
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
      if (DEBUG) console.error('❌ SUPABASE ERROR:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    if (!data || data.length === 0) {
      if (DEBUG) console.log('⚠️ NO DATA FOUND in Supabase with filters:', filters)
      return []
    }

    if (DEBUG) {
      console.log(`✅ SUPABASE SUCCESS: ${data.length} records found`)
      console.log('📊 Sample data:', data.slice(0, 2))
    }

    // ✅ ATUALIZAR CACHE (só para consultas sem filtros)
    if (!filters) {
      dataCache = {
        data: data,
        timestamp: now
      }
      if (DEBUG) console.log('💾 CACHE UPDATED')
    }

    return data

  } catch (error) {
    if (DEBUG) console.error('💥 SUPABASE SERVICE ERROR:', error)
    throw error
  }
}

// ✅ NOVA FUNÇÃO: BUSCAR DADOS DE HABITACIONES
export async function fetchHabitacionesData(filters?: HabitacionSearchFilters): Promise<any[]> {
  try {
    if (DEBUG) {
      console.log('🏨 SUPABASE SERVICE: Buscando diárias de habitaciones...')
      console.log('📋 Filtros de Habitación:', filters)
    }

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
      if (DEBUG) console.error('❌ SUPABASE ERROR (hospedagem_diarias):', error)
      throw new Error(`Database error: ${error.message}`)
    }

    if (!data || data.length === 0) {
      if (DEBUG) console.log('⚠️ Nenhuma diária encontrada na tabela `hospedagem_diarias` com os filtros:', filters)
      return []
    }

    if (DEBUG) console.log(`✅ SUPABASE SUCCESS (hospedagem_diarias): ${data.length} diárias encontradas`)
    return data

  } catch (error) {
    if (DEBUG) console.error('💥 FETCH HABITACIONES DATA ERROR:', error)
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
    if (DEBUG) console.log('🧠 SMART FILTER DATA SERVICE')
    
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
    
    if (DEBUG) {
      console.log(`🎯 SMART FILTER RESULTS:`)
      console.log(`   📊 Total data: ${allData.length}`)
      console.log(`   🔍 Filtered: ${filteredData.length}`)
      console.log(`   🏨 Unique hotels: ${uniqueHotels.length}`)
      console.log(`   🏨 Hotels: ${uniqueHotels.slice(0, 5).join(', ')}`)
    }

    return {
      allData,
      filteredData,
      uniqueHotels
    }

  } catch (error) {
    if (DEBUG) console.error('💥 SMART FILTER DATA ERROR:', error)
    throw error
  }
}

// ✅ FUNÇÃO PARA LIMPAR CACHE (útil para desenvolvimento)
export function clearCache() {
  dataCache = { data: null, timestamp: 0 }
  if (DEBUG) console.log('🧹 CACHE CLEARED')
}

// ✅ NOVA FUNÇÃO: Buscar cidades de saída da tabela específica
export async function fetchCidadesSaida(transporte?: string): Promise<any[]> {
  try {
    if (DEBUG) console.log('🏙️ BUSCANDO CIDADES DE SAÍDA...')
    
    let query = supabase
      .from('cidades_saida')
      .select('*')
      .order('cidade')
    
    if (transporte) {
      query = query.eq('transporte', transporte)
    }
    
    const { data, error } = await query
    
    if (error) {
      if (DEBUG) console.error('❌ SUPABASE ERROR (cidades_saida):', error)
      throw error
    }
    
    if (DEBUG) console.log(`✅ CIDADES DE SAÍDA ENCONTRADAS: ${data?.length || 0}`)
    return data || []
    
  } catch (error) {
    if (DEBUG) console.error('❌ FETCH CIDADES SAIDA ERROR:', error)
    throw error
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
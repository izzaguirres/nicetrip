import { supabase } from '@/lib/supabase'

// ✅ CACHE INTELIGENTE PARA HOSPEDAGENS
interface HospedagemCache {
  data: HospedagemData[]
  timestamp: number
}

interface HospedagemData {
  id: number
  nome: string
  slug: string
  destino: string
  inclusos: string[]
  comodidades: Array<{
    nome: string
    icone: string
  }>
  categoria: string
  estrelas: number
  distancia_praia: number
  wifi_gratuito: boolean
  estacionamento: boolean
  piscina: boolean
  restaurante: boolean
  latitude: number
  longitude: number
}

// Cache global com duração de 30 minutos
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutos
let hospedagensCache: HospedagemCache | null = null

// ✅ String normalizer to handle accents and case
const normalizeString = (str: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

// ✅ MAPEAMENTO INTELIGENTE DE NOMES - REMOVIDO PARA SIMPLIFICAR E CENTRALIZAR A LÓGICA
// const HOTEL_NAME_MAP: { [key: string]: string } = { ... }

// ✅ FUNÇÃO PRINCIPAL: BUSCAR DADOS DE HOSPEDAGEM
export async function getHospedagemData(hotelOficial: string): Promise<HospedagemData | null> {
  try {
    // Verificar cache primeiro
    const now = Date.now()
    const cacheValid = hospedagensCache && (now - hospedagensCache.timestamp) < CACHE_DURATION
    
    if (!cacheValid) {
      console.log('🏨 CACHE MISS: Buscando dados de hospedagens do Supabase...')
      await refreshHospedagensCache()
    } else {
      console.log('⚡ CACHE HIT: Usando dados de hospedagens em cache')
    }

    if (!hotelOficial) {
        console.warn('⚠️ getHospedagemData foi chamado com um nome de hotel nulo ou indefinido.');
        return null;
    }
    
    // A busca agora é simples: usa o nome oficial normalizado para uma correspondência exata.
    const normalizedQueryName = normalizeString(hotelOficial);

    const hospedagem = hospedagensCache?.data.find(h => {
      const normalizedCachedName = normalizeString(h.nome);
      return normalizedCachedName === normalizedQueryName;
    });

    if (hospedagem) {
      console.log(`✅ Hospedagem encontrada: ${hospedagem.nome} para a busca "${hotelOficial}"`)
      return hospedagem
    } else {
      console.log(`⚠️ Hospedagem não encontrada para: ${hotelOficial}`)
      return null
    }

  } catch (error) {
    console.error('❌ Erro ao buscar dados de hospedagem:', error)
    return null
  }
}

// ✅ FUNÇÃO PARA ATUALIZAR CACHE
async function refreshHospedagensCache(): Promise<void> {
  try {
    const { data: hospedagens, error } = await supabase
      .from('hospedagens')
      .select(`
        id,
        nome,
        slug,
        destino,
        inclusos,
        comodidades,
        categoria,
        estrelas,
        distancia_praia,
        wifi_gratuito,
        estacionamento,
        piscina,
        restaurante,
        latitude,
        longitude
      `)
      .eq('ativo', true)

    if (error) {
      throw new Error(`Erro do Supabase: ${error.message}`)
    }

    hospedagensCache = {
      data: hospedagens || [],
      timestamp: Date.now()
    }

    console.log(`✅ Cache de hospedagens atualizado: ${hospedagens?.length || 0} registros`)

  } catch (error) {
    console.error('❌ Erro ao atualizar cache de hospedagens:', error)
    // Manter cache anterior se houver erro
  }
}

// ✅ FUNÇÃO PARA CONVERTER COMODIDADES PARA O FORMATO DOS CARDS
export function formatComodidadesForCards(comodidades: Array<{nome: string, icone: string}>): Array<{icon: string, label: string}> {
  // Ordenar comodidades colocando as "mais importantes" primeiro
  const prioridade = [
    'coffee',     // Desayuno primeiro
    'pool',       // Piscina
    'hot_tub',    // Hidromassagem / Jacuzzi
    'reception',  // Recepción 24h
    'wifi',       // Wi-Fi
    'aire',       // Ar-condicionado
    'kitchen',    // Cozinha completa
    'fridge'      // Geladeira
  ]

  // Mapeamento de ícones para strings (será convertido para componentes na UI)
  const iconMap: { [key: string]: string } = {
    'wifi': 'Wifi',
    'aire': 'AirVent', 
    'tv': 'Tv',
    'fridge': 'Refrigerator',
    'pool': 'Waves',
    'restaurant': 'Utensils',
    'safe': 'Shield',
    'cleaning': 'Sparkles',
    'reception': 'Clock',
    'parking': 'Car',
    'kitchen': 'ChefHat',
    'hot_tub': 'Bath',
    'bbq': 'Flame',
    'gamepad': 'Gamepad2',
    'coffee': 'Coffee'
  }

  const getRank = (icone: string): number => {
    const normalized = icone.trim().toLowerCase()
    const idx = prioridade.indexOf(normalized)
    return idx === -1 ? prioridade.length : idx
  }

  const comodidadesOrdenadas = [...comodidades].sort((a, b) => {
    return getRank(a.icone) - getRank(b.icone)
  })

  return comodidadesOrdenadas.map(comodidade => ({
    icon: iconMap[comodidade.icone] || 'Circle',
    label: comodidade.nome.toUpperCase()
  }))
}

// ✅ COMODIDADES GENÉRICAS PARA FALLBACK
export const COMODIDADES_GENERICAS = [
  { icon: 'Tv', label: 'TV' },
  { icon: 'AirVent', label: 'AIRE' }, 
  { icon: 'Coffee', label: 'DESAYUNO' }
]

// ✅ FUNÇÃO PARA LIMPAR CACHE (útil para desenvolvimento)
export function clearHospedagensCache(): void {
  hospedagensCache = null
  console.log('🧹 Cache de hospedagens limpo')
} 
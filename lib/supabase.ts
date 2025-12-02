import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const DEBUG = process.env.NEXT_PUBLIC_DEBUG_LOGS === 'true' || process.env.DEBUG_LOGS === 'true'

if (DEBUG) {
  console.log('Supabase client: URL configured?', !!supabaseUrl)
  console.log('Supabase client: Key exists?', !!supabaseAnonKey)
}

// Criar cliente Supabase apenas se as variáveis estiverem disponíveis
let supabase: any = null

if (supabaseUrl && supabaseAnonKey) {
  if (DEBUG) console.log('Inicializando Supabase com credenciais reais')
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
  if (DEBUG) console.warn('Variáveis de ambiente do Supabase não configuradas - usando modo fallback')
  // Criar um mock do cliente Supabase que sempre retorna erro
  const notConfigured = () =>
    Promise.resolve({ data: null, error: { message: 'Supabase não configurado' } })

  const chain = {
    select: () => chain,
    insert: () => notConfigured(),
    update: () => notConfigured(),
    delete: () => notConfigured(),
    order: () => chain,
    limit: () => chain,
    eq: () => chain,
    gte: () => chain,
    lte: () => chain,
    ilike: () => chain,
    or: () => chain,
    filter: () => chain,
    single: () => notConfigured(),
    maybeSingle: () => notConfigured(),
    then: (...args: any[]) => notConfigured().then(...args),
  }

  supabase = {
    from: () => chain,
  }
}

export { supabase }

// Types para as tabelas reais
export type Disponibilidade = {
  id: number
  destino: string
  data_saida: string
  transporte: string
  hotel: string
  quarto_tipo: string
  capacidade: number
  preco_adulto: number
  preco_crianca_0_3: number
  preco_crianca_4_5: number
  preco_crianca_6_mais: number
  preco_adulto_aereo?: number | null
  preco_crianca_0_2_aereo?: number | null
  preco_crianca_2_5_aereo?: number | null
  preco_crianca_6_mais_aereo?: number | null
  taxa_aereo_por_pessoa?: number | null
  noites_hotel: number
  dias_viagem: number
  dias_totais: number
  link_imagem?: string | null
  slug?: string | null
  slug_hospedagem?: string | null
  slug_pacote?: string | null
  slug_pacote_principal?: string | null
  cidade_saida?: string | null
  hospedagem_id?: string | null
  created_at: string
  updated_at?: string | null
}

export type CidadeSaida = {
  id: number
  transporte: string
  cidade: string
  provincia: string
  pais: string
}

export type VooAereo = {
  id: number
  origem: string
  origem_iata: string | null
  destino: string
  destino_iata: string
  tipo: 'charter' | 'regular'
  sentido: 'ida' | 'volta'
  data: string | null
  saida_hora: string
  chegada_hora: string
  aeroporto_saida: string | null
  aeroporto_chegada: string | null
  bag_carry_kg: number | null
  bag_despachada_kg: number | null
  companhia: string | null
  observacao: string | null
  ativo: boolean
  created_at: string
}

// Filtros para disponibilidades
export interface DisponibilidadeFilter {
  destino?: string
  cidade_saida?: string
  transporte?: string
  data_saida?: string
  preco_min?: number
  preco_max?: number
  capacidade_min?: number
}

// Type para cálculo de preços baseado em pessoas
export interface PrecoPessoas {
  adultos: number
  criancas_0_3: number
  criancas_4_5: number
  criancas_6_mais: number
}

export type DiscountRule = {
  id: string
  name: string
  transport_type: string | null
  destinations: string[] | null
  package_slugs: string[] | null
  hotel_names: string[] | null
  target_dates: string[] | null
  age_groups: string[] | null
  age_min: number | null
  age_max: number | null
  amount: number
  amount_currency: string
  amount_type: 'fixed' | 'percent'
  valid_from: string | null
  valid_to: string | null
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export type PromotionType = 'paquete' | 'hospedaje' | 'paseo'

export type Promotion = {
  id: string
  type: PromotionType
  position: number
  title: string
  subtitle: string | null
  destino: string | null
  hotel: string | null
  transporte: string | null
  slug_disponibilidade: string | null
  slug_hospedagem: string | null
  slug_paseo: string | null
  price_single: number | null
  price_double: number | null
  price_triple: number | null
  price_quad: number | null
  price_quint: number | null
  cta_label: string | null
  cta_url: string | null
  image_url: string | null
  departure_date: string | null
  valid_until: string | null
  auto_hide: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export type SearchEvent = {
  id: string
  filters: Record<string, unknown>
  result_count: number | null
  user_agent: string | null
  ip_hash: string | null
  created_at: string
}

export type ConversionEvent = {
  id: string
  context: Record<string, unknown> | null
  created_at: string
}

export type AuditLog = {
  id: string
  entity: string
  entity_id: string | null
  action: string
  payload: Record<string, unknown> | null
  performed_by: string | null
  created_at: string
}

// Função helper para calcular preço total
export function calcularPrecoTotal(disponibilidade: Disponibilidade, pessoas: PrecoPessoas): number {
  const precoAdultos = disponibilidade.preco_adulto * pessoas.adultos
  const precoCriancas03 = disponibilidade.preco_crianca_0_3 * pessoas.criancas_0_3
  const precoCriancas45 = disponibilidade.preco_crianca_4_5 * pessoas.criancas_4_5
  const precoCriancas6mais = disponibilidade.preco_crianca_6_mais * pessoas.criancas_6_mais
  
  return precoAdultos + precoCriancas03 + precoCriancas45 + precoCriancas6mais
} 

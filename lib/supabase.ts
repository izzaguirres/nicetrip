import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key exists:', !!supabaseAnonKey)

// Criar cliente Supabase apenas se as variáveis estiverem disponíveis
let supabase: any = null

if (supabaseUrl && supabaseAnonKey) {
  console.log('Inicializando Supabase com credenciais reais')
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
  console.warn('Variáveis de ambiente do Supabase não configuradas - usando modo fallback')
  // Criar um mock do cliente Supabase que sempre retorna erro
  supabase = {
    from: () => ({
      select: () => ({
        order: () => ({
          limit: () => Promise.resolve({ data: null, error: { message: 'Supabase não configurado' } }),
          eq: () => Promise.resolve({ data: null, error: { message: 'Supabase não configurado' } }),
          ilike: () => Promise.resolve({ data: null, error: { message: 'Supabase não configurado' } }),
          gte: () => Promise.resolve({ data: null, error: { message: 'Supabase não configurado' } }),
          lte: () => Promise.resolve({ data: null, error: { message: 'Supabase não configurado' } })
        }),
        eq: () => Promise.resolve({ data: null, error: { message: 'Supabase não configurado' } }),
        ilike: () => Promise.resolve({ data: null, error: { message: 'Supabase não configurado' } }),
        gte: () => Promise.resolve({ data: null, error: { message: 'Supabase não configurado' } }),
        lte: () => Promise.resolve({ data: null, error: { message: 'Supabase não configurado' } }),
        single: () => Promise.resolve({ data: null, error: { message: 'Supabase não configurado' } })
      })
    })
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
  noites_hotel: number
  dias_viagem: number
  dias_totais: number
  link_imagem: string
  slug: string
  created_at: string
}

export type CidadeSaida = {
  id: number
  transporte: string
  cidade: string
  provincia: string
  pais: string
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

// Função helper para calcular preço total
export function calcularPrecoTotal(disponibilidade: Disponibilidade, pessoas: PrecoPessoas): number {
  const precoAdultos = disponibilidade.preco_adulto * pessoas.adultos
  const precoCriancas03 = disponibilidade.preco_crianca_0_3 * pessoas.criancas_0_3
  const precoCriancas45 = disponibilidade.preco_crianca_4_5 * pessoas.criancas_4_5
  const precoCriancas6mais = disponibilidade.preco_crianca_6_mais * pessoas.criancas_6_mais
  
  return precoAdultos + precoCriancas03 + precoCriancas45 + precoCriancas6mais
} 
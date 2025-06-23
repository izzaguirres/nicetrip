import { useState, useEffect } from 'react'
import { supabase, Disponibilidade, CidadeSaida, DisponibilidadeFilter, PrecoPessoas, calcularPrecoTotal } from '@/lib/supabase'
import { fetchRealData, SearchFilters } from '@/lib/supabase-service'

// Dados de fallback para quando o Supabase não estiver configurado
const FALLBACK_DISPONIBILIDADES: Disponibilidade[] = [
  {
    id: 1,
    destino: "Canasvieiras",
    data_saida: "2025-11-23",
    transporte: "Bus",
    hotel: "Residencial Terrazas",
    quarto_tipo: "Habitación Cuádruple",
    capacidade: 4,
    preco_adulto: 490,
    preco_crianca_0_3: 50,
    preco_crianca_4_5: 350,
    preco_crianca_6_mais: 490,
    noites_hotel: 7,
    dias_viagem: 8,
    dias_totais: 8,
    link_imagem: "https://raw.githubusercontent.com/izzaguirres/nicetrip/refs/heads/main/hotel%202.jpg",
    slug: "canasvieiras-residencial-terrazas",
    created_at: "2025-01-01T00:00:00Z"
  },
  {
    id: 2,
    destino: "Canasvieiras",
    data_saida: "2025-11-30",
    transporte: "Bus",
    hotel: "Residencial Leonidas",
    quarto_tipo: "Habitación Cuádruple",
    capacidade: 4,
    preco_adulto: 490,
    preco_crianca_0_3: 50,
    preco_crianca_4_5: 350,
    preco_crianca_6_mais: 490,
    noites_hotel: 7,
    dias_viagem: 8,
    dias_totais: 8,
    link_imagem: "https://raw.githubusercontent.com/izzaguirres/nicetrip/refs/heads/main/hotel%201.jpg",
    slug: "canasvieiras-residencial-leonidas",
    created_at: "2025-01-01T00:00:00Z"
  },
  {
    id: 3,
    destino: "Canasvieiras",
    data_saida: "2025-12-07",
    transporte: "Bus",
    hotel: "Hotel Fenix",
    quarto_tipo: "Habitación Doble",
    capacidade: 6,
    preco_adulto: 490,
    preco_crianca_0_3: 50,
    preco_crianca_4_5: 350,
    preco_crianca_6_mais: 490,
    noites_hotel: 5,
    dias_viagem: 6,
    dias_totais: 6,
    link_imagem: "https://raw.githubusercontent.com/izzaguirres/nicetrip/refs/heads/main/hotel%201.jpg",
    slug: "canasvieiras-hotel-fenix",
    created_at: "2025-01-01T00:00:00Z"
  },
  {
    id: 4,
    destino: "Canasvieiras",
    data_saida: "2025-11-23",
    transporte: "Aéreo",
    hotel: "Resort Premium",
    quarto_tipo: "Habitación Suite",
    capacidade: 6,
    preco_adulto: 490,
    preco_crianca_0_3: 50,
    preco_crianca_4_5: 350,
    preco_crianca_6_mais: 490,
    noites_hotel: 7,
    dias_viagem: 8,
    dias_totais: 8,
    link_imagem: "https://raw.githubusercontent.com/izzaguirres/nicetrip/refs/heads/main/hotel%202.jpg",
    slug: "canasvieiras-resort-premium",
    created_at: "2025-01-01T00:00:00Z"
  },
  {
    id: 5,
    destino: "Canasvieiras",
    data_saida: "2025-12-14",
    transporte: "Bus",
    hotel: "Hotel Costa Verde",
    quarto_tipo: "Habitación Triple",
    capacidade: 5,
    preco_adulto: 490,
    preco_crianca_0_3: 50,
    preco_crianca_4_5: 350,
    preco_crianca_6_mais: 490,
    noites_hotel: 7,
    dias_viagem: 8,
    dias_totais: 8,
    link_imagem: "https://raw.githubusercontent.com/izzaguirres/nicetrip/refs/heads/main/hotel%201.jpg",
    slug: "canasvieiras-hotel-costa-verde",
    created_at: "2025-01-01T00:00:00Z"
  },
  {
    id: 6,
    destino: "Florianópolis",
    data_saida: "2025-11-23",
    transporte: "Aéreo",
    hotel: "Pousada Sol e Mar",
    quarto_tipo: "Habitación Familiar",
    capacidade: 6,
    preco_adulto: 490,
    preco_crianca_0_3: 50,
    preco_crianca_4_5: 350,
    preco_crianca_6_mais: 490,
    noites_hotel: 5,
    dias_viagem: 6,
    dias_totais: 6,
    link_imagem: "https://raw.githubusercontent.com/izzaguirres/nicetrip/refs/heads/main/hotel%202.jpg",
    slug: "florianopolis-pousada-sol-e-mar",
    created_at: "2025-01-01T00:00:00Z"
  },
  {
    id: 7,
    destino: "Bombinhas",
    data_saida: "2026-01-04",
    transporte: "Bus",
    hotel: "BOMBINHAS PALACE HOTEL",
    quarto_tipo: "Habitación Doble",
    capacidade: 4,
    preco_adulto: 490,
    preco_crianca_0_3: 50,
    preco_crianca_4_5: 350,
    preco_crianca_6_mais: 490,
    noites_hotel: 7,
    dias_viagem: 8,
    dias_totais: 8,
    link_imagem: "https://raw.githubusercontent.com/izzaguirres/nicetrip/refs/heads/main/hotel%201.jpg",
    slug: "bombinhas-palace-hotel",
    created_at: "2025-01-01T00:00:00Z"
  }
]

const FALLBACK_CIDADES: CidadeSaida[] = [
  { id: 1, transporte: "Bus", cidade: "Buenos Aires", provincia: "Buenos Aires", pais: "Argentina" },
  { id: 2, transporte: "Bus", cidade: "São Paulo", provincia: "São Paulo", pais: "Brasil" },
  { id: 3, transporte: "Aéreo", cidade: "Rio de Janeiro", provincia: "Rio de Janeiro", pais: "Brasil" }
]

export function useDisponibilidades(filters?: DisponibilidadeFilter) {
  const [disponibilidades, setDisponibilidades] = useState<Disponibilidade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDisponibilidades()
  }, [filters])

  const fetchDisponibilidades = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🚀 HOOK useDisponibilidades INICIANDO...')
      console.log('=== DEBUG useDisponibilidades ===')
      console.log('Filtros recebidos:', filters)

      // NOVA ABORDAGEM: Buscar TODOS os dados primeiro (como no endpoint que funciona)
      console.log('Buscando TODOS os dados do Supabase (sem filtros SQL)...')
      const { data: allData, error: supabaseError } = await supabase
        .from('disponibilidades')
        .select('*')

      // Se há erro do Supabase (não configurado), usar dados de fallback
      if (supabaseError && supabaseError.message.includes('Supabase não configurado')) {
        console.log('Supabase não configurado, usando dados de fallback')
        
        // Aplicar filtros nos dados de fallback
        let dadosFiltrados = FALLBACK_DISPONIBILIDADES
        
        if (filters?.destino) {
          dadosFiltrados = dadosFiltrados.filter(item => 
            item.destino.toLowerCase().includes(filters.destino!.toLowerCase())
          )
        }
        
        if (filters?.transporte) {
          dadosFiltrados = dadosFiltrados.filter(item => 
            item.transporte.toLowerCase().includes(filters.transporte!.toLowerCase())
          )
        }
        
        if (filters?.data_saida) {
          dadosFiltrados = dadosFiltrados.filter(item => 
            item.data_saida >= filters.data_saida!
          )
        }
        
        console.log(`Usando dados de fallback: ${dadosFiltrados.length} disponibilidades`)
        setDisponibilidades(dadosFiltrados)
        return
      }

      if (supabaseError) {
        console.error('Erro na busca do Supabase:', supabaseError)
        throw new Error(`Erro de conexão: ${supabaseError.message}`)
      }

      console.log(`✅ Supabase retornou ${allData?.length || 0} registros totais`)
      
      if (!allData || allData.length === 0) {
        console.log('⚠️ Supabase realmente vazio - usando dados de fallback apenas se necessário')
        // ✅ SÓ USAR FALLBACK quando realmente não há dados
        let dadosFiltrados = FALLBACK_DISPONIBILIDADES
        
        // Aplicar filtros nos dados de fallback
        if (filters?.destino) {
          console.log(`🔍 Filtrando fallback por destino: ${filters.destino}`)
          dadosFiltrados = dadosFiltrados.filter(item => 
            item.destino.toLowerCase().includes(filters.destino!.toLowerCase())
          )
        }
        
        if (filters?.transporte) {
          console.log(`🔍 Filtrando fallback por transporte: ${filters.transporte}`)
          const transporteNormalizado = filters.transporte.replace('ú', 'u').toLowerCase()
          dadosFiltrados = dadosFiltrados.filter(item => {
            const itemTransporte = item.transporte.replace('ú', 'u').toLowerCase()
            return itemTransporte.includes(transporteNormalizado)
          })
        }
        
        if (filters?.data_saida) {
          console.log(`🔍 Filtrando fallback por data >= ${filters.data_saida}`)
          const antes = dadosFiltrados.length
          
          // ✅ CORREÇÃO BOMBINHAS: Ser mais flexível com destino Bombinhas
          if (filters.destino === 'Bombinhas') {
            console.log('🏖️ DESTINO BOMBINHAS - Aplicando filtro flexível de data')
            // Para Bombinhas, buscar qualquer data de 2026 (ano correto)
            const ano2026 = dadosFiltrados.filter(item => 
              item.data_saida && item.data_saida.startsWith('2026')
            )
            
            if (ano2026.length > 0) {
              dadosFiltrados = ano2026
              console.log(`✅ Bombinhas 2026: ${antes} → ${dadosFiltrados.length} pacotes encontrados`)
            } else {
              console.log(`⚠️ Bombinhas: mantendo todos ${antes} pacotes do destino`)
            }
          } else {
            // ✅ FILTRO NORMAL para outros destinos
            const dadosComDataExata = dadosFiltrados.filter(item => 
              item.data_saida >= filters.data_saida!
            )
            
            if (dadosComDataExata.length > 0) {
              dadosFiltrados = dadosComDataExata
              console.log(`Filtro data fallback (≥ ${filters.data_saida}): ${antes} → ${dadosFiltrados.length}`)
            } else {
              console.log(`⚠️ Fallback: Nenhum dado para data ≥ ${filters.data_saida}`)
              console.log(`🔄 Fallback flexível: mantendo todos os dados do destino`)
              console.log(`Filtro data fallback (flexível): ${antes} → ${dadosFiltrados.length}`)
            }
          }
        }
        
        console.log(`🎯 DADOS DE FALLBACK: ${dadosFiltrados.length} pacotes disponíveis`)
        setDisponibilidades(dadosFiltrados)
        return
      }

      // Agora aplicar filtros EM JAVASCRIPT (não no SQL)
      let dadosFiltrados = [...allData]
      
      console.log('Aplicando filtros em JavaScript...')
      
      if (filters?.destino) {
        console.log(`Filtrando por destino: ${filters.destino}`)
        const antes = dadosFiltrados.length
        dadosFiltrados = dadosFiltrados.filter(item => 
          item.destino && item.destino.toLowerCase().includes(filters.destino!.toLowerCase())
        )
        console.log(`Filtro destino: ${antes} → ${dadosFiltrados.length}`)
      }
      
      if (filters?.transporte) {
        console.log(`Filtrando por transporte: ${filters.transporte}`)
        const antes = dadosFiltrados.length
        // Tratar "Bus" e "Bús" como equivalentes
        const transporteNormalizado = filters.transporte.replace('ú', 'u').toLowerCase()
        dadosFiltrados = dadosFiltrados.filter(item => {
          if (!item.transporte) return false
          const itemTransporte = item.transporte.replace('ú', 'u').toLowerCase()
          return itemTransporte.includes(transporteNormalizado)
        })
        console.log(`Filtro transporte: ${antes} → ${dadosFiltrados.length}`)
      }
      
      if (filters?.data_saida) {
        console.log(`Filtrando por data_saida >= ${filters.data_saida}`)
        const antes = dadosFiltrados.length
        
        // ✅ CORREÇÃO BOMBINHAS: Ser mais flexível com destino Bombinhas
        if (filters.destino === 'Bombinhas') {
          console.log('🏖️ DESTINO BOMBINHAS - Aplicando filtro flexível de data')
          // Para Bombinhas, buscar qualquer data de 2026 (ano correto)
          const ano2026 = dadosFiltrados.filter(item => 
            item.data_saida && item.data_saida.startsWith('2026')
          )
          
          if (ano2026.length > 0) {
            dadosFiltrados = ano2026
            console.log(`✅ Bombinhas 2026: ${antes} → ${dadosFiltrados.length} pacotes encontrados`)
          } else {
            console.log(`⚠️ Bombinhas: mantendo todos ${antes} pacotes do destino`)
          }
        } else {
          // ✅ FILTRO NORMAL para outros destinos
          const dadosComDataExata = dadosFiltrados.filter(item => 
            item.data_saida && item.data_saida >= filters.data_saida!
          )
          
          if (dadosComDataExata.length > 0) {
            dadosFiltrados = dadosComDataExata
            console.log(`Filtro data (≥ ${filters.data_saida}): ${antes} → ${dadosFiltrados.length}`)
          } else {
            console.log(`⚠️ Nenhum dado encontrado para data ≥ ${filters.data_saida}`)
            console.log(`🔄 Mantendo todos os dados do destino: ${antes} → ${dadosFiltrados.length}`)
          }
        }
      }
      
      if (filters?.preco_min) {
        console.log(`Filtrando por preço >= ${filters.preco_min}`)
        const antes = dadosFiltrados.length
        dadosFiltrados = dadosFiltrados.filter(item => 
          item.preco_adulto && item.preco_adulto >= filters.preco_min!
        )
        console.log(`Filtro preço min: ${antes} → ${dadosFiltrados.length}`)
      }
      
      if (filters?.preco_max) {
        console.log(`Filtrando por preço <= ${filters.preco_max}`)
        const antes = dadosFiltrados.length
        dadosFiltrados = dadosFiltrados.filter(item => 
          item.preco_adulto && item.preco_adulto <= filters.preco_max!
        )
        console.log(`Filtro preço max: ${antes} → ${dadosFiltrados.length}`)
      }

      if (filters?.capacidade_min) {
        console.log(`Filtrando por capacidade >= ${filters.capacidade_min}`)
        const antes = dadosFiltrados.length
        dadosFiltrados = dadosFiltrados.filter(item => 
          item.capacidade && item.capacidade >= filters.capacidade_min!
        )
        console.log(`Filtro capacidade: ${antes} → ${dadosFiltrados.length}`)
      }

      // Ordenar por data de saída
      dadosFiltrados.sort((a, b) => {
        if (!a.data_saida || !b.data_saida) return 0
        return new Date(a.data_saida).getTime() - new Date(b.data_saida).getTime()
      })

      console.log(`✅ RESULTADO FINAL: ${dadosFiltrados.length} disponibilidades após filtros`)
      console.log('Primeiros 3 resultados:', dadosFiltrados.slice(0, 3).map(d => ({
        id: d.id,
        destino: d.destino,
        hotel: d.hotel,
        data_saida: d.data_saida,
        transporte: d.transporte
      })))
      
      // LOG ADICIONAL: Ver todas as datas únicas disponíveis no banco
      const datasUnicas = [...new Set(allData.map((d: any) => d.data_saida))].sort().slice(0, 10)
      console.log('🗓️ DATAS DISPONÍVEIS NO BANCO (primeiras 10):', datasUnicas)
      
      setDisponibilidades(dadosFiltrados)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao buscar disponibilidades'
      console.error('Erro completo:', err)
      
      // Em caso de erro, usar dados de fallback
      console.log('Erro na busca, usando dados de fallback como último recurso')
      setDisponibilidades(FALLBACK_DISPONIBILIDADES)
      setError(null) // Não mostrar erro, apenas usar fallback
    } finally {
      setLoading(false)
    }
  }

  return {
    disponibilidades,
    loading,
    error,
    refetch: fetchDisponibilidades
  }
}

export function useDisponibilidade(id: string) {
  const [disponibilidade, setDisponibilidade] = useState<Disponibilidade | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      fetchDisponibilidade()
    }
  }, [id])

  const fetchDisponibilidade = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('disponibilidades')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        throw error
      }

      setDisponibilidade(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar disponibilidade')
      console.error('Erro ao buscar disponibilidade:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    disponibilidade,
    loading,
    error,
    refetch: fetchDisponibilidade
  }
}

export function useCidadesSaida(transporte?: string) {
  const [cidades, setCidades] = useState<CidadeSaida[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCidades()
  }, [transporte])

  const fetchCidades = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('cidades_saida')
        .select('*')
        .order('cidade', { ascending: true })

      if (transporte) {
        query = query.eq('transporte', transporte)
      }

      const { data, error } = await query

      if (error && error.message.includes('Supabase não configurado')) {
        console.log('Supabase não configurado, usando cidades de fallback')
        let cidadesFiltradas = FALLBACK_CIDADES
        if (transporte) {
          cidadesFiltradas = FALLBACK_CIDADES.filter(cidade => cidade.transporte === transporte)
        }
        setCidades(cidadesFiltradas)
        return
      }

      if (error) {
        throw error
      }

      setCidades(data || [])
    } catch (err) {
      console.error('Erro ao buscar cidades, usando fallback:', err)
      setCidades(FALLBACK_CIDADES)
      setError(null)
    } finally {
      setLoading(false)
    }
  }

  return {
    cidades,
    loading,
    error,
    refetch: fetchCidades
  }
}

export function useDestinos() {
  const [destinos, setDestinos] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDestinos() {
      try {
        const { data, error } = await supabase
          .from('disponibilidades')
          .select('destino')
          .order('destino')

        if (error && error.message.includes('Supabase não configurado')) {
          console.log('Supabase não configurado, usando destinos de fallback')
          const destinosFallback = [...new Set(FALLBACK_DISPONIBILIDADES.map((item: Disponibilidade) => item.destino))]
          setDestinos(destinosFallback)
          return
        }

        if (error) throw error
        
        // Extrair destinos únicos
        const destinosSet = new Set((data || []).map((item: any) => item.destino as string))
        const destinosUnicos = Array.from(destinosSet) as string[]
        setDestinos(destinosUnicos)
      } catch (err) {
        console.error('Erro ao carregar destinos, usando fallback:', err)
        const destinosFallback = [...new Set(FALLBACK_DISPONIBILIDADES.map((item: Disponibilidade) => item.destino))]
        setDestinos(destinosFallback)
        setError(null)
      } finally {
        setLoading(false)
      }
    }

    fetchDestinos()
  }, [])

  return { destinos, loading, error }
}

export function useDatasDisponiveis(destino?: string, transporte?: string) {
  const [datas, setDatas] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDatas() {
      try {
        setLoading(true)
        setError(null)
        
        console.log('📅 BUSCANDO DATAS DISPONÍVEIS:', { destino, transporte })
        
        // ✅ USAR NOVO SERVIÇO LIMPO
        const { fetchRealData } = await import('@/lib/supabase-service')
        
        const filters: any = {}
        if (destino) filters.destino = destino
        if (transporte) filters.transporte = transporte
        
        const data = await fetchRealData(filters)
        
        if (!data || data.length === 0) {
          console.log('⚠️ SEM DADOS - Usando fallback para datas')
          let datasFiltradas = FALLBACK_DISPONIBILIDADES
          if (destino) {
            datasFiltradas = datasFiltradas.filter((item: Disponibilidade) => item.destino === destino)
          }
          if (transporte) {
            datasFiltradas = datasFiltradas.filter((item: Disponibilidade) => item.transporte === transporte)
          }
          const datasFallback = datasFiltradas.map((item: Disponibilidade) => item.data_saida)
          const datasUnicas = [...new Set(datasFallback)]
          setDatas(datasUnicas)
          return
        }
        
        // ✅ EXTRAIR DATAS ÚNICAS DOS DADOS REAIS
        const datasSet = new Set(data.map((item: any) => item.data_saida as string))
        const datasUnicas = Array.from(datasSet).sort()
        
        console.log(`✅ DATAS ENCONTRADAS: ${datasUnicas.length}`, datasUnicas.slice(0, 5))
        setDatas(datasUnicas)
        
      } catch (err) {
        console.error('❌ Erro ao carregar datas, usando fallback:', err)
        let datasFiltradas = FALLBACK_DISPONIBILIDADES
        if (destino) {
          datasFiltradas = datasFiltradas.filter((item: Disponibilidade) => item.destino === destino)
        }
        if (transporte) {
          datasFiltradas = datasFiltradas.filter((item: Disponibilidade) => item.transporte === transporte)
        }
        const datasFallback = datasFiltradas.map((item: Disponibilidade) => item.data_saida)
        const datasUnicas = [...new Set(datasFallback)]
        setDatas(datasUnicas)
        setError(null)
      } finally {
        setLoading(false)
      }
    }

    fetchDatas()
  }, [destino, transporte])

  return { datas, loading, error }
}

export function useTransportesDisponiveis(destino?: string, dataSaida?: string) {
  const [transportes, setTransportes] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTransportes() {
      try {
        setLoading(true)
        let query = supabase
          .from('disponibilidades')
          .select('transporte')
          .order('transporte')

        if (destino) {
          query = query.eq('destino', destino)
        }
        if (dataSaida) {
          query = query.eq('data_saida', dataSaida)
        }

        const { data, error } = await query

        if (error && error.message.includes('Supabase não configurado')) {
          console.log('Supabase não configurado, usando transportes de fallback')
          let transportesFallback = FALLBACK_DISPONIBILIDADES.map((item: Disponibilidade) => item.transporte)
          if (destino) {
            transportesFallback = FALLBACK_DISPONIBILIDADES
              .filter((item: Disponibilidade) => item.destino === destino)
              .map((item: Disponibilidade) => item.transporte)
          }
          if (dataSaida) {
            transportesFallback = FALLBACK_DISPONIBILIDADES
              .filter((item: Disponibilidade) => item.data_saida === dataSaida)
              .map((item: Disponibilidade) => item.transporte)
          }
          const transportesUnicos = [...new Set(transportesFallback)]
          setTransportes(transportesUnicos)
          return
        }

        if (error) throw error
        
        // Extrair transportes únicos
        const transportesSet = new Set((data || []).map((item: any) => item.transporte as string))
        const transportesUnicos = Array.from(transportesSet) as string[]
        setTransportes(transportesUnicos)
      } catch (err) {
        console.error('Erro ao carregar transportes, usando fallback:', err)
        let transportesFallback = FALLBACK_DISPONIBILIDADES.map((item: Disponibilidade) => item.transporte)
        if (destino) {
          transportesFallback = FALLBACK_DISPONIBILIDADES
            .filter((item: Disponibilidade) => item.destino === destino)
            .map((item: Disponibilidade) => item.transporte)
        }
        if (dataSaida) {
          transportesFallback = FALLBACK_DISPONIBILIDADES
            .filter((item: Disponibilidade) => item.data_saida === dataSaida)
            .map((item: Disponibilidade) => item.transporte)
        }
        const transportesUnicos = [...new Set(transportesFallback)]
        setTransportes(transportesUnicos)
        setError(null)
      } finally {
        setLoading(false)
      }
    }

    fetchTransportes()
  }, [destino, dataSaida])

  return { transportes, loading, error }
} 
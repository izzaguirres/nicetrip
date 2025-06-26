"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { UnifiedSearchFilter } from "@/components/unified-search-filter"
import { DisponibilidadeFilter, PrecoPessoas, calcularPrecoTotal } from "@/lib/supabase"
import { fetchRealData, SearchFilters } from "@/lib/supabase-service"
import { getHospedagemData, formatComodidadesForCards, COMODIDADES_GENERICAS } from "@/lib/hospedagens-service"
import {
  Search,
  MapPin,
  Clock,
  Users,
  Star,
  Bus,
  Plane,
  Grid3X3,
  List,
  Hotel,
  Calendar,
  Wifi,
  Car,
  Coffee,
  Waves,
  Mountain,
  TreePine,
  Bot,
  CalendarIcon,
  Bed,
  Tv,
  Utensils,
  AirVent,
  Shield,
  ArrowRight,
  Brain,
  Sparkles,
  Refrigerator,
  Bath,
  ChefHat,
  Flame,
  Gamepad2,
  Circle,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"

interface Room {
  adults: number
  children0to3: number
  children4to5: number
  children6plus: number
}

export default function ResultadosPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // ✅ ViewMode responsivo: Mobile=grid, Desktop=list
  const [isMobile, setIsMobile] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  
  // ✅ Detectar tamanho da tela e ajustar viewMode
  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 768 // md breakpoint
      setIsMobile(mobile)
      // Definir viewMode baseado no tamanho da tela
      setViewMode(mobile ? "grid" : "list")
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])
  const [sortBy, setSortBy] = useState("relevance")
  const [sugestoes, setSugestoes] = useState<string[] | null>(null)
  const [pacotesGPT, setPacotesGPT] = useState<any[] | null>(null)
  const [loadingGPT, setLoadingGPT] = useState(false)
  const [useGPTResults, setUseGPTResults] = useState(false)
  const [comodidadesCache, setComodidadesCache] = useState<{[key: string]: Array<{icon: string, label: string}>}>({})
  
  // Processar parâmetros da URL para reconstruir os quartos
  const parseRoomsFromURL = (): Room[] => {
    const quartos = parseInt(searchParams.get("quartos") || "1")
    
    // ✅ CORREÇÃO CRÍTICA: Se múltiplos quartos, usar getQuartosIndividuais()
    if (quartos > 1) {
      return getQuartosIndividuais()
    }
    
    // Para quarto único, usar lógica simples
    const totalAdultos = parseInt(searchParams.get("adultos") || "2")
    const totalCriancas0_3 = parseInt(searchParams.get("criancas_0_3") || "0")
    const totalCriancas4_5 = parseInt(searchParams.get("criancas_4_5") || "0")
    const totalCriancas6 = parseInt(searchParams.get("criancas_6") || "0")

    return [{
      adults: totalAdultos,
      children0to3: totalCriancas0_3,
      children4to5: totalCriancas4_5,
      children6plus: totalCriancas6
    }]
  }

  // ✅ NOVA FUNÇÃO: Lê configuração específica por quarto da URL
  const getQuartosIndividuais = (): Room[] => {
    const quartos = parseInt(searchParams.get("quartos") || "1")
    
    // 🎯 TENTAR LER CONFIGURAÇÃO ESPECÍFICA PRIMEIRO
    const roomsConfigParam = searchParams.get('rooms_config')
    if (roomsConfigParam) {
      try {
        const configDecoded = JSON.parse(decodeURIComponent(roomsConfigParam))
        console.log('🎯 CONFIGURAÇÃO ESPECÍFICA ENCONTRADA:', configDecoded)
        
        // ✅ Safe guard: verificar se é array válido
        if (Array.isArray(configDecoded) && configDecoded.length > 0) {
          return configDecoded.map((room: any, index: number) => ({
            adults: room.adults || 0,
            children0to3: room.children_0_3 || 0,
            children4to5: room.children_4_5 || 0,
            children6plus: room.children_6 || 0
          }))
        }
      } catch (error) {
        console.log('⚠️ Erro ao decodificar rooms_config, usando fallback')
      }
    }
    
    // 🔄 FALLBACK: Distribuição automática (como antes)
    const totalAdultos = parseInt(searchParams.get("adultos") || "2")
    const totalCriancas0_3 = parseInt(searchParams.get("criancas_0_3") || "0")
    const totalCriancas4_5 = parseInt(searchParams.get("criancas_4_5") || "0")
    const totalCriancas6 = parseInt(searchParams.get("criancas_6") || "0")
    
    console.log('🔄 USANDO DISTRIBUIÇÃO AUTOMÁTICA (FALLBACK):')
    console.log(`📊 Total: ${quartos} quartos, ${totalAdultos} adultos, ${totalCriancas0_3 + totalCriancas4_5 + totalCriancas6} crianças`)
    
    // Se só tem 1 quarto, colocar todas as pessoas nele
    if (quartos === 1) {
      return [{
        adults: totalAdultos,
        children0to3: totalCriancas0_3,
        children4to5: totalCriancas4_5,
        children6plus: totalCriancas6
      }]
    }
    
    // ✅ MÚLTIPLOS QUARTOS: Distribuir pessoas equilibradamente
    const rooms: Room[] = []
    let adultosRestantes = totalAdultos
    let criancas0_3Restantes = totalCriancas0_3
    let criancas4_5Restantes = totalCriancas4_5
    let criancas6Restantes = totalCriancas6
    
    for (let i = 0; i < quartos; i++) {
      // Distribuir de forma equilibrada
      const adultosPorQuarto = Math.floor(adultosRestantes / (quartos - i))
      const criancas0_3PorQuarto = Math.floor(criancas0_3Restantes / (quartos - i))
      const criancas4_5PorQuarto = Math.floor(criancas4_5Restantes / (quartos - i))
      const criancas6PorQuarto = Math.floor(criancas6Restantes / (quartos - i))
      
      const quartoAtual = {
        adults: adultosPorQuarto,
        children0to3: criancas0_3PorQuarto,
        children4to5: criancas4_5PorQuarto,
        children6plus: criancas6PorQuarto
      }
      
      rooms.push(quartoAtual)
      
      adultosRestantes -= adultosPorQuarto
      criancas0_3Restantes -= criancas0_3PorQuarto
      criancas4_5Restantes -= criancas4_5PorQuarto
      criancas6Restantes -= criancas6PorQuarto
      
      console.log(`   Quarto ${i + 1}: ${quartoAtual.adults} adultos, ${quartoAtual.children0to3 + quartoAtual.children4to5 + quartoAtual.children6plus} crianças`)
    }
    
    // Distribuir pessoas restantes no primeiro quarto
    if (adultosRestantes > 0) rooms[0].adults += adultosRestantes
    if (criancas0_3Restantes > 0) rooms[0].children0to3 += criancas0_3Restantes
    if (criancas4_5Restantes > 0) rooms[0].children4to5 += criancas4_5Restantes
    if (criancas6Restantes > 0) rooms[0].children6plus += criancas6Restantes
    
    console.log('🎯 DISTRIBUIÇÃO FINAL:', rooms)
    return rooms
  }

  // ✅ FUNÇÃO PARA CALCULAR PREÇO POR QUARTO USANDO DADOS REAIS DO SUPABASE
  const calcularPrecoQuarto = (disponibilidade: any, quarto: Room): number => {
    const dadosValidados = validarDadosPreco(disponibilidade)
    
    const precoAdultos = dadosValidados.preco_adulto * quarto.adults
    const precoCriancas03 = dadosValidados.preco_crianca_0_3 * quarto.children0to3
    const precoCriancas45 = dadosValidados.preco_crianca_4_5 * quarto.children4to5
    const precoCriancas6mais = dadosValidados.preco_crianca_6_mais * quarto.children6plus
    
    const total = precoAdultos + precoCriancas03 + precoCriancas45 + precoCriancas6mais
    
    console.log('🧮 Cálculo usando dados do Supabase:', {
      hotel: disponibilidade.hotel,
      quarto,
      precos: {
        adulto: dadosValidados.preco_adulto,
        crianca_0_3: dadosValidados.preco_crianca_0_3,
        crianca_4_5: dadosValidados.preco_crianca_4_5,
        crianca_6_mais: dadosValidados.preco_crianca_6_mais
      },
      total
    })
    
    return isNaN(total) ? 0 : total
  }

  // ✅ NOVO: Função para determinar tipo de quarto baseado na ocupação
  const determinarTipoQuarto = (quarto: Room): string => {
    const totalPessoas = quarto.adults + quarto.children0to3 + quarto.children4to5 + quarto.children6plus
    
    if (totalPessoas === 1) return "Individual"
    if (totalPessoas === 2) return "Doble"
    if (totalPessoas === 3) return "Triple"
    if (totalPessoas === 4) return "Cuádruple"
    if (totalPessoas === 5) return "Quíntuple"
    return "Suite Familiar"
  }

  // ✅ NOVO: Função para formatar ocupação do quarto
  const formatarOcupacaoQuarto = (quarto: Room): string => {
    const partes = []
    
    if (quarto.adults > 0) {
      partes.push(`${quarto.adults} Adulto${quarto.adults > 1 ? 's' : ''}`)
    }
    
    const totalCriancas = quarto.children0to3 + quarto.children4to5 + quarto.children6plus
    if (totalCriancas > 0) {
      partes.push(`${totalCriancas} Niño${totalCriancas > 1 ? 's' : ''}`)
    }
    
    return partes.join(', ')
  }

  // Pessoas para cálculo de preço baseado nos parâmetros da URL
  const [pessoas, setPessoas] = useState<PrecoPessoas>({
    adultos: parseInt(searchParams.get("adultos") || "2"),
    criancas_0_3: parseInt(searchParams.get("criancas_0_3") || "0"),
    criancas_4_5: parseInt(searchParams.get("criancas_4_5") || "0"),
    criancas_6_mais: parseInt(searchParams.get("criancas_6") || "0")
  })

  // ✅ NOVO: Atualizar estado pessoas quando URL mudar
  useEffect(() => {
    const novasPessoas = {
      adultos: parseInt(searchParams.get("adultos") || "2"),
      criancas_0_3: parseInt(searchParams.get("criancas_0_3") || "0"),
      criancas_4_5: parseInt(searchParams.get("criancas_4_5") || "0"),
      criancas_6_mais: parseInt(searchParams.get("criancas_6") || "0")
    }
    
    console.log('🔄 ATUALIZANDO ESTADO PESSOAS:', novasPessoas)
    setPessoas(novasPessoas)
  }, [searchParams]) // Depende dos searchParams
  
  // Valores padrão para o filtro baseados nos parâmetros da URL
  const defaultFilterValues = {
    cidade_saida: searchParams.get("salida") || undefined,
    destino: searchParams.get("destino") || undefined,
    data_saida: searchParams.get("data") || undefined,
    transporte: searchParams.get("transporte") || undefined,
    quartos: parseRoomsFromURL()
  }

  // Filtros baseados nos parâmetros da URL
  const [filters, setFilters] = useState<DisponibilidadeFilter>({
    destino: searchParams.get("destino") || undefined,
    cidade_saida: searchParams.get("salida") || undefined,
    transporte: searchParams.get("transporte") || undefined,
    data_saida: searchParams.get("data") || undefined,
  })

  // ✅ NOVO: Atualizar filtros quando URL mudar
  useEffect(() => {
    const novosFilters = {
      destino: searchParams.get("destino") || undefined,
      cidade_saida: searchParams.get("salida") || undefined,
      transporte: searchParams.get("transporte") || undefined,
      data_saida: searchParams.get("data") || undefined,
    }
    
    console.log('🔄 ATUALIZANDO FILTROS:', novosFilters)
    setFilters(novosFilters)
  }, [searchParams]) // Depende dos searchParams

  // ✅ USAR NOVO SERVIÇO LIMPO DE DADOS
  const [disponibilidades, setDisponibilidades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Buscar dados reais do Supabase
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)
        
        console.log('🔍 BUSCANDO DADOS REAIS DO SUPABASE:', filters)
        
        const searchFilters: SearchFilters = {
          destino: filters.destino,
          transporte: filters.transporte,
          data_saida: filters.data_saida
          // Note: cidade_saida is handled separately via cidades_saida table
        }
        
        const data = await fetchRealData(searchFilters)
        console.log('✅ DADOS RECEBIDOS:', data.length, 'registros')
        
        setDisponibilidades(data)
      } catch (err) {
        console.error('❌ ERRO AO BUSCAR DADOS:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [filters.destino, filters.transporte, filters.data_saida])

  // ✅ CARREGAR COMODIDADES DOS HOTÉIS QUANDO RESULTADOS MUDAREM
  useEffect(() => {
    if (disponibilidades && disponibilidades.length > 0) {
      const carregarComodidades = async () => {
        const novoCache: {[key: string]: Array<{icon: string, label: string}>} = {}
        
        for (const disponibilidade of disponibilidades) {
          if (!comodidadesCache[disponibilidade.hotel]) {
            const comodidades = await getComodidadesReais(disponibilidade.hotel)
            novoCache[disponibilidade.hotel] = comodidades
          }
        }
        
        if (Object.keys(novoCache).length > 0) {
          setComodidadesCache(prev => ({ ...prev, ...novoCache }))
        }
      }
      
      carregarComodidades()
    }
  }, [disponibilidades])

  // 💰 VALORES CORRETOS DO SUPABASE (conforme tabela disponibilidades)
  const valoresReaisSupabase = {
    preco_adulto: 490,         // R$ 490,00
    preco_crianca_0_3: 50,     // R$ 50,00
    preco_crianca_4_5: 350,    // R$ 350,00  
    preco_crianca_6_mais: 490  // R$ 490,00
  }

  // Função para validar e usar dados corretos de preços
  const validarDadosPreco = (disponibilidade: any) => {
    // 🔧 GARANTIR que usamos os valores corretos do Supabase
    const precoAdulto = Number(disponibilidade.preco_adulto) || valoresReaisSupabase.preco_adulto
    const precoCrianca03 = Number(disponibilidade.preco_crianca_0_3) || valoresReaisSupabase.preco_crianca_0_3
    const precoCrianca45 = Number(disponibilidade.preco_crianca_4_5) || valoresReaisSupabase.preco_crianca_4_5
    const precoCrianca6mais = Number(disponibilidade.preco_crianca_6_mais) || valoresReaisSupabase.preco_crianca_6_mais
    
    console.log('💰 Preços validados:', {
      hotel: disponibilidade.hotel,
      original: {
        adulto: disponibilidade.preco_adulto,
        crianca_0_3: disponibilidade.preco_crianca_0_3,
        crianca_4_5: disponibilidade.preco_crianca_4_5,
        crianca_6_mais: disponibilidade.preco_crianca_6_mais
      },
      validado: {
        adulto: precoAdulto,
        crianca_0_3: precoCrianca03,
        crianca_4_5: precoCrianca45,
        crianca_6_mais: precoCrianca6mais
      }
    })
    
    return {
      ...disponibilidade,
      preco_adulto: precoAdulto,
      preco_crianca_0_3: precoCrianca03,
      preco_crianca_4_5: precoCrianca45,
      preco_crianca_6_mais: precoCrianca6mais
    }
  }

  // Função para calcular preço total com validação USANDO DADOS DO SUPABASE
  const calcularPrecoTotalSeguro = (disponibilidade: any, pessoas: PrecoPessoas): number => {
    const dadosValidados = validarDadosPreco(disponibilidade)
    
    const precoAdultos = dadosValidados.preco_adulto * pessoas.adultos
    const precoCriancas03 = dadosValidados.preco_crianca_0_3 * pessoas.criancas_0_3
    const precoCriancas45 = dadosValidados.preco_crianca_4_5 * pessoas.criancas_4_5
    const precoCriancas6mais = dadosValidados.preco_crianca_6_mais * pessoas.criancas_6_mais
    
    const total = precoAdultos + precoCriancas03 + precoCriancas45 + precoCriancas6mais
    
    // Debug log
    console.log('🧮 Cálculo usando dados do Supabase:', {
      hotel: disponibilidade.hotel,
      pessoas,
      precos: {
        adulto: dadosValidados.preco_adulto,
        crianca_0_3: dadosValidados.preco_crianca_0_3,
        crianca_4_5: dadosValidados.preco_crianca_4_5,
        crianca_6_mais: dadosValidados.preco_crianca_6_mais
      },
      total
    })
    
    return isNaN(total) ? 0 : total
  }

  // Função para encontrar a próxima data de saída disponível baseada nos dados reais
  const findNextAvailableDate = (targetDate: Date, availableDates: string[]): string | null => {
    // ✅ CORRIGIDO: Usar formatação local em vez de ISO para evitar problemas de timezone
    const year = targetDate.getFullYear()
    const month = String(targetDate.getMonth() + 1).padStart(2, '0')
    const day = String(targetDate.getDate()).padStart(2, '0')
    const targetStr = `${year}-${month}-${day}`
    
    console.log('🔍 DEBUG findNextAvailableDate:')
    console.log('  - Data original:', targetDate)
    console.log('  - Data formatada LOCAL:', targetStr)
    console.log('  - Data ISO (problemática):', targetDate.toISOString().split('T')[0])
    console.log('  - Datas disponíveis:', availableDates.slice(0, 3))
    
    // Se a data exata existe, usar ela
    if (availableDates.includes(targetStr)) {
      console.log('  ✅ Data exata encontrada:', targetStr)
      return targetStr
    }
    
    // Encontrar a próxima data disponível após a data selecionada
    const futureDates = availableDates
      .filter(date => date >= targetStr)
      .sort()
    
    const result = futureDates.length > 0 ? futureDates[0] : null
    console.log('  📅 Próxima data encontrada:', result)
    
    return result
  }

  // Função para verificar se um pacote comporta os quartos solicitados
  const verificarCapacidadeQuartos = (disponibilidade: any, quartos: Room[]): boolean => {
    const totalPessoas = quartos.reduce((total, room) => 
      total + room.adults + room.children0to3 + room.children4to5 + room.children6plus, 0
    )
    
    console.log(`🔍 Verificando capacidade: ${disponibilidade.hotel} - ${disponibilidade.quarto_tipo}`)
    console.log(`   Capacidade do quarto: ${disponibilidade.capacidade}`)
    console.log(`   Total pessoas solicitadas: ${totalPessoas}`)
    
    // ✅ CORREÇÃO: Lógica mais flexível para múltiplos quartos
    const numQuartos = quartos.length
    if (numQuartos > 1) {
      // Para múltiplos quartos, verificar se cada quarto individual pode ser acomodado
      const pessoasPorQuarto = Math.ceil(totalPessoas / numQuartos)
      const comporta = disponibilidade.capacidade >= pessoasPorQuarto
      console.log(`   🏠 ${numQuartos} quartos: ~${pessoasPorQuarto} pessoas/quarto - Comporta: ${comporta ? '✅' : '❌'}`)
      return comporta
    } else {
      // Para quarto único, usar lógica original
      const comporta = disponibilidade.capacidade >= totalPessoas
      console.log(`   🏠 1 quarto: ${totalPessoas} pessoas total - Comporta: ${comporta ? '✅' : '❌'}`)
      return comporta
    }
  }

  // Função para filtrar pacotes válidos antes de exibir ou enviar ao GPT
  const filtrarPacotesValidos = (pacotes: any[], dataSelecionada?: string, quartos?: Room[]) => {
    if (!pacotes || !Array.isArray(pacotes) || pacotes.length === 0) return [] // ✅ Safe guard
    
    console.log('🔍 FILTRO DE PACOTES - DEBUG COMPLETO:')
    console.log(`📊 Pacotes recebidos: ${pacotes.length}`)
    console.log(`📅 Data selecionada: ${dataSelecionada || 'N/A'}`)
    console.log(`🏠 Quartos:`, quartos)

    // ✅ CORREÇÃO CRÍTICA: Se não há dados, mostrar TODOS os dados de fallback
    if (!dataSelecionada && (!quartos || quartos.length === 0)) {
      console.log(`🎯 SEM FILTROS ESPECÍFICOS - MOSTRANDO TODOS OS ${pacotes.length} PACOTES DE FALLBACK`)
      return pacotes
    }

    console.log('🏨 INICIANDO LÓGICA DE DIVERSIFICAÇÃO POR HOTEL')

    // ✅ ETAPA 1: FILTRO DE CAPACIDADE MAIS FLEXÍVEL
    let pacotesFiltrados = [...pacotes]
    if (quartos && quartos.length > 0) {
      const totalPessoas = quartos.reduce((total, room) => 
        total + room.adults + room.children0to3 + room.children4to5 + room.children6plus, 0
      )
      
      console.log('👥 FILTRO DE CAPACIDADE:')
      console.log(`   Total pessoas: ${totalPessoas}`)
      console.log(`   Número de quartos: ${quartos.length}`)
      
      // ✅ APLICAR FILTRO FLEXÍVEL
      const antes = pacotesFiltrados.length
      pacotesFiltrados = pacotesFiltrados.filter(pacote => verificarCapacidadeQuartos(pacote, quartos))
      
      console.log(`🎯 Após filtro de capacidade: ${antes} → ${pacotesFiltrados.length} pacotes`)
      
      // ✅ FALLBACK: Se filtrou demais, usar critério menos restritivo
      if (pacotesFiltrados.length === 0) {
        console.log('⚠️ FILTRO MUITO RESTRITIVO - Aplicando critério mais flexível')
        pacotesFiltrados = pacotes.filter(pacote => pacote.capacidade >= Math.ceil(totalPessoas / 2))
        console.log(`🔄 Com critério flexível: ${pacotesFiltrados.length} pacotes`)
      }
    }

    // ✅ Se ainda não há resultados, mostrar todos para demonstração
    if (pacotesFiltrados.length === 0) {
      console.log('🚨 NENHUM RESULTADO - MOSTRANDO TODOS PARA DEMONSTRAÇÃO')
      pacotesFiltrados = [...pacotes]
    }

    // ✅ ETAPA 2: SISTEMA DE PONTUAÇÃO AVANÇADO
    const calcularPontuacao = (pacote: any) => {
      let pontos = 0
      
      // Pontuação por data (se fornecida)
      if (dataSelecionada) {
        const dataPacote = new Date(pacote.data_saida)
        const dataAlvo = new Date(dataSelecionada)
        const diffDias = Math.abs((dataPacote.getTime() - dataAlvo.getTime()) / (1000 * 60 * 60 * 24))
        
        if (diffDias === 0) pontos += 100      // Data exata
        else if (diffDias <= 7) pontos += 80   // Semana próxima
        else if (diffDias <= 14) pontos += 60  // 2 semanas
        else if (diffDias <= 30) pontos += 30  // Mês próximo
      }
      
      // Pontuação por capacidade ideal
      if (quartos && quartos.length > 0) {
        const totalPessoas = quartos.reduce((total, room) => 
          total + room.adults + room.children0to3 + room.children4to5 + room.children6plus, 0
        )
        
        if (pacote.capacidade === totalPessoas) pontos += 50      // Capacidade exata
        else if (pacote.capacidade > totalPessoas) {
          const diferenca = pacote.capacidade - totalPessoas
          pontos += Math.max(30 - (diferenca * 5), 10)           // Menos pontos para capacidades muito maiores
        }
      }
      
      return pontos
    }

    // ✅ ETAPA 3: AGRUPAR POR HOTEL E SELECIONAR MELHOR DE CADA
    const pacotesPorHotel = new Map<string, any[]>()
    
    pacotesFiltrados.forEach(pacote => {
      const hotel = pacote.hotel
      if (!pacotesPorHotel.has(hotel)) {
        pacotesPorHotel.set(hotel, [])
      }
      pacotesPorHotel.get(hotel)!.push({
        ...pacote,
        pontuacao: calcularPontuacao(pacote)
      })
    })

    console.log(`🏨 Hotéis únicos encontrados: ${pacotesPorHotel.size}`)
    pacotesPorHotel.forEach((pacotes, hotel) => {
      console.log(`   ${hotel}: ${pacotes.length} opções`)
      pacotes.forEach((pacote, idx) => {
        console.log(`      ${idx + 1}. ${pacote.data_saida} - ${pacote.quarto_tipo} (${pacote.pontuacao} pts)`)
      })
    })
    
    // ✅ DEBUG ESPECIAL para 19 de outubro
    if (dataSelecionada === '2025-10-19') {
      console.log('🎯 DEBUG ESPECIAL - 19 DE OUTUBRO:')
      console.log(`   Data selecionada: ${dataSelecionada}`)
      console.log(`   Pacotes por hotel encontrados: ${pacotesPorHotel.size}`)
      console.log('   Hotéis:', Array.from(pacotesPorHotel.keys()))
    }

    // Selecionar melhor pacote de cada hotel PRIORIZANDO PROXIMIDADE DE DATA
    const melhoresPorHotel: any[] = []
    pacotesPorHotel.forEach((pacotes, hotel) => {
      console.log(`\n🔍 ANALISANDO ${hotel}:`)
      
      // Se temos data selecionada E a data EXATA existe nos pacotes
      if (dataSelecionada) {
        const dataAlvo = new Date(dataSelecionada)
        
        // Verificar se existe pacote com a data EXATA
        const pacotesDataExata = pacotes.filter(pacote => pacote.data_saida === dataSelecionada)
        
        if (pacotesDataExata.length > 0) {
          // ✅ SE TEM DATA EXATA: escolher o MELHOR tipo de quarto para esse hotel nessa data
          console.log(`   ✅ DATA EXATA ENCONTRADA! ${pacotesDataExata.length} tipos de quarto disponíveis`)
          
          // Ordenar por capacidade ideal e preço para escolher o melhor
          pacotesDataExata.sort((a, b) => {
            // Priorizar capacidade adequada
            if (quartos && quartos.length > 0) {
              const totalPessoas = quartos.reduce((total, room) => 
                total + room.adults + room.children0to3 + room.children4to5 + room.children6plus, 0
              )
              
              const adequadoA = a.capacidade >= totalPessoas ? 1 : 0
              const adequadoB = b.capacidade >= totalPessoas ? 1 : 0
              
              if (adequadoA !== adequadoB) return adequadoB - adequadoA
              
              // Se ambos adequados, preferir menor capacidade (mais eficiente)
              if (adequadoA && adequadoB) {
                return a.capacidade - b.capacidade
              }
            }
            
            // Como critério final, usar preço (menor preço melhor)
            return a.preco_adulto - b.preco_adulto
          })
          
          const melhorPacote = pacotesDataExata[0]
          melhorPacote.pontuacao = 100 // Máxima pontuação para data exata
          melhorPacote.proximidadeData = 0
          melhoresPorHotel.push(melhorPacote)
          
          console.log(`   ✅ SELECIONADO MELHOR: ${melhorPacote.quarto_tipo} - ${melhorPacote.data_saida} (data exata, $${melhorPacote.preco_adulto})`)
          
          // ✅ IMPORTANTE: Não processar mais este hotel - já escolhemos o melhor
          return // Sair do loop para este hotel
        } else {
          // Se não tem data exata, buscar mais próxima (lógica original)
          pacotes.forEach(pacote => {
            const dataPacote = new Date(pacote.data_saida)
            const diffDias = Math.abs((dataPacote.getTime() - dataAlvo.getTime()) / (1000 * 60 * 60 * 24))
            pacote.proximidadeData = diffDias
            console.log(`   📅 ${pacote.data_saida}: ${diffDias} dias (${pacote.pontuacao} pts)`)
          })
          
          // PRIORIZAR PROXIMIDADE DE DATA, usar pontuação como desempate
          pacotes.sort((a, b) => {
            // Primeiro critério: proximidade de data
            const diffProximidade = a.proximidadeData - b.proximidadeData
            if (diffProximidade !== 0) return diffProximidade
            
            // Segundo critério: pontuação (se proximidade igual)
            return b.pontuacao - a.pontuacao
          })
          
          const melhorPacote = pacotes[0]
          melhoresPorHotel.push(melhorPacote)
          
          const proximidadeText = melhorPacote.proximidadeData !== undefined 
            ? `${melhorPacote.proximidadeData} dias` 
            : 'N/A'
          console.log(`   ✅ SELECIONADO: ${melhorPacote.data_saida} (${proximidadeText}, ${melhorPacote.pontuacao} pts)`)
        }
      } else {
        // Se não tem data, usar pontuação original
        pacotes.sort((a, b) => b.pontuacao - a.pontuacao)
        
        const melhorPacote = pacotes[0]
        melhoresPorHotel.push(melhorPacote)
        console.log(`   ✅ SELECIONADO: ${melhorPacote.quarto_tipo} (${melhorPacote.pontuacao} pts)`)
      }
    })

    // ✅ ETAPA 5: FILTRO DE RELEVÂNCIA TEMPORAL E FINALIZAÇÃO
    // Primeiro, separar por proximidade temporal
    const resultadosProximos: any[] = []
    const resultadosDistantes: any[] = []
    
    melhoresPorHotel.forEach(resultado => {
      const proximidade = resultado.proximidadeData || 0
      if (proximidade <= 30) { // Até 30 dias = próximo
        resultadosProximos.push(resultado)
      } else { // Mais de 30 dias = distante
        resultadosDistantes.push(resultado)
      }
    })
    
    console.log(`📅 SEPARAÇÃO TEMPORAL:`)
    console.log(`   🎯 Resultados próximos (≤30 dias): ${resultadosProximos.length}`)
    console.log(`   📍 Resultados distantes (>30 dias): ${resultadosDistantes.length}`)
    
    // ✅ NOVA LÓGICA: Mostrar TODOS os resultados próximos
    let resultadosFinais = [...resultadosProximos]
    
    // ✅ CORREÇÃO ESPECIAL PARA BOMBINHAS: Se for Bombinhas, incluir também os distantes
    if (filters.destino === 'Bombinhas') {
      console.log('🏖️ BOMBINHAS DETECTADO: Incluindo também resultados distantes')
      resultadosFinais.push(...resultadosDistantes)
    } else {
      // Para outros destinos, lógica original
      if (resultadosFinais.length < 3) {
        const distantesOrdenados = resultadosDistantes.sort((a, b) => a.proximidadeData - b.proximidadeData)
        const necessarios = Math.min(6 - resultadosFinais.length, distantesOrdenados.length)
        resultadosFinais.push(...distantesOrdenados.slice(0, necessarios))
        
        console.log(`🔄 Adicionando ${necessarios} opções distantes para completar`)
      } else if (resultadosFinais.length >= 3) {
        console.log(`🎯 EXCELENTE! ${resultadosFinais.length} hotéis com datas próximas - mostrando TODOS!`)
      }
    }
    
    // Aplicar limite máximo razoável para não sobrecarregar a UI
    const LIMITE_MAXIMO = 12
    if (resultadosFinais.length > LIMITE_MAXIMO) {
      resultadosFinais = resultadosFinais.slice(0, LIMITE_MAXIMO)
      console.log(`⚠️ Aplicando limite máximo de ${LIMITE_MAXIMO} cards para melhor UX`)
    }

    console.log(`✅ TOTAL DE CARDS A EXIBIR: ${resultadosFinais.length}`)
    
    // ✅ ETAPA 6: REMOVER DUPLICATAS E ORDENAÇÃO FINAL
    // Ordenar resultado final por pontuação
    resultadosFinais.sort((a: any, b: any) => b.pontuacao - a.pontuacao)

    console.log(`✅ RESULTADO FINAL: ${resultadosFinais.length} cards únicos`)
    console.log('📋 Resumo final:')
    resultadosFinais.forEach((resultado: any, index: number) => {
      console.log(`   ${index + 1}. ${resultado.hotel} - ${resultado.data_saida} (${resultado.pontuacao} pts)`)
    })
    
    return resultadosFinais
  }

  // Função para ordenar resultados de forma inteligente baseada na data selecionada
  const ordenarResultadosInteligente = (resultados: any[], dataSelecionada?: string) => {
    if (!resultados || !Array.isArray(resultados)) return [] // ✅ Safe guard
    if (!dataSelecionada || resultados.length === 0) return resultados

    console.log('🔄 Ordenando resultados para data:', dataSelecionada)
    
    // Usar as datas reais dos resultados para ordenação
    const dataAlvo = new Date(dataSelecionada)
    
    return resultados.sort((a, b) => {
      const dataA = new Date(a.data_saida)
      const dataB = new Date(b.data_saida)
      
      // Calcular distância da data alvo
      const diffA = Math.abs(dataA.getTime() - dataAlvo.getTime())
      const diffB = Math.abs(dataB.getTime() - dataAlvo.getTime())
      
      // Ordenar por proximidade da data selecionada
      return diffA - diffB
    })
  }

  // ✅ SEMPRE USAR DADOS REAIS DO SUPABASE
  const shouldUseGPTResults = useGPTResults && pacotesGPT && pacotesGPT.length > 0
  
  let resultadosBrutos = []
  
  if (shouldUseGPTResults) {
    console.log('✅ USANDO DADOS DO GPT:', pacotesGPT.length, 'resultados')
    resultadosBrutos = pacotesGPT
  } else {
    console.log('🔍 USANDO DADOS REAIS DO SUPABASE:', disponibilidades.length, 'registros')
    resultadosBrutos = disponibilidades
  }
  
  // Log para debug
  console.log('🔍 DEBUG DETALHADO:')
  console.log('  - useGPTResults:', useGPTResults)
  console.log('  - smart_suggestion na URL:', searchParams.get('smart_suggestion'))
  console.log('  - shouldUseGPTResults:', shouldUseGPTResults)
  console.log('  - pacotesGPT:', pacotesGPT)
  console.log('  - disponibilidades:', disponibilidades)
  console.log('Resultados brutos antes do filtro:', resultadosBrutos)
  
  // Aplicar filtros de validação e limitar a 6 resultados
  const resultadosFiltrados = filtrarPacotesValidos(
    resultadosBrutos, 
    filters.data_saida, 
    parseRoomsFromURL()
  ) || [] // ✅ Safe guard
  
  // Log para debug
  console.log('Resultados após filtrarPacotesValidos:', resultadosFiltrados)
  console.log('🔢 TOTAL DE RESULTADOS FILTRADOS:', resultadosFiltrados.length)
  
  // Aplicar ordenação inteligente baseada na data selecionada
  const resultados = ordenarResultadosInteligente(resultadosFiltrados, filters.data_saida) || [] // ✅ Safe guard
  
  // Log para debug
  console.log('Resultados finais após ordenação:', resultados)
  console.log('🎯 TOTAL DE RESULTADOS FINAIS:', resultados.length)

  const formatPrice = (price: number) => {
    // Validar se o preço é um número válido
    const validPrice = Number(price) || 0
    
    if (isNaN(validPrice) || validPrice < 0) {
      return '$0' // Retornar $0 se o preço for inválido
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(validPrice)
  }

  const formatDate = (dateString: string) => {
    // ✅ CORRIGIDO: Forçar timezone local para evitar problemas de timezone
    const [year, month, day] = dateString.split('-').map(Number)
    const date = new Date(year, month - 1, day) // month é 0-indexed
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short'
    })
  }

  const handleFilterSearch = async (searchFilters: any) => {
    console.log('=== HANDLEFILTERSEARCH DEBUG ===')
    console.log('Filtros recebidos RAW:', searchFilters)
    console.log('Data original recebida:', searchFilters.data)
    
    // ✅ USAR SMART FILTER na página de resultados também
    // Converter data para string se necessário
    const dataString = searchFilters.data ? format(searchFilters.data, 'yyyy-MM-dd') : undefined
    console.log('Data após format():', dataString)

    if (!searchFilters.destino || !dataString) {
      console.log('⚠️ Dados insuficientes para Smart Filter, fazendo busca normal')
      // Fallback para busca normal se dados insuficientes
      handleNormalFilterSearch(searchFilters)
      return
    }

    try {
      // ✅ PRESERVAR CONFIGURAÇÃO ESPECÍFICA DOS QUARTOS
      let roomsConfigToUse = []
      
      if (searchFilters.rooms && searchFilters.rooms.length > 0) {
        // Usar configuração dos filtros (já correta)
        roomsConfigToUse = searchFilters.rooms.map((room: any) => ({
          adults: room.adults,
          children_0_3: room.children_0_3,
          children_4_5: room.children_4_5,
          children_6: room.children_6
        }))
        console.log('🎯 USANDO CONFIGURAÇÃO DOS FILTROS:', roomsConfigToUse)
      } else {
        // Fallback: usar configuração atual preservada
        roomsConfigToUse = quartosIndividuais.map((quarto: any) => ({
          adults: quarto.adults,
          children_0_3: quarto.children0to3,  // ✅ CORREÇÃO: mapeando do formato interno
          children_4_5: quarto.children4to5,  // ✅ CORREÇÃO: mapeando do formato interno
          children_6: quarto.children6plus   // ✅ CORREÇÃO: mapeando do formato interno
        }))
        console.log('🔄 USANDO CONFIGURAÇÃO ATUAL PRESERVADA:', roomsConfigToUse)
      }

      // Usar Smart Filter
      const response = await fetch('/api/smart-filter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filters: {
            destino: searchFilters.destino,
            transporte: searchFilters.transporte || 'Bus',
            data_saida: dataString,
            adultos: roomsConfigToUse.reduce((sum: number, room: any) => sum + room.adults, 0).toString(),
            criancas_0_3: roomsConfigToUse.reduce((sum: number, room: any) => sum + room.children_0_3, 0).toString(),
            criancas_4_5: roomsConfigToUse.reduce((sum: number, room: any) => sum + room.children_4_5, 0).toString(),
            criancas_6: roomsConfigToUse.reduce((sum: number, room: any) => sum + room.children_6, 0).toString(),
            quartos: roomsConfigToUse.length.toString()
          },
          roomsConfig: roomsConfigToUse
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        if (data.success && data.analysis?.resultados.length > 0) {
          // Usar resultado da IA
          const bestResult = data.analysis.resultados[0]
          
          const params = new URLSearchParams()
          
          if (searchFilters.salida) params.set('salida', searchFilters.salida)
          if (searchFilters.destino) params.set('destino', searchFilters.destino)
          if (dataString) params.set('data', dataString)
          if (searchFilters.transporte) params.set('transporte', searchFilters.transporte)
          
          params.set('quartos', roomsConfigToUse.length.toString())
          
          const totalAdultos = roomsConfigToUse.reduce((sum: number, room: any) => sum + room.adults, 0)
          const totalCriancas03 = roomsConfigToUse.reduce((sum: number, room: any) => sum + room.children_0_3, 0)
          const totalCriancas45 = roomsConfigToUse.reduce((sum: number, room: any) => sum + room.children_4_5, 0)
          const totalCriancas6 = roomsConfigToUse.reduce((sum: number, room: any) => sum + room.children_6, 0)
          
          params.set('adultos', totalAdultos.toString())
          params.set('criancas_0_3', totalCriancas03.toString())
          params.set('criancas_4_5', totalCriancas45.toString())
          params.set('criancas_6', totalCriancas6.toString())
          
          // ✅ SEMPRE PRESERVAR A CONFIGURAÇÃO ESPECÍFICA
          params.set('rooms_config', JSON.stringify(roomsConfigToUse))
          
          // Adicionar informações do resultado inteligente
          params.set('smart_suggestion', 'true')
          params.set('suggested_hotel', bestResult.hotel)
          params.set('suggested_room_type', bestResult.quarto_tipo)
          params.set('suggested_price', bestResult.preco_total_calculado.toString())
          
          console.log('🧠 Smart Filter: Navegando com resultado otimizado e configuração preservada')
          router.push(`/resultados?${params.toString()}`)
          return
        }
      }
      
      // Fallback se Smart Filter não funcionou
      console.log('⚠️ Smart Filter sem resultados, fazendo busca normal')
      handleNormalFilterSearch(searchFilters, roomsConfigToUse)
      
    } catch (error) {
      console.error('❌ Erro no Smart Filter:', error)
      // Fallback para busca normal em caso de erro
      handleNormalFilterSearch(searchFilters)
    }
  }

  const handleNormalFilterSearch = (searchFilters: any, roomsConfigOverride?: any[]) => {
    // Busca normal (código original)
    const dataString = searchFilters.data ? format(searchFilters.data, 'yyyy-MM-dd') : undefined
    const params = new URLSearchParams()
    
    if (searchFilters.salida) params.set('salida', searchFilters.salida)
    if (searchFilters.destino) params.set('destino', searchFilters.destino)
    if (dataString) params.set('data', dataString)
    if (searchFilters.transporte) params.set('transporte', searchFilters.transporte)
    
    // ✅ USAR CONFIGURAÇÃO PRESERVADA OU DOS FILTROS
    let roomsToUse = roomsConfigOverride || []
    if (roomsToUse.length === 0) {
      if (searchFilters.rooms && searchFilters.rooms.length > 0) {
        roomsToUse = searchFilters.rooms.map((room: any) => ({
          adults: room.adults,
          children_0_3: room.children_0_3,
          children_4_5: room.children_4_5,
          children_6: room.children_6
        }))
      } else {
        // Fallback para configuração atual
        roomsToUse = quartosIndividuais.map((quarto: any) => ({
          adults: quarto.adults,
          children_0_3: quarto.children0to3,  // ✅ CORREÇÃO: mapeando do formato interno
          children_4_5: quarto.children4to5,  // ✅ CORREÇÃO: mapeando do formato interno
          children_6: quarto.children6plus   // ✅ CORREÇÃO: mapeando do formato interno
        }))
      }
    }
    
    // Adicionar informações dos quartos
    params.set('quartos', roomsToUse.length.toString())
    
    // Somar totais de pessoas
    const totalAdultos = roomsToUse.reduce((sum: number, room: any) => sum + room.adults, 0)
    const totalCriancas03 = roomsToUse.reduce((sum: number, room: any) => sum + room.children_0_3, 0)
    const totalCriancas45 = roomsToUse.reduce((sum: number, room: any) => sum + room.children_4_5, 0)
    const totalCriancas6 = roomsToUse.reduce((sum: number, room: any) => sum + room.children_6, 0)
    
    params.set('adultos', totalAdultos.toString())
    params.set('criancas_0_3', totalCriancas03.toString())
    params.set('criancas_4_5', totalCriancas45.toString())
    params.set('criancas_6', totalCriancas6.toString())
    
    // ✅ SEMPRE PRESERVAR CONFIGURAÇÃO ESPECÍFICA
    params.set('rooms_config', JSON.stringify(roomsToUse))
    
    console.log('📝 Busca Normal: Navegando para URL com configuração preservada:', roomsToUse)
    
    // Navegar para nova URL mantendo o estado (SPA)
    router.push(`/resultados?${params.toString()}`)
  }

  const handleSugestaoGPT = async () => {
    await buscarComGPT({
      destino: undefined,
      cidade_saida: undefined,
      transporte: undefined,
      data_saida: undefined,
      totalAdultos: pessoas.adultos,
      totalCriancas0_3: pessoas.criancas_0_3,
      totalCriancas4_5: pessoas.criancas_4_5,
      totalCriancas6_mais: pessoas.criancas_6_mais
    })
  }

  // Função para obter a imagem específica do hotel
  const getHotelImage = (hotelName: string) => {
    // Mapeamento correto: Nome do banco → Pasta das imagens
    const hotelImageMap: { [key: string]: string } = {
      "RESIDENCIAL TERRAZAS": "/images/hoteles/Residencial Terrazas/1.png",
      "RESIDENCIAL LEÔNIDAS": "/images/hoteles/Residencial Leônidas/1.jpg", 
      "HOTEL FÊNIX": "/images/hoteles/Hotel Fênix/1.jpg",
      "HOTEL FENIX": "/images/hoteles/Hotel Fênix/1.jpg", // Variação sem acento
      "PALACE I": "/images/hoteles/Palace I/1.jpg",
      "BOMBINHAS PALACE HOTEL": "/images/hoteles/Bombinhas Palace Hotel/1.jpg",
      "CANAS GOLD HOTEL": "/images/hoteles/Canas Gold Hotel/1.png",
      "VERDES PÁSSAROS APART HOTEL": "/images/hoteles/Verdes Pássaros Apart Hotel/1.png"
    }
    
    // Normalizar nome do hotel (maiúsculo e limpar)
    const normalizedName = hotelName.toUpperCase().trim()
    
    return hotelImageMap[normalizedName] || null // Retorna null se não encontrar
  }

  // Função para obter todas as imagens de um hotel
  const getHotelImages = (hotelName: string): string[] => {
    // Mapeamento: Nome do banco → [Pasta, número de imagens]
    const hotelGalleryMap: { [key: string]: { folder: string, count: number } } = {
      "RESIDENCIAL TERRAZAS": { folder: "Residencial Terrazas", count: 8 },
      "RESIDENCIAL LEÔNIDAS": { folder: "Residencial Leônidas", count: 8 },
      "HOTEL FÊNIX": { folder: "Hotel Fênix", count: 8 },
      "HOTEL FENIX": { folder: "Hotel Fênix", count: 8 }, // Variação
      "PALACE I": { folder: "Palace I", count: 9 }, // Único com 9 imagens
      "BOMBINHAS PALACE HOTEL": { folder: "Bombinhas Palace Hotel", count: 8 },
      "CANAS GOLD HOTEL": { folder: "Canas Gold Hotel", count: 8 },
      "VERDES PÁSSAROS APART HOTEL": { folder: "Verdes Pássaros Apart Hotel", count: 6 }
    }
    
    const normalizedName = hotelName.toUpperCase().trim()
    const hotelInfo = hotelGalleryMap[normalizedName]
    
    if (!hotelInfo) return []
    
    const images: string[] = []
    for (let i = 1; i <= hotelInfo.count; i++) {
      // Definir extensão correta baseada nas pastas reais
      let extension = 'jpg' // padrão
      
      if (hotelInfo.folder === 'Residencial Terrazas') {
        extension = i === 1 || i === 4 || i === 5 || i === 6 || i === 7 ? 'png' : 'jpg'
      } else if (hotelInfo.folder === 'Canas Gold Hotel') {
        extension = [1, 3, 6, 7].includes(i) ? 'png' : 'jpg'
      } else if (hotelInfo.folder === 'Palace I') {
        extension = [4, 8].includes(i) ? 'jpeg' : 'jpg'
      } else if (hotelInfo.folder === 'Verdes Pássaros Apart Hotel') {
        extension = 'png'
      }
      
      const imagePath = `/images/hoteles/${hotelInfo.folder}/${i}.${extension}`
      images.push(imagePath)
    }
    
    return images
  }

  // ✅ NOVA FUNÇÃO: Buscar comodidades reais da tabela hospedagens
  const getComodidadesReais = async (hotelName: string) => {
    try {
      const hospedagem = await getHospedagemData(hotelName)
      
      if (hospedagem && hospedagem.comodidades && hospedagem.comodidades.length > 0) {
        console.log(`✅ Comodidades encontradas para ${hotelName}:`, hospedagem.comodidades)
        return formatComodidadesForCards(hospedagem.comodidades)
      } else {
        console.log(`⚠️ Usando comodidades genéricas para ${hotelName}`)
        return COMODIDADES_GENERICAS
      }
    } catch (error) {
      console.error('❌ Erro ao buscar comodidades:', error)
      return COMODIDADES_GENERICAS
    }
  }

  // Mapeamento de ícones para componentes React
  const iconComponents: { [key: string]: any } = {
    Wifi,
    AirVent,
    Tv,
    Refrigerator,
    Waves,
    Utensils,
    Shield,
    Sparkles,
    Clock,
    Car,
    ChefHat,
    Bath,
    Flame,
    Gamepad2,
    Circle,
    Coffee // Fallback
  }

  // Função para formatar informações de pessoas
  const formatPessoas = (pessoas: PrecoPessoas) => {
    const totalAdultos = pessoas.adultos
    const totalCriancas = pessoas.criancas_0_3 + pessoas.criancas_4_5 + pessoas.criancas_6_mais
    
    if (totalCriancas === 0) {
      return `${totalAdultos} ${totalAdultos === 1 ? 'Adulto' : 'Adultos'}`
    }
    
    return `${totalAdultos} ${totalAdultos === 1 ? 'Adulto' : 'Adultos'} | ${totalCriancas} ${totalCriancas === 1 ? 'Niño' : 'Niños'}`
  }

  // Função para determinar se é um dos 3 mais populares
  const isPopularPackage = (index: number) => {
    return index < 3 // Os 3 primeiros são os mais populares
  }

  // Função para calcular preço por pessoa
  const calcularPrecoPorPessoa = (precoTotal: number, totalPessoas: number) => {
    return totalPessoas > 0 ? precoTotal / totalPessoas : precoTotal
  }

  // Função para formatar total de pessoas
  const formatTotalPessoas = (pessoas: PrecoPessoas) => {
    const total = pessoas.adultos + pessoas.criancas_0_3 + pessoas.criancas_4_5 + pessoas.criancas_6_mais
    const adultos = pessoas.adultos
    const criancas = pessoas.criancas_0_3 + pessoas.criancas_4_5 + pessoas.criancas_6_mais
    
    let texto = `${adultos} ${adultos === 1 ? 'Adulto' : 'Adultos'}`
    if (criancas > 0) {
      texto += `, ${criancas} ${criancas === 1 ? 'Niño' : 'Niños'}`
    }
    return texto
  }

  const buscarComGPT = async (filtros: any) => {
    try {
      setLoadingGPT(true)
      console.log('Buscando com GPT:', filtros)
      
      const response = await fetch('/api/sugerir-pacotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destino: filtros.destino,
          cidade_saida: filtros.cidade_saida,
          transporte: filtros.transporte,
          data_saida: filtros.data_saida,
          pessoas: filtros.totalAdultos + filtros.totalCriancas0_3 + filtros.totalCriancas4_5 + filtros.totalCriancas6_mais,
          pacotesValidos: filtros.pacotesValidos // Enviar pacotes pré-filtrados
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Resultado GPT:', result)
        
        if (result.success) {
          setPacotesGPT(result.pacotes)
          setUseGPTResults(true)
          setSugestoes(result.sugestoes)
        } else {
          setSugestoes(result.sugestoes || ["Erro na busca inteligente"])
          setUseGPTResults(false)
        }
      } else {
        console.error('Erro na resposta:', response.status)
        setSugestoes(["Erro na busca inteligente"])
        setUseGPTResults(false)
      }
    } catch (error) {
      console.error('Erro na busca inteligente:', error)
      setSugestoes(["Erro na busca inteligente"])
      setUseGPTResults(false)
    } finally {
      setLoadingGPT(false)
    }
  }

      // ✅ NOVO: Obter quartos individuais para breakdown
  const quartosIndividuais = getQuartosIndividuais() || [] // ✅ Safe guard
  const numQuartos = parseInt(searchParams.get("quartos") || "1")
  const temMultiplosQuartos = numQuartos > 1
  
  // ✅ NOVO: Função para gerar URL de detalhes com configuração específica
  const gerarUrlDetalhes = (disponibilidade: any, precoCalculado?: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('hotel', disponibilidade.hotel)
    
    // ✅ USAR PREÇO ESPECÍFICO DO CARD se fornecido, senão calcular
    const precoFinal = precoCalculado || calcularPrecoTotalSeguro(disponibilidade, pessoas)
    params.set('preco', precoFinal.toString())
    
    // ✅ SEMPRE INCLUIR CONFIGURAÇÃO ESPECÍFICA (1 quarto ou múltiplos)
    const roomsConfig = quartosIndividuais.map(quarto => ({
      adults: quarto.adults,
      children_0_3: quarto.children0to3,  // ✅ CORREÇÃO: mapeando do formato interno
      children_4_5: quarto.children4to5,  // ✅ CORREÇÃO: mapeando do formato interno
      children_6: quarto.children6plus   // ✅ CORREÇÃO: mapeando do formato interno
    }))
    
    params.set('rooms_config', encodeURIComponent(JSON.stringify(roomsConfig)))
    console.log('🔗 ADICIONANDO CONFIGURAÇÃO ESPECÍFICA À URL (sempre):', roomsConfig)
    console.log('🎯 PREÇO ESPECÍFICO DO CARD:', precoFinal)
    
    return `/detalhes?${params.toString()}`
  }

  // ✅ NOVO: Função para gerar texto dos tipos de quartos combinados
  const gerarTextoTiposQuartos = (disponibilidade?: any): string => {
    if (!temMultiplosQuartos) {
      // ✅ SEMPRE usar o tipo baseado na ocupação REAL para garantir precisão
      const tipoCalculado = determinarTipoQuarto(quartosIndividuais[0])
      return `Habitación ${tipoCalculado}`
    }
    
    // Para múltiplos quartos, gerar combinação dos tipos
    const tiposQuartos = quartosIndividuais.map(quarto => determinarTipoQuarto(quarto))
    const tiposUnicos = [...new Set(tiposQuartos)] // Remover duplicatas
    
    // Se todos os quartos são do mesmo tipo
    if (tiposUnicos.length === 1) {
      return `${numQuartos}x ${tiposUnicos[0]}`
    }
    
    // Se são tipos diferentes, mostrar combinação
    return tiposUnicos.join(' + ')
  }

  if (loading || loadingGPT) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20">
          <div className="container mx-auto px-4 lg:px-[70px] py-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {loadingGPT ? "🤖 Buscando com IA..." : "Cargando disponibilidades..."}
              </h2>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error al cargar disponibilidades</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>Intentar nuevamente</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Botão flutuante para sugestão do GPT */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleSugestaoGPT}
          disabled={loadingGPT}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full px-6 py-3 font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
        >
          <Bot className="w-5 h-5" />
          {loadingGPT ? "Buscando..." : "🤖 ¡Sugiéreme un paquete!"}
        </Button>
      </div>
      
      <div className="pt-20">
        {/* Filtro de pesquisa no topo */}
        <div className="bg-gray-50 border-b">
          <div className="container mx-auto px-4 lg:px-[70px] py-6">
            <UnifiedSearchFilter 
              variant="results"
              initialFilters={{
                salida: searchParams.get("salida") || "",
                destino: searchParams.get("destino") || "",
                data: (() => {
                  const dataParam = searchParams.get("data")
                  console.log('🗓️ DEBUG Calendar InitialFilters:')
                  console.log('  - Parâmetro data da URL:', dataParam)
                  if (dataParam) {
                    // ✅ CORRIGIDO: Forçar timezone local em vez de UTC
                    const [year, month, day] = dataParam.split('-').map(Number)
                    const parsedDate = new Date(year, month - 1, day) // month é 0-indexed
                    console.log('  - Data parseada (CORRIGIDA):', parsedDate)
                    console.log('  - Data parseada ISO:', parsedDate.toISOString())
                    console.log('  - Data parseada LOCAL:', parsedDate.toLocaleDateString())
                    return parsedDate
                  }
                  return undefined
                })(),
                transporte: searchParams.get("transporte") || "",
                rooms: parseRoomsFromURL().map((room, index) => ({
                  id: (index + 1).toString(),
                  adults: room.adults,
                  children_0_3: room.children0to3,
                  children_4_5: room.children4to5,
                  children_6: room.children6plus
                }))
              }}
              onSearch={handleFilterSearch}
            />
          </div>
        </div>

        {/* Header da página */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 lg:px-[70px] py-6">
            {/* Indicador de Sugestão Inteligente */}
            {searchParams.get('smart_suggestion') === 'true' && (
              <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      Sugestão Inteligente Ativada
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Estes resultados foram otimizados pela nossa IA baseando-se na sua configuração específica de quartos e preferências. 
                      {searchParams.get('suggested_hotel') && (
                        <button
                          onClick={() => {
                            const targetHotel = searchParams.get('suggested_hotel')
                            const hotelElement = document.querySelector(`[data-hotel*="${targetHotel}"]`)
                            if (hotelElement) {
                              hotelElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
                              // Highlight animation
                              hotelElement.classList.add('ring-4', 'ring-purple-300', 'ring-opacity-50')
                              setTimeout(() => {
                                hotelElement.classList.remove('ring-4', 'ring-purple-300', 'ring-opacity-50')
                              }, 3000)
                            }
                          }}
                          className="font-medium text-purple-700 hover:text-purple-800 hover:underline cursor-pointer transition-colors duration-200"
                        >
                          {" "}📍 Recomendação principal: {searchParams.get('suggested_hotel')} - {searchParams.get('suggested_room_type')} por R$ {searchParams.get('suggested_price')}/pessoa
                        </button>
                      )}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                      Score: {searchParams.get('suggested_score') || '95'}/100
                    </Badge>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  {useGPTResults ? "🤖 Sugerencias de IA" : searchParams.get('smart_suggestion') === 'true' ? "🧠 Resultados Otimizados" : "Disponibilidades encontradas"}
                </h1>
                <p className="text-gray-600 mt-1">
                  {resultados.length} {resultados.length === 1 ? 'disponibilidad encontrada' : 'disponibilidades encontradas'}
                  {filters.destino && ` para ${filters.destino}`}
                  {searchParams.get('smart_suggestion') === 'true' && (
                    <span className="text-purple-600 font-medium"> • Selecionados pela IA</span>
                  )}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Ordenação */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevancia</SelectItem>
                    <SelectItem value="price_low">Menor precio</SelectItem>
                    <SelectItem value="price_high">Mayor precio</SelectItem>
                    <SelectItem value="date">Fecha de salida</SelectItem>
                  </SelectContent>
                </Select>

                {/* Modo de visualização */}
                <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-r-none relative"
                  >
                    <List className="w-4 h-4" />
                    {!isMobile && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></span>
                    )}
                  </Button>
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-l-none relative"
                  >
                    <Grid3X3 className="w-4 h-4" />
                    {isMobile && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 lg:px-[70px] py-8">
          {/* Texto explicativo no topo */}
          {resultados.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-2">Mostrando los paquetes más adecuados para su búsqueda:</h2>
              <p className="text-sm text-gray-600 mb-4">
                Filtramos los paquetes disponibles según su salida, destino, número de personas y fecha. 
                Los paquetes mostrados son los más próximos y relevantes.
              </p>
            </div>
          )}

          {/* Resultados */}
          {resultados.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Ninguna disponibilidad encontrada
              </h3>
              
              {/* Sugestões inteligentes do ChatGPT */}
              {sugestoes && sugestoes.length > 0 ? (
                <div className="max-w-md mx-auto mb-6">
                  {sugestoes.map((sugestao, index) => (
                    <p key={index} className="text-gray-600 mb-2">
                      {sugestao}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="max-w-md mx-auto mb-6">
                  <p className="text-gray-600 mb-2">
                    Nenhum pacote encontrado com essas opções
                  </p>
                  <p className="text-gray-600 mb-2">
                    Experimente mudar a data ou o tipo de transporte
                  </p>
                </div>
              )}

              {/* Botões de ação */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={() => window.location.reload()} 
                  className="bg-[#EE7215] hover:bg-[#EE7215]/90 text-white rounded-xl px-6 py-2.5 font-medium"
                >
                  Nueva búsqueda
                </Button>
                <Button 
                  onClick={handleSugestaoGPT}
                  disabled={loadingGPT}
                  variant="outline"
                  className="rounded-xl px-6 py-2.5 font-medium border-2 border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  <Bot className="w-4 h-4 mr-2" />
                  {loadingGPT ? "Buscando..." : "🤖 ¡Sugiéreme un paquete!"}
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Seção única: Mostrar TODOS os resultados disponíveis */}
              {resultados.length > 0 && (() => {
                console.log('🎨 RENDERIZANDO UI:', resultados.length, 'cards')
                return (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <span className="text-2xl">🧳</span>
                      {resultados.length <= 3 ? 'Paquetes ideales para vos' : `Todos los paquetes disponibles (${resultados.length})`}
                    </h3>
                    <div className={`grid gap-4 md:gap-6 ${
                      viewMode === "grid" 
                        ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" 
                        : "grid-cols-1"
                    }`}>
                      {(resultados || []).map((disponibilidade, index) => {
                        const precoTotal = calcularPrecoTotalSeguro(disponibilidade, pessoas)
                        const totalPessoas = pessoas.adultos + pessoas.criancas_0_3 + pessoas.criancas_4_5 + pessoas.criancas_6_mais
                        const precoPorPessoa = calcularPrecoPorPessoa(precoTotal, totalPessoas)
                        const amenidades = comodidadesCache[disponibilidade.hotel] || COMODIDADES_GENERICAS
                        const hotelImage = getHotelImage(disponibilidade.hotel) || "/placeholder.svg"
                        
                        return (
                          <Card 
                            key={disponibilidade.id} 
                            data-hotel={disponibilidade.hotel}
                            className={`group relative overflow-hidden rounded-2xl bg-white shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-2 border border-gray-100 ${
                              viewMode === "list" ? "md:flex" : ""
                            }`}
                          >
                            {/* Premium Badge */}
                            {index < 3 && (
                              <div className="absolute top-4 left-4 z-10">
                                <div className="rounded-full bg-gradient-to-r from-[#FF6B35] to-[#F7931E] px-3 py-1.5 shadow-[0_4px_12px_rgba(255,107,53,0.4)] hover:scale-[1.05] transition-all duration-200">
                                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white/90 animate-pulse"></div>
                                    Más Popular
                                  </span>
                                </div>
                              </div>
                            )}
                            
                            {/* AI Badge */}
                            {useGPTResults && index >= 3 && (
                              <div className="absolute top-4 left-4 z-10">
                                <div className="rounded-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] px-3 py-1.5 shadow-[0_4px_12px_rgba(99,102,241,0.4)] hover:scale-[1.05] transition-all duration-200">
                                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white/90 animate-pulse"></div>
                                    IA Recomienda
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Hero Image */}
                            <div className={`relative overflow-hidden ${
                              viewMode === "list" 
                                ? "md:w-80 md:flex-shrink-0 aspect-[3/2]" 
                                : "aspect-[3/2] md:aspect-[4/3]"
                            }`}>
                              {hotelImage ? (
                                <Image
                                  src={hotelImage}
                                  alt={`${disponibilidade.destino} - ${disponibilidade.hotel}`}
                                  width={400}
                                  height={300}
                                  className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${
                                    viewMode === "list" ? "md:rounded-l-2xl md:rounded-r-none" : ""
                                  }`}
                                />
                              ) : (
                                <div className={`w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center ${
                                  viewMode === "list" ? "md:rounded-l-2xl md:rounded-r-none" : ""
                                }`}>
                                  <div className="text-center text-gray-500">
                                    <Hotel className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm font-medium">Sin imágenes</p>
                                  </div>
                                </div>
                              )}
                              
                              {/* Enhanced Gradient Overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent"></div>
                            </div>

                            {/* Content Section */}
                            <div className={`${
                              viewMode === "list" 
                                ? "flex-1 p-4 md:flex md:flex-col md:justify-between md:min-h-0" 
                                : "p-4 md:p-6"
                            }`}>
                              {/* Hotel Info */}
                              <div className={viewMode === "list" ? "mb-3" : "mb-4"}>
                                <div className={`flex items-start justify-between ${viewMode === "list" ? "mb-2" : "mb-2"}`}>
                                  <div className="flex-1">
                                    <h3 className={`font-bold text-gray-900 leading-tight tracking-tight font-['Inter',_system-ui,_sans-serif] ${
                                      viewMode === "list" ? "text-lg mb-1" : "text-lg md:text-xl mb-1"
                                    }`}>
                                      {disponibilidade.hotel}
                                    </h3>
                                    <p className="text-sm text-gray-600 font-medium">
                                      {gerarTextoTiposQuartos(disponibilidade)}
                                    </p>
                                  </div>
                                  <div className="ml-3">
                                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                                      <Star className="w-3 h-3 text-amber-500 fill-current" />
                                      <span className="text-xs font-bold text-amber-700">4.8</span>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Location */}
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <MapPin className="w-4 h-4 text-[#EE7215]" />
                                  <span className="font-medium">{disponibilidade.destino}</span>
                                  <span className="text-gray-400">•</span>
                                  <span className="font-medium">400m de la playa</span>
                                </div>
                              </div>

                              {/* Comodidades e Detalhes - Melhorados com badges sutis */}
                              {viewMode === "list" ? (
                                <div className="flex-1 space-y-3 mb-4 md:overflow-y-auto">
                                  {/* Comodidades compactas - LIST VIEW */}
                                  <div>
                                    <h4 className="text-sm font-bold text-gray-800 mb-2 tracking-tight">Comodidades</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {(amenidades || []).map((amenidade: {icon: string, label: string}, idx: number) => {
                                        const IconComponent = iconComponents[amenidade.icon] || iconComponents.Circle
                                        return (
                                          <div key={idx} className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 px-2 py-1 rounded-lg border border-gray-200/60 text-xs font-medium">
                                            <IconComponent className="w-3 h-3 text-[#EE7215]" />
                                            <span>{amenidade.label}</span>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>

                                  {/* Detalles compactos - LIST VIEW */}
                                  <div>
                                    <h4 className="text-sm font-bold text-gray-800 mb-2 tracking-tight">Detalles del viaje</h4>
                                    <div className="flex flex-wrap gap-2">
                                      <div className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 px-2 py-1 rounded-lg border border-orange-200/60 text-xs font-medium">
                                        <CalendarIcon className="w-3 h-3" />
                                        <span>{formatDate(disponibilidade.data_saida)}</span>
                                      </div>
                                      <div className="inline-flex items-center gap-1.5 bg-sky-50 text-sky-700 px-2 py-1 rounded-lg border border-sky-200/60 text-xs font-medium">
                                        {(disponibilidade.transporte === "Bus" || disponibilidade.transporte === "Bús") ? (
                                          <Bus className="w-3 h-3" />
                                        ) : (
                                          <Plane className="w-3 h-3" />
                                        )}
                                        <span>{(disponibilidade.transporte === "Bus" || disponibilidade.transporte === "Bús") ? "Bus" : "Vuelo"}</span>
                                      </div>
                                      <div className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 px-2 py-1 rounded-lg border border-purple-200/60 text-xs font-medium">
                                        <Bed className="w-3 h-3" />
                                        <span>{disponibilidade.noites_hotel || 7} noches</span>
                                      </div>
                                      <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg border border-emerald-200/60 text-xs font-medium">
                                        <Users className="w-3 h-3" />
                                        <span>{formatTotalPessoas(pessoas).replace('Adulto', 'Adulto').replace('Adultos', 'Adultos').replace('Niño', 'Niño').replace('Niños', 'Niños')}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  {/* Comodidades - GRID VIEW */}
                                  <div className="mb-4">
                                    <h4 className="text-sm font-bold text-gray-800 mb-3 tracking-tight">Comodidades</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                      {(amenidades || []).map((amenidade, idx) => {
                                        // ✅ Mapear string do ícone para componente React
                                        const iconComponents: { [key: string]: any } = {
                                          'Wifi': Wifi,
                                          'AirVent': AirVent,
                                          'Tv': Tv,
                                          'Refrigerator': Refrigerator,
                                          'Waves': Waves,
                                          'Utensils': Utensils,
                                          'Shield': Shield,
                                          'Sparkles': Sparkles,
                                          'Clock': Clock,
                                          'Car': Car,
                                          'ChefHat': ChefHat,
                                          'Bath': Bath,
                                          'Flame': Flame,
                                          'Gamepad2': Gamepad2,
                                          'Circle': Circle
                                        }
                                        const IconComponent = iconComponents[amenidade.icon] || Circle
                                        
                                        return (
                                          <div key={idx} className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-xl border border-gray-200/60 text-xs font-medium">
                                            <IconComponent className="w-4 h-4 text-[#EE7215]" />
                                            <span>{amenidade.label}</span>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>

                                  {/* Detalles del viaje - GRID VIEW */}
                                  <div className="mb-5">
                                    <h4 className="text-sm font-bold text-gray-800 mb-3 tracking-tight">Detalles del viaje</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-3 py-2 rounded-xl border border-orange-200/60 text-xs font-medium">
                                        <CalendarIcon className="w-4 h-4" />
                                        <span>{formatDate(disponibilidade.data_saida)}</span>
                                      </div>
                                      <div className="inline-flex items-center gap-2 bg-sky-50 text-sky-700 px-3 py-2 rounded-xl border border-sky-200/60 text-xs font-medium">
                                        {(disponibilidade.transporte === "Bus" || disponibilidade.transporte === "Bús") ? (
                                          <Bus className="w-4 h-4" />
                                        ) : (
                                          <Plane className="w-4 h-4" />
                                        )}
                                        <span>{(disponibilidade.transporte === "Bus" || disponibilidade.transporte === "Bús") ? "Bus" : "Vuelo"}</span>
                                      </div>
                                      <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-2 rounded-xl border border-purple-200/60 text-xs font-medium">
                                        <Bed className="w-4 h-4" />
                                        <span>{disponibilidade.noites_hotel || 7} noches</span>
                                      </div>
                                      <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-xl border border-emerald-200/60 text-xs font-medium">
                                        <Users className="w-4 h-4" />
                                        <span>{formatTotalPessoas(pessoas).replace('Adulto', 'Adulto').replace('Adultos', 'Adultos').replace('Niño', 'Niño').replace('Niños', 'Niños')}</span>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}

                              {/* Pricing Block - Redesenhado conforme solicitado */}
                              <div className="border-t border-gray-200 pt-4 mt-4">
                                {viewMode === "list" ? (
                                  // Layout horizontal para list view
                                  <div className="flex items-end justify-between gap-4">
                                    {/* Breakdown de quartos para múltiplos quartos */}
                                    <div className="flex-1">
                                      {temMultiplosQuartos ? (
                                        <div className="space-y-2 mb-3">
                                          {(quartosIndividuais || []).map((quarto, quartoIndex) => {
                                            const precoQuarto = calcularPrecoQuarto(disponibilidade, quarto)
                                            const tipoQuarto = determinarTipoQuarto(quarto)
                                            const ocupacao = formatarOcupacaoQuarto(quarto)
                                            
                                            return (
                                              <div key={quartoIndex} className="flex items-center justify-between py-2 px-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200/50">
                                                <div className="flex items-center gap-2">
                                                  <div className="w-4 h-4 bg-[#EE7215] rounded-sm flex items-center justify-center">
                                                    <Bed className="w-2.5 h-2.5 text-white" />
                                                  </div>
                                                  <div>
                                                    <div className="text-sm font-bold text-gray-800">
                                                      Cuarto {quartoIndex + 1}: {ocupacao}
                                                    </div>
                                                    <div className="text-xs text-gray-600 font-medium">
                                                      {tipoQuarto}
                                                    </div>
                                                  </div>
                                                </div>
                                                <div className="text-sm font-black text-[#EE7215]">
                                                  {formatPrice(precoQuarto)}
                                                </div>
                                              </div>
                                            )
                                          })}
                                          
                                          <div className="flex items-center justify-between py-2 px-3 bg-gradient-to-r from-[#EE7215]/10 to-[#F7931E]/10 rounded-lg border-2 border-[#EE7215]/20">
                                            <div className="text-sm font-black text-gray-900">
                                              💰 Total ({numQuartos} cuartos)
                                            </div>
                                            <div className="text-lg font-black text-[#EE7215]">
                                              {formatPrice(precoTotal)}
                                            </div>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="text-2xl font-black text-gray-900 tracking-tight">
                                          {formatPrice(precoTotal)}
                                        </div>
                                      )}
                                      
                                      <div className="text-sm font-medium text-gray-600 mb-2">
                                        {temMultiplosQuartos ? 
                                          `Total para ${formatTotalPessoas(pessoas)} en ${numQuartos} cuartos` :
                                          `Total para ${formatTotalPessoas(pessoas)}`
                                        }
                                      </div>
                                      <div className="space-y-1">
                                        <div className="text-xs font-medium text-gray-600">Todo incluido</div>
                                        <div className="inline-flex items-center gap-2 text-xs font-bold text-green-700 bg-gradient-to-r from-green-100 to-green-200 px-3 py-1.5 rounded-full border border-green-300 shadow-sm">
                                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                          {(disponibilidade.transporte === "Bus" || disponibilidade.transporte === "Bús") ? "Bus" : "Aéreo"} + Hotel
                                        </div>
                                      </div>
                                    </div>

                                    {/* Botão - Direita */}
                                    <div className="flex-shrink-0">
                                      <button 
                                        className="relative bg-gradient-to-r from-[#FF6B35] via-[#EE7215] to-[#F7931E] hover:from-[#FF5722] hover:via-[#E65100] hover:to-[#FF8F00] text-white font-bold py-2.5 px-5 rounded-xl shadow-[0_6px_20px_rgba(238,114,21,0.4)] hover:shadow-[0_8px_24px_rgba(238,114,21,0.6)] transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] transform-gpu overflow-hidden group/btn"
                                        onClick={() => {
                                          router.push(gerarUrlDetalhes(disponibilidade, precoTotal))
                                        }}
                                      >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
                                        <span className="relative flex items-center justify-center gap-2 text-sm">
                                          <span className="font-black tracking-wide">Ver detalles</span>
                                          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                                        </span>
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  // Layout vertical para grid view
                                  <>
                                    {/* Para múltiplos quartos: primeiro desglose, depois valor final */}
                                    {temMultiplosQuartos ? (
                                      <>
                                        {/* Breakdown de quartos primeiro */}
                                        <div className="space-y-3 mb-4">
                                          <div className="text-sm font-bold text-gray-800 mb-3">Desglose por cuarto:</div>
                                          
                                          {(quartosIndividuais || []).map((quarto, quartoIndex) => {
                                            const precoQuarto = calcularPrecoQuarto(disponibilidade, quarto)
                                            const tipoQuarto = determinarTipoQuarto(quarto)
                                            const ocupacao = formatarOcupacaoQuarto(quarto)
                                            
                                            return (
                                              <div key={quartoIndex} className="flex items-center justify-between py-3 px-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200/50 hover:from-gray-100 hover:to-gray-200 transition-all duration-200">
                                                <div className="flex items-center gap-3">
                                                  <div className="w-5 h-5 bg-[#EE7215] rounded-lg flex items-center justify-center">
                                                    <Bed className="w-3 h-3 text-white" />
                                                  </div>
                                                  <div className="text-left">
                                                    <div className="text-sm font-bold text-gray-800">
                                                      🛏️ Cuarto {quartoIndex + 1}: {ocupacao}
                                                    </div>
                                                    <div className="text-xs text-gray-600 font-medium">
                                                      {tipoQuarto}
                                                    </div>
                                                  </div>
                                                </div>
                                                <div className="text-base font-black text-[#EE7215]">
                                                  {formatPrice(precoQuarto)}
                                                </div>
                                              </div>
                                            )
                                          })}
                                          
                                          <div className="flex items-center justify-between py-3 px-4 bg-gradient-to-r from-[#EE7215]/10 to-[#F7931E]/10 rounded-xl border-2 border-[#EE7215]/30 hover:border-[#EE7215]/50 transition-all duration-200">
                                            <div className="flex items-center gap-3">
                                              <div className="w-5 h-5 bg-gradient-to-r from-[#EE7215] to-[#F7931E] rounded-lg flex items-center justify-center">
                                                <span className="text-white text-xs font-black">💰</span>
                                              </div>
                                              <div className="text-base font-black text-gray-900">
                                                Total ({numQuartos} cuartos)
                                              </div>
                                            </div>
                                            <div className="text-xl font-black text-[#EE7215]">
                                              {formatPrice(precoTotal)}
                                            </div>
                                          </div>
                                        </div>

                                        {/* Linha divisória */}
                                        <div className="border-t border-gray-200 pt-4 mt-4"></div>

                                        {/* Valor final depois do desglose */}
                                        <div className="flex items-start justify-between mb-4">
                                          {/* Esquerda: Todo incluído */}
                                          <div className="flex-1">
                                            <div className="space-y-1">
                                              <div className="text-xs font-medium text-gray-600">Todo incluido</div>
                                              <div className="inline-flex items-center gap-2 text-xs font-bold text-green-700 bg-gradient-to-r from-green-100 to-green-200 px-3 py-1.5 rounded-full border border-green-300 shadow-sm">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                                {(disponibilidade.transporte === "Bus" || disponibilidade.transporte === "Bús") ? "Bus" : "Aéreo"} + Hotel
                                              </div>
                                            </div>
                                          </div>
                                          
                                          {/* Direita: Preço e pessoas */}
                                          <div className="text-right">
                                            <div className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                                              {formatPrice(precoTotal)}
                                            </div>
                                            <div className="text-xs font-medium text-gray-600">
                                              Total para {formatTotalPessoas(pessoas)}
                                            </div>
                                          </div>
                                        </div>
                                      </>
                                    ) : (
                                      /* Para quarto único: layout normal */
                                      <div className="flex items-start justify-between mb-4">
                                        {/* Esquerda: Todo incluído */}
                                        <div className="flex-1">
                                          <div className="space-y-1">
                                            <div className="text-xs font-medium text-gray-600">Todo incluido</div>
                                            <div className="inline-flex items-center gap-2 text-xs font-bold text-green-700 bg-gradient-to-r from-green-100 to-green-200 px-3 py-1.5 rounded-full border border-green-300 shadow-sm">
                                              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                              {(disponibilidade.transporte === "Bus" || disponibilidade.transporte === "Bús") ? "Bus" : "Aéreo"} + Hotel
                                            </div>
                                          </div>
                                        </div>
                                        
                                        {/* Direita: Preço e pessoas */}
                                        <div className="text-right">
                                          <div className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                                            {formatPrice(precoTotal)}
                                          </div>
                                          <div className="text-xs font-medium text-gray-600">
                                            Total para {formatTotalPessoas(pessoas)}
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Botão - Grid view mais sutil */}
                                    <button 
                                      className="relative w-full bg-gradient-to-r from-[#FF6B35] via-[#EE7215] to-[#F7931E] hover:from-[#FF5722] hover:via-[#E65100] hover:to-[#FF8F00] text-white font-bold py-3 px-6 rounded-xl shadow-[0_6px_20px_rgba(238,114,21,0.4)] hover:shadow-[0_8px_24px_rgba(238,114,21,0.6)] transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] transform-gpu overflow-hidden group/btn"
                                      onClick={() => {
                                        router.push(gerarUrlDetalhes(disponibilidade, precoTotal))
                                      }}
                                    >
                                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
                                      <span className="relative flex items-center justify-center gap-2 text-sm md:text-base">
                                        <span className="font-black tracking-wide">Ver detalles</span>
                                        <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover/btn:translate-x-1 transition-transform duration-300" />
                                      </span>
                                    </button>
                                  </>
                                )}
                              </div>

                              {/* AI Indicator */}
                              {useGPTResults && (
                                <div className="mt-4 text-center">
                                  <span className="text-xs text-gray-500 flex items-center justify-center gap-1.5 font-medium">
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></div>
                                    Recomendado por IA
                                  </span>
                                </div>
                              )}
                            </div>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                )
              })()}
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
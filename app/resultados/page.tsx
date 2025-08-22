"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { UnifiedSearchFilter } from "@/components/unified-search-filter"
import { HabitacionesSearchFilter } from "@/components/habitaciones-search-filter"
import { PaseosSearchFilter } from "@/components/paseos-search-filter"
import { DisponibilidadeFilter, PrecoPessoas } from "@/lib/supabase"
import { fetchRealData, fetchHabitacionesData, SearchFilters, HabitacionSearchFilters } from "@/lib/supabase-service"
import { getHospedagemData, formatComodidadesForCards, COMODIDADES_GENERICAS } from "@/lib/hospedagens-service"
import { calculateFinalPrice, calculateInstallments } from "@/lib/utils";
  import { 
  calcularPagantesHospedagem, 
  validarConfiguracaoHospedagem,
  quartoAtendeRequisitos,
  calcularPrecoHospedagem,
  formatarExplicacaoPagantes,
  tiposQuartoCompativeis,
  type HospedagemCalculation 
} from "@/lib/hospedagem-utils";
  import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
  import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  Luggage,
   Sun, // Adicionado
   Info,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale";
import { DateRange } from "react-day-picker"
import { getHotelData } from "@/lib/hotel-data"
import { PaseoCard } from "@/components/ui/paseo-card"
import type { Paseo } from "@/lib/passeios-service"

// Mock data for Paseos - SERÁ REMOVIDO
// const mockPaseos: Paseo[] = [
//   {
//     id: "1",
//     nome: "Paseo en Barco Pirata",
//     imagem: "/images/placeholder.jpg",
//     local: "Canasvieiras",
//     duracao: "4 horas",
//     avaliacao: 4.8,
//     preco_adulto: 50,
//     moeda: "USD",
//   },
//   {
//     id: "2",
//     nome: "Excursión a Bombinhas",
//     imagem: "/images/placeholder.jpg",
//     local: "Salida desde Canasvieiras",
//     duracao: "Día completo",
//     avaliacao: 4.9,
//     preco_adulto: 75,
//     moeda: "USD",
//   },
// ]

interface Room {
  adults: number
  children0to3: number
  children4to5: number
  children6plus: number
}

export default function ResultadosPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [isMobile, setIsMobile] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const [activeTab, setActiveTab] = useState(
    searchParams.get("categoria") === "hospedagem" ? "habitaciones"
    : searchParams.get("categoria") === "passeio" ? "paseos"
    : "paquetes"
  );
  
  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      setViewMode("grid")
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    
    let categoria = 'paquete';
    if (tab === "habitaciones") categoria = 'hospedagem';
    if (tab === "paseos") categoria = 'passeio';
    params.set("categoria", categoria);

    // Simplificando a lógica: apenas muda a categoria e mantém os outros filtros
    // A página de resultados irá renderizar o filtro certo, que por sua vez
    // usará os parâmetros relevantes.
    
    router.push(`/resultados?${params.toString()}`);
  };

  const [sortBy, setSortBy] = useState("relevance")
  const [comodidadesCache, setComodidadesCache] = useState<{[key: string]: Array<{icon: string, label: string}>}>({})
  const [distanciaPraiaCache, setDistanciaPraiaCache] = useState<{[key: string]: number | null}>({})
  
  const parseRoomsFromURL = (): Room[] => {
    const quartos = parseInt(searchParams.get("quartos") || "1")
    
    if (quartos > 1) {
      return getQuartosIndividuais()
    }
    
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

  const getQuartosIndividuais = (): Room[] => {
    const quartos = parseInt(searchParams.get("quartos") || "1")
    
    const roomsConfigParam = searchParams.get('rooms_config')
    if (roomsConfigParam) {
      try {
        const configDecoded = JSON.parse(decodeURIComponent(roomsConfigParam))
        if (Array.isArray(configDecoded) && configDecoded.length > 0) {
          return configDecoded.map((room: any) => ({
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
    
    const totalAdultos = parseInt(searchParams.get("adultos") || "2")
    const totalCriancas0_3 = parseInt(searchParams.get("criancas_0_3") || "0")
    const totalCriancas4_5 = parseInt(searchParams.get("criancas_4_5") || "0")
    const totalCriancas6 = parseInt(searchParams.get("criancas_6") || "0")
    
    if (quartos === 1) {
      return [{
        adults: totalAdultos,
        children0to3: totalCriancas0_3,
        children4to5: totalCriancas4_5,
        children6plus: totalCriancas6
      }]
    }
    
    const rooms: Room[] = []
    let adultosRestantes = totalAdultos
    let criancas0_3Restantes = totalCriancas0_3
    let criancas4_5Restantes = totalCriancas4_5
    let criancas6Restantes = totalCriancas6
    
    for (let i = 0; i < quartos; i++) {
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
    }
    
    if (adultosRestantes > 0) rooms[0].adults += adultosRestantes
    if (criancas0_3Restantes > 0) rooms[0].children0to3 += criancas0_3Restantes
    if (criancas4_5Restantes > 0) rooms[0].children4to5 += criancas4_5Restantes
    if (criancas6Restantes > 0) rooms[0].children6plus += criancas6Restantes
    
    return rooms
  }

  const calcularPrecoQuarto = (disponibilidade: any, quarto: Room): number => {
    const dadosValidados = validarDadosPreco(disponibilidade)
    
    const precoAdultos = dadosValidados.preco_adulto * quarto.adults
    const precoCriancas03 = dadosValidados.preco_crianca_0_3 * quarto.children0to3
    const precoCriancas45 = dadosValidados.preco_crianca_4_5 * quarto.children4to5
    const precoCriancas6mais = dadosValidados.preco_crianca_6_mais * quarto.children6plus
    
    const total = precoAdultos + precoCriancas03 + precoCriancas45 + precoCriancas6mais
    return isNaN(total) ? 0 : total
  }

  const determinarTipoQuarto = (quarto: Room): string => {
    // Usar a regra de pagantes (0–5 grátis a cada 2 adultos; 6+ conta como adulto)
    const calc = calcularPagantesHospedagem(
      quarto.adults,
      quarto.children0to3,
      quarto.children4to5,
      quarto.children6plus
    )
    return calc.tipoQuartoRequerido
  }

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

  const filters = useMemo(() => {
    const currentSearchType = searchParams.get("categoria") === "hospedagem" ? "habitacion" : "paquetes";
    if (currentSearchType === 'habitacion') {
      const checkin = searchParams.get("checkin");
      const checkout = searchParams.get("checkout");
      const dateRange: DateRange | undefined =
        checkin && checkout
          ? {
              from: new Date(checkin + "T00:00:00"),
              to: new Date(checkout + "T00:00:00"),
            }
          : undefined;
      
      return {
        destino: searchParams.get("destino") || undefined,
        dateRange: dateRange,
      };
    } else {
      return {
        destino: searchParams.get("destino") || undefined,
        cidade_saida: searchParams.get("salida") || undefined,
        transporte: searchParams.get("transporte") || undefined,
        data_saida: searchParams.get("data") || undefined,
      };
    }
  }, [searchParams, activeTab]);

  const [pessoas, setPessoas] = useState<PrecoPessoas>({
    adultos: parseInt(searchParams.get("adultos") || "2"),
    criancas_0_3: parseInt(searchParams.get("criancas_0_3") || "0"),
    criancas_4_5: parseInt(searchParams.get("criancas_4_5") || "0"),
    criancas_6_mais: parseInt(searchParams.get("criancas_6") || "0")
  })

  const [disponibilidades, setDisponibilidades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let data = [];
                   if (activeTab === 'habitaciones') {
        const checkin = filters.dateRange?.from
          ? filters.dateRange.from.toISOString().split('T')[0]
          : undefined;
        const checkout = filters.dateRange?.to
          ? filters.dateRange.to.toISOString().split('T')[0]
          : undefined;

        const searchFilters: HabitacionSearchFilters = { checkin, checkout };
        data = await fetchHabitacionesData(searchFilters);
      } else if (activeTab === 'paquetes') {
        const searchFilters: SearchFilters = { ...filters };
        data = await fetchRealData(searchFilters);
      } else if (activeTab === 'paseos') {
        const params = new URLSearchParams()
        if (searchParams.get('mes')) params.set('mes', searchParams.get('mes')!)
        if (searchParams.get('adultos')) params.set('adultos', searchParams.get('adultos')!)
        if (searchParams.get('criancas')) params.set('criancas', searchParams.get('criancas')!)
        
        const response = await fetch(`/api/sugerir-passeios?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Falha ao buscar passeios');
        }
        data = await response.json();
      }
      
      if ((process.env.NEXT_PUBLIC_DEBUG_LOGS === 'true' || process.env.DEBUG_LOGS === 'true')) {
        console.log('📊 Dados recebidos:', {
          tipo: activeTab,
          totalItems: data.length,
          tiposQuartoDisponiveis: [...new Set(data.map((item: any) => item.tipo_quarto))],
          capacidadesDisponiveis: [...new Set(data.map((item: any) => item.capacidade))],
          sampleItems: data.slice(0, 5).map((item: any) => ({
            id: item.id,
            slug_hospedagem: item.slug_hospedagem,
            tipo_quarto: item.tipo_quarto,
            capacidade: item.capacidade,
            valor_diaria: item.valor_diaria
          }))
        });
      }
      setDisponibilidades(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [filters, activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (disponibilidades && disponibilidades.length > 0) {
      const carregarDadosHospedagens = async () => {
        const novoCacheComodidades: {[key: string]: Array<{icon: string, label: string}>} = {}
        const novoCacheDistancia: {[key: string]: number | null} = {}
        
        for (const disponibilidade of disponibilidades) {
          const hotelName = disponibilidade.slug_hospedagem || disponibilidade.hotel;
          const hotelOficial = getHotelData(hotelName)?.displayName || hotelName;
          
          if (!comodidadesCache[hotelOficial] || distanciaPraiaCache[hotelOficial] === undefined) {
            const hospedagem = await getHospedagemData(hotelOficial)
            if(hospedagem) {
              novoCacheComodidades[hotelOficial] = formatComodidadesForCards(hospedagem.comodidades || []);
              novoCacheDistancia[hotelOficial] = hospedagem.distancia_praia ?? null;
            }
          }
        }
        
        if (Object.keys(novoCacheComodidades).length > 0) {
          setComodidadesCache(prev => ({ ...prev, ...novoCacheComodidades }))
        }
        if (Object.keys(novoCacheDistancia).length > 0) {
          setDistanciaPraiaCache(prev => ({ ...prev, ...novoCacheDistancia }))
        }
      }
      
      carregarDadosHospedagens()
    }
  }, [disponibilidades])

  const valoresReaisSupabase = {
    preco_adulto: 490,
    preco_crianca_0_3: 50,
    preco_crianca_4_5: 350,
    preco_crianca_6_mais: 490
  }

  const validarDadosPreco = (disponibilidade: any) => {
    const precoAdulto = Number(disponibilidade.preco_adulto) || valoresReaisSupabase.preco_adulto
    const precoCrianca03 = Number(disponibilidade.preco_crianca_0_3) || valoresReaisSupabase.preco_crianca_0_3
    const precoCrianca45 = Number(disponibilidade.preco_crianca_4_5) || valoresReaisSupabase.preco_crianca_4_5
    const precoCrianca6mais = Number(disponibilidade.preco_crianca_6_mais) || valoresReaisSupabase.preco_crianca_6_mais
    
    return {
      ...disponibilidade,
      preco_adulto: precoAdulto,
      preco_crianca_0_3: precoCrianca03,
      preco_crianca_4_5: precoCrianca45,
      preco_crianca_6_mais: precoCrianca6mais
    }
  }

  const calcularPrecoTotalSeguro = (disponibilidade: any, pessoas: PrecoPessoas): number => {
    const dadosValidados = validarDadosPreco(disponibilidade)
    
    // Contar crianças de 6+ como adultos pagantes
    const totalAdultosPagantes = pessoas.adultos + pessoas.criancas_6_mais;
    
    // Lógica para crianças de 0-5
    let criancas0a5Pagam = 0;
    if (pessoas.criancas_0_3 > 0) {
      // A primeira é grátis, as demais pagam
      criancas0a5Pagam = Math.max(0, pessoas.criancas_0_3 - 1);
    }

    const precoAdultos = dadosValidados.preco_adulto * totalAdultosPagantes
    const precoCriancas03 = dadosValidados.preco_crianca_0_3 * criancas0a5Pagam
    const precoCriancas45 = dadosValidados.preco_crianca_4_5 * pessoas.criancas_4_5
    
    const total = precoAdultos + precoCriancas03 + precoCriancas45
    return isNaN(total) ? 0 : total
  }
  
  const verificarCapacidadeQuartos = (disponibilidade: any, quartos: Room[]): boolean => {
    // Não usamos mais essa verificação agregada para Habitaciones
    const totalPessoas = quartos.reduce((total, room) =>
      total + room.adults + room.children0to3 + room.children4to5 + room.children6plus, 0
    )
    return disponibilidade.capacidade >= totalPessoas
  }

  const filtrarResultados = (items: any[], quartos: Room[]) => {
    if (!items || !Array.isArray(items) || items.length === 0) return []
    
    // Para Habitaciones, não filtrar por soma total de pessoas (quebra multi-quartos).
    // Deixe toda a base e componha por hotel mais abaixo.
    const itemsFiltrados = activeTab === 'habitaciones'
      ? items
      : items.filter(() => true)

    // Se for busca de pacotes, compor por hotel respeitando rooms_config (suporta múltiplos quartos)
    if (activeTab === 'paquetes') {
      const dataBusca = searchParams.get("data")
      // Filtrar por data exata (quando houver)
      const pacotesNaData = !dataBusca ? itemsFiltrados : itemsFiltrados.filter(p => p.data_saida === dataBusca)

      // Normalizador de tipo por capacidade
      const tipoPorCapacidade = (cap: number): string => {
        if (cap === 1) return 'Single'
        if (cap === 2) return 'Doble'
        if (cap === 3) return 'Triple'
        if (cap === 4) return 'Cuádruple'
        if (cap === 5) return 'Quíntuple'
        return 'Familiar'
      }

      // Conjunto de quartos solicitados pelo usuário
      const quartosSolicitados = getQuartosIndividuais()

      // Agrupar registros por hotel
      const porHotel = new Map<string, any[]>()
      pacotesNaData.forEach(p => {
        const hotel = p.hotel
        if (!porHotel.has(hotel)) porHotel.set(hotel, [])
        porHotel.get(hotel)!.push(p)
      })

      const resultadosCompostos: any[] = []

      for (const [hotel, registros] of porHotel.entries()) {
        // Para cada quarto solicitado, procurar uma linha com capacidade EXATA
        const linhasSelecionadas: any[] = []
        let hotelValido = true

        // Para suportar múltiplos quartos do mesmo tipo, permitir reuso da mesma linha
        // desde que a capacidade e o tipo correspondam. Marcamos a linha escolhida, mas não
        // removemos do conjunto (pois o registro do Supabase representa o preço por pessoa por tipo).
        for (const quarto of quartosSolicitados) {
          const capacidadeNecessaria = quarto.adults + quarto.children0to3 + quarto.children4to5 + quarto.children6plus

          // Prioridade 1: match por capacidade exata
          let linha = registros.find(r => Number(r.capacidade) === capacidadeNecessaria)

          // Prioridade 2 (fallback leve): se não achar, aceitar a linha com tipo equivalente
          if (!linha && registros.some(r => r.quarto_tipo)) {
            const tipoNecessario = tipoPorCapacidade(capacidadeNecessaria)
            linha = registros.find(r => (r.quarto_tipo || '').toLowerCase().includes(tipoNecessario.toLowerCase()))
          }

          if (!linha) {
            hotelValido = false
            break
          }
          linhasSelecionadas.push({ linha, quarto })
        }

        if (!hotelValido || linhasSelecionadas.length === 0) continue

        // Calcular total por hotel (somatório de quartos por idade)
        let totalHotel = 0
        const transporteHotel = (linhasSelecionadas[0]?.linha?.transporte) || 'Bus'
        let totalPessoasTaxadasAereo = 0

        linhasSelecionadas.forEach(({ linha, quarto }) => {
          if (transporteHotel === 'Aéreo') {
            const unitAdult = Number(linha.preco_adulto_aereo ?? linha.preco_adulto) || 0
            const unitC0_2 = Number(linha.preco_crianca_0_2_aereo) || 0
            const unitC2_5 = Number(linha.preco_crianca_2_5_aereo) || 0
            const unitC6 = Number(linha.preco_crianca_6_mais_aereo ?? unitAdult) || 0

            const subtotal =
              unitAdult * quarto.adults +
              unitC0_2 * quarto.children0to3 + // aqui tratamos 0-3 como 0-2 para Aéreo
              unitC2_5 * quarto.children4to5 + // 2-5
              unitC6 * quarto.children6plus
            totalHotel += subtotal

            totalPessoasTaxadasAereo += (quarto.adults || 0) + (quarto.children4to5 || 0) + (quarto.children6plus || 0)
          } else {
            const subtotal =
              (Number(linha.preco_adulto) || 0) * quarto.adults +
              (Number(linha.preco_crianca_0_3) || 0) * quarto.children0to3 +
              (Number(linha.preco_crianca_4_5) || 0) * quarto.children4to5 +
              (Number(linha.preco_crianca_6_mais) || 0) * quarto.children6plus
            totalHotel += subtotal
          }
        })

        // Aplicar taxas finais
        let finalHotel = totalHotel
        if (transporteHotel === 'Aéreo') {
          const taxaPorPessoa = Number(linhasSelecionadas[0]?.linha?.taxa_aereo_por_pessoa) || 200
          finalHotel = totalHotel + taxaPorPessoa * totalPessoasTaxadasAereo
        } else {
          finalHotel = calculateFinalPrice(totalHotel, transporteHotel)
        }

        // Preparar objeto final para renderização (usar a primeira linha para metadados visuais)
        const base = { ...linhasSelecionadas[0].linha }
        base.__linhas_compostas = linhasSelecionadas.map(({ linha, quarto }: any) => ({
          quarto_tipo: linha.quarto_tipo || tipoPorCapacidade(linha.capacidade),
          capacidade: linha.capacidade,
          // Para Aéreo, mapeamos para chaves genéricas usadas na página de detalhes
          preco_adulto: transporteHotel === 'Aéreo' ? (linha.preco_adulto_aereo ?? linha.preco_adulto) : linha.preco_adulto,
          preco_crianca_0_3: transporteHotel === 'Aéreo' ? (linha.preco_crianca_0_2_aereo ?? 0) : linha.preco_crianca_0_3,
          preco_crianca_4_5: transporteHotel === 'Aéreo' ? (linha.preco_crianca_2_5_aereo ?? 0) : linha.preco_crianca_4_5,
          preco_crianca_6_mais: transporteHotel === 'Aéreo' ? (linha.preco_crianca_6_mais_aereo ?? linha.preco_adulto_aereo ?? linha.preco_adulto) : linha.preco_crianca_6_mais,
          taxa_por_pessoa: transporteHotel === 'Aéreo' ? (linha.taxa_aereo_por_pessoa ?? 200) : undefined,
          quarto,
          subtotal: (Number(linha.preco_adulto) || 0) * quarto.adults +
                    (Number(linha.preco_crianca_0_3) || 0) * quarto.children0to3 +
                    (Number(linha.preco_crianca_4_5) || 0) * quarto.children4to5 +
                    (Number(linha.preco_crianca_6_mais) || 0) * quarto.children6plus
        }))
        base.__total_composto_base = totalHotel
        base.__total_composto = finalHotel
        base.transporte = transporteHotel

        resultadosCompostos.push(base)
      }

      // Ordenar pelo total final ascendente
      resultadosCompostos.sort((a, b) => (a.__total_composto || 0) - (b.__total_composto || 0))
      return resultadosCompostos
    }

    // Habitaciones: compor por hotel de acordo com cada quarto solicitado
    const quartosSolicitados: Room[] = getQuartosIndividuais()

    // Pré-agrupamento: hotel -> tipo_quarto -> agregado de diárias
    const porHotel: Map<string, Map<string, any>> = new Map()
    itemsFiltrados.forEach((diaria: any) => {
      const hotel = diaria.slug_hospedagem || diaria.hotel
      if (!porHotel.has(hotel)) porHotel.set(hotel, new Map())
      const porTipo = porHotel.get(hotel)!
      const tipo = (diaria.tipo_quarto || '').trim() || `Cap${diaria.capacidade}`
      if (!porTipo.has(tipo)) {
        porTipo.set(tipo, {
          hotel,
          slug_hospedagem: diaria.slug_hospedagem,
          tipo_quarto: diaria.tipo_quarto,
          capacidade: diaria.capacidade,
          valor_total: 0,
          noites: 0,
          valor_diaria: diaria.valor_diaria
        })
      }
      const agg = porTipo.get(tipo)
      agg.valor_total += Number(diaria.valor_diaria) || 0
      agg.noites += 1
      if (!agg.valor_diaria) agg.valor_diaria = diaria.valor_diaria
    })

    const resultadosCompostos: any[] = []

    porHotel.forEach((porTipo, hotel) => {
      // Tentar montar composição para todos os quartos solicitados
      const linhasSelecionadas: any[] = []
      let valido = true

      for (const q of quartosSolicitados) {
        const calc = calcularPagantesHospedagem(
          q.adults,
          q.children0to3,
          q.children4to5,
          q.children6plus
        )

        // Procurar tipo compatível: por nome (compatível) ou por capacidade exata
        let match: any = null
        // 1) Tentar por capacidade exata
        porTipo.forEach((agg) => {
          if (match) return
          if (Number(agg.capacidade) === calc.totalPagantes) match = agg
        })
        // 2) Se não achou, tentar por compatibilidade de nome
        if (!match) {
          porTipo.forEach((agg) => {
            if (match) return
            if (agg.tipo_quarto && tiposQuartoCompativeis(calc.tipoQuartoRequerido, agg.tipo_quarto)) {
              match = agg
            }
          })
        }

        if (!match) {
          valido = false
          return
        }

        // Registrar seleção com os dados do quarto solicitado
        const noites = match.noites || 1
        // Preço por diária já é preço do quarto (não por pessoa)
        const diaria = Number(match.valor_total && match.noites ? match.valor_total / match.noites : match.valor_diaria) || 0
        linhasSelecionadas.push({
          linha: match,
          quarto: {
            adults: q.adults,
            children0to3: q.children0to3,
            children4to5: q.children4to5,
            children6plus: q.children6plus
          },
          subtotal: diaria * noites,
          requeridoTipo: calc.tipoQuartoRequerido
        })
      }

      if (!valido || linhasSelecionadas.length === 0) return

      // Total por hotel (soma dos subtotais)
      const totalHotel = linhasSelecionadas.reduce((sum, it) => sum + (it.subtotal || 0), 0)

      // Construir base de saída compatível com renderização existente
      const primeiro = linhasSelecionadas[0].linha
      const base: any = { ...primeiro }
      base.__linhas_compostas = linhasSelecionadas.map(({ linha, quarto, subtotal, requeridoTipo }: any) => ({
        quarto_tipo: requeridoTipo || linha.tipo_quarto,
        capacidade: linha.capacidade,
        valor_por_noite: Number(linha.valor_total && linha.noites ? linha.valor_total / linha.noites : linha.valor_diaria) || 0,
        noites: linha.noites || 1,
        quarto,
        subtotal
      }))
      base.__total_composto = totalHotel
      base.slug_hospedagem = primeiro.slug_hospedagem
      base.hotel = hotel

      resultadosCompostos.push(base)
    })

    // Ordenar pelo total final ascendente
    resultadosCompostos.sort((a, b) => (a.__total_composto || 0) - (b.__total_composto || 0))
    return resultadosCompostos
}
  
  const quartosForRender = useMemo(() => parseRoomsFromURL(), [searchParams])
  const resultados = useMemo(() => filtrarResultados(
    disponibilidades, 
    quartosForRender
  ) || [], [disponibilidades, quartosForRender])

  const formatPrice = (price: number) => {
    const validPrice = Number(price) || 0;
    if (isNaN(validPrice)) return 'USD 0';
    return `USD ${Math.round(validPrice).toLocaleString('es-AR')}`;
  }

  // Formatação específica para Habitaciones em BRL
  const formatPriceBRL = (price: number) => {
    const validPrice = Number(price) || 0
    if (isNaN(validPrice)) return 'R$ 0'
    return `R$ ${Math.round(validPrice).toLocaleString('pt-BR')}`
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Data não disponível"
    const [year, month, day] = dateString.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short'
    })
  }
  
  const handleFilterSearch = (searchFilters: any) => {
    const params = new URLSearchParams()
    
    if (activeTab === 'habitaciones') {
      params.set("categoria", "hospedagem")
      if (searchFilters.destino) params.set("destino", searchFilters.destino)
      if (searchFilters.dateRange?.from)
        params.set("checkin", format(searchFilters.dateRange.from, "yyyy-MM-dd"))
      if (searchFilters.dateRange?.to)
        params.set("checkout", format(searchFilters.dateRange.to, "yyyy-MM-dd"))
    } else if (activeTab === 'paquetes') {
      params.set('categoria', 'paquete')
      if (searchFilters.salida) params.set('salida', searchFilters.salida)
      if (searchFilters.destino) params.set('destino', searchFilters.destino)
      const dataString = searchFilters.data ? format(searchFilters.data, 'yyyy-MM-dd') : undefined
      if (dataString) params.set('data', dataString)
      if (searchFilters.transporte) params.set('transporte', searchFilters.transporte)
    }

    let roomsToUse: { adults: number; children_0_3: number; children_4_5: number; children_6: number; }[] = []
    if (searchFilters.rooms && searchFilters.rooms.length > 0) {
      roomsToUse = searchFilters.rooms.map((room: any) => ({
        adults: room.adults,
        children_0_3: room.children_0_3,
        children_4_5: room.children_4_5,
        children_6: room.children_6
      }))
    } else {
      roomsToUse = getQuartosIndividuais().map((quarto: any) => ({
        adults: quarto.adults,
        children_0_3: quarto.children0to3,
        children_4_5: quarto.children4to5,
        children_6: quarto.children6plus
      }))
    }
    
    params.set('quartos', roomsToUse.length.toString())
    const totalAdultos = roomsToUse.reduce((sum, room) => sum + room.adults, 0)
    const totalCriancas03 = roomsToUse.reduce((sum, room) => sum + room.children_0_3, 0)
    const totalCriancas45 = roomsToUse.reduce((sum, room) => sum + room.children_4_5, 0)
    const totalCriancas6 = roomsToUse.reduce((sum, room) => sum + room.children_6, 0)
    
    params.set('adultos', totalAdultos.toString())
    params.set('criancas_0_3', totalCriancas03.toString())
    params.set('criancas_4_5', totalCriancas45.toString())
    params.set('criancas_6', totalCriancas6.toString())
    params.set('rooms_config', JSON.stringify(roomsToUse))
    
    router.push(`/resultados?${params.toString()}`)
  }

  const getHotelImage = (hotelName: string) => {
    const hotelData = getHotelData(hotelName)
    if (hotelData && hotelData.imageFiles && hotelData.imageFiles.length > 0) {
      return hotelData.imageFiles[0]
    }

    const hotelImageMap: { [key: string]: string } = {
      "RESIDENCIAL TERRAZAS": "/images/hoteles/Residencial Terrazas/1.png",
      "RESIDENCIAL LEÔNIDAS": "/images/hoteles/Residencial Leônidas/1.jpg", 
      "HOTEL FÊNIX": "/images/hoteles/Hotel Fênix/1.jpg",
      "HOTEL FENIX": "/images/hoteles/Hotel Fênix/1.jpg",
      "PALACE I": "/images/hoteles/Palace I/1.jpg",
      "BOMBINHAS PALACE HOTEL": "/images/hoteles/Bombinhas Palace Hotel/1.jpg",
      "CANAS GOLD HOTEL": "/images/hoteles/Canas Gold Hotel/1.png",
      "VERDES PÁSSAROS APART HOTEL": "/images/hoteles/Verdes Pássaros Apart Hotel/1.png",
      "ILHA NORTE APART HOTEL": "/images/hoteles/Ilha Norte Apart Hotel/1.jpg",
      "ILHA NORTE": "/images/hoteles/Ilha Norte/1.jpg",
      "TROPICANAS FLAT": "/images/hoteles/Tropicanas Flat/1.jpg"
    }
    const normalizedName = hotelName.toUpperCase().trim()
    return hotelImageMap[normalizedName] || null
  }

  const getComodidadesReais = async (hotelName: string) => {
    try {
      const hospedagem = await getHospedagemData(hotelName)
      if (hospedagem && hospedagem.comodidades && hospedagem.comodidades.length > 0) {
        return formatComodidadesForCards(hospedagem.comodidades)
      } else {
        return COMODIDADES_GENERICAS
      }
    } catch (error) {
      return COMODIDADES_GENERICAS
    }
  }

  const iconComponents: { [key: string]: any } = {
    Wifi, AirVent, Tv, Refrigerator, Waves, Utensils, Shield, Sparkles, Clock, Car, ChefHat, Bath, Flame, Gamepad2, Circle, Coffee
  }

  const formatPessoas = (pessoas: PrecoPessoas) => {
    const totalAdultos = pessoas.adultos
    const totalCriancas = pessoas.criancas_0_3 + pessoas.criancas_4_5 + pessoas.criancas_6_mais
    if (totalCriancas === 0) return `${totalAdultos} ${totalAdultos === 1 ? 'Adulto' : 'Adultos'}`
    return `${totalAdultos} ${totalAdultos === 1 ? 'Adulto' : 'Adultos'} | ${totalCriancas} ${totalCriancas === 1 ? 'Niño' : 'Niños'}`
  }

  const calcularPrecoPorPessoa = (precoTotal: number, totalPessoas: number) => {
    return totalPessoas > 0 ? precoTotal / totalPessoas : precoTotal
  }

  const formatTotalPessoas = (pessoas: PrecoPessoas) => {
    const adultos = pessoas.adultos
    const criancas = pessoas.criancas_0_3 + pessoas.criancas_4_5 + pessoas.criancas_6_mais
    let texto = `${adultos} ${adultos === 1 ? 'Adulto' : 'Adultos'}`
    if (criancas > 0) texto += `, ${criancas} ${criancas === 1 ? 'Niño' : 'Niños'}`
    return texto
  }

  // Formata a ocupação por quarto para Habitaciones
  const formatRoomPeople = (q: Room) => {
    const adultosTxt = `${q.adults} Adulto${q.adults === 1 ? '' : 's'}`
    const ninos = (q.children0to3 || 0) + (q.children4to5 || 0) + (q.children6plus || 0)
    const ninosTxt = ninos > 0 ? ` + ${ninos} Niño${ninos === 1 ? '' : 's'}` : ''
    return `${adultosTxt}${ninosTxt}`
  }

  const gerarTextoTiposQuartos = (disponibilidade?: any): string => {
    const quartosIndividuaisCard = parseRoomsFromURL();
    const temMultiplosQuartosCard = quartosIndividuaisCard.length > 1;
    const numQuartos = quartosIndividuaisCard.length;

    if (!temMultiplosQuartosCard) {
      const tipoCalculado = determinarTipoQuarto(quartosIndividuaisCard[0])
      return `Habitación ${tipoCalculado}`
    }
    
    const tiposQuartos = quartosIndividuaisCard.map(quarto => determinarTipoQuarto(quarto))
    const tiposUnicos = [...new Set(tiposQuartos)]
    
    if (tiposUnicos.length === 1) {
      return `${numQuartos}x ${tiposUnicos[0]}`
    }
    
    return tiposUnicos.join(' + ')
  }

  const quartosIndividuais = getQuartosIndividuais() || []
  const temMultiplosQuartos = (parseInt(searchParams.get("quartos") || "1")) > 1
  
  const gerarUrlDetalhes = (disponibilidade: any, precoCalculado?: number, hotelName?: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('hotel', hotelName || disponibilidade.slug_hospedagem || disponibilidade.hotel)
    
    const basePrice = precoCalculado || 0
    params.set('preco', basePrice.toString())
    
    if (activeTab === 'paquetes') {
      // Enviar breakdown composto quando houver múltiplos quartos
      if (Array.isArray(disponibilidade.__linhas_compostas)) {
        params.set('rooms_breakdown', encodeURIComponent(JSON.stringify(disponibilidade.__linhas_compostas)))
      } else {
        const dadosValidados = validarDadosPreco(disponibilidade);
        params.set('preco_adulto', dadosValidados.preco_adulto.toString());
        params.set('preco_crianca_0_3', dadosValidados.preco_crianca_0_3.toString());
        params.set('preco_crianca_4_5', dadosValidados.preco_crianca_4_5.toString());
        params.set('preco_crianca_6_mais', dadosValidados.preco_crianca_6_mais.toString());
      }
      // Transport type for details page taxes
      if (disponibilidade.transporte) params.set('transporte', disponibilidade.transporte)
      if (disponibilidade.__total_composto_base != null) {
        params.set('preco_base_total', String(disponibilidade.__total_composto_base))
      }
      if (disponibilidade.noites_hotel) params.set('noites_hotel', disponibilidade.noites_hotel.toString())
      if (disponibilidade.dias_totais) params.set('dias_totais', disponibilidade.dias_totais.toString())
      if (disponibilidade.dias_viagem) params.set('dias_viagem', disponibilidade.dias_viagem.toString())
    } else if (disponibilidade.valor_diaria) {
      params.set('valor_diaria', disponibilidade.valor_diaria.toString());
    }

    if (disponibilidade.quarto_tipo || disponibilidade.tipo_quarto) {
      params.set('quarto_tipo', disponibilidade.tipo_quarto || disponibilidade.quarto_tipo)
    }
    
    const roomsConfig = quartosIndividuais.map(quarto => ({
      adults: quarto.adults,
      children_0_3: quarto.children0to3,
      children_4_5: quarto.children4to5,
      children_6: quarto.children6plus
    }))
    params.set('rooms_config', encodeURIComponent(JSON.stringify(roomsConfig)))
    
    const url = activeTab === 'habitaciones' ? '/detalhes-hospedagem' : '/detalhes';
    return `${url}?${params.toString()}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20">
          <div className="container mx-auto px-4 lg:px-[70px] py-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Cargando disponibilidades...</h2>
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
      
      <div className="pt-20">
        <div className="bg-gray-100 border-b">
          <div className="container mx-auto px-4 lg:px-[70px] py-6">
            {/* ABAS DE SELEÇÃO */}
            <div className="mb-6 flex justify-center">
              <div className="flex bg-white shadow-md rounded-2xl p-1.5 w-full max-w-md lg:max-w-md mx-auto">
                <button
                  onClick={() => handleTabChange("paquetes")}
                  className={`relative flex-1 py-2.5 px-2 lg:px-4 rounded-xl font-semibold text-xs lg:text-sm transition-all duration-300 flex items-center justify-center group ${
                    activeTab === "paquetes" 
                      ? "bg-orange-500 text-white shadow-lg" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Luggage className="w-4 h-4 mr-1 lg:mr-2" />
                  Paquetes
                </button>
                <button
                  onClick={() => handleTabChange("habitaciones")}
                  className={`relative flex-1 py-2.5 px-2 lg:px-4 rounded-xl font-semibold text-xs lg:text-sm transition-all duration-300 flex items-center justify-center group ${
                    activeTab === "habitaciones"
                      ? "bg-orange-500 text-white shadow-lg"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Bed className="w-4 h-4 mr-1 lg:mr-2" />
                  Habitaciones
                </button>
                <button
                  onClick={() => handleTabChange("paseos")}
                  className={`relative flex-1 py-2.5 px-2 lg:px-4 rounded-xl font-semibold text-xs lg:text-sm transition-all duration-300 flex items-center justify-center group ${
                    activeTab === "paseos"
                      ? "bg-orange-500 text-white shadow-lg"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Sun className="w-4 h-4 mr-2" />
                  Paseos
                </button>
              </div>
            </div>
          
            {activeTab === 'habitaciones' ? (
              <HabitacionesSearchFilter
                variant="results"
                initialFilters={{
                  destino: searchParams.get("destino") || "Canasvieiras",
                  dateRange: (() => {
                    const checkin = searchParams.get("checkin");
                    const checkout = searchParams.get("checkout");
                    if (checkin && checkout) {
                      return { from: new Date(checkin + 'T00:00:00'), to: new Date(checkout + 'T00:00:00') };
                    }
                    return undefined;
                  })(),
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
            ) : activeTab === 'paquetes' ? (
              <UnifiedSearchFilter 
                variant="results"
                initialFilters={{
                  salida: searchParams.get("salida") || "",
                  destino: searchParams.get("destino") || "",
                  data: (() => {
                    const dataParam = searchParams.get("data")
                    if (dataParam) {
                      const [year, month, day] = dataParam.split('-').map(Number)
                      return new Date(year, month - 1, day)
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
            ) : activeTab === 'paseos' ? (
              <PaseosSearchFilter
                variant="results"
                initialFilters={{
                  month: searchParams.get("mes") || undefined,
                  people: {
                    adults: parseInt(searchParams.get("adultos") || "2"),
                    children_0_3: parseInt(searchParams.get("criancas_0_3") || "0"),
                    children_4_5: parseInt(searchParams.get("criancas_4_5") || "0"),
                    children_6_plus: parseInt(searchParams.get("criancas_6_plus") || "0")
                  }
                }}
                onSearch={handleFilterSearch}
              />
            ) : (
              <UnifiedSearchFilter 
                variant="results"
                initialFilters={{
                  salida: searchParams.get("salida") || "",
                  destino: searchParams.get("destino") || "",
                  data: (() => {
                    const dataParam = searchParams.get("data")
                    if (dataParam) {
                      const [year, month, day] = dataParam.split('-').map(Number)
                      return new Date(year, month - 1, day)
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
            )}
          </div>
        </div>



        <div className="container mx-auto px-4 lg:px-[70px] py-8">
          {(() => {
            if (activeTab === 'paseos') {
              if (loading) {
                return <p>Carregando passeios...</p>
              }
              if (error) {
                return <p>Erro ao carregar passeios: {error}</p>
              }
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                  {(disponibilidades as Paseo[]).map((paseo) => (
                    <PaseoCard
                      key={paseo.id}
                      passeio={paseo}
                    />
                  ))}
                </div>
              );
            }

            if (resultados.length === 0) {
              return (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {activeTab === 'habitaciones' ? 'Ninguna habitación encontrada' : 'Ninguna disponibilidad encontrada'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {activeTab === 'habitaciones' 
                      ? 'No hay habitaciones disponibles que coincidan con tu búsqueda'
                      : 'Nenhum pacote encontrado com essas opções'
                    }
                  </p>
                  {activeTab === 'habitaciones' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                      <h4 className="font-semibold text-blue-900 mb-2">💡 Dica sobre tipos de habitación:</h4>
                      <ul className="text-sm text-blue-800 text-left space-y-1">
                        <li>• 1 criança de 0-5 anos é gratuita a cada 2 adultos</li>
                        <li>• Crianças 6+ contam como adultos</li>
                        <li>• O tipo de quarto é baseado no número de pagantes</li>
                      </ul>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div className={`grid gap-4 md:gap-6 ${
                viewMode === "grid" 
                  ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" 
                  : "grid-cols-1"
              }`}>
                {(resultados || []).map((disponibilidade, index) => {
                  const quartosIndividuaisCard = parseRoomsFromURL();
                  const temMultiplosQuartosCard = quartosIndividuaisCard.length > 1;

                   // Lógica de Preço
                   let finalPrice = 0;
                  let installments = 1;
                  let installmentValue = 0;
                  
                   if (activeTab === 'habitaciones') {
                     // Se vier composição por hotel (__linhas_compostas), usar a soma dos subtotais
                     if (Array.isArray(disponibilidade.__linhas_compostas) && disponibilidade.__linhas_compostas.length > 0) {
                       finalPrice = Number(disponibilidade.__total_composto) || disponibilidade.__linhas_compostas.reduce((s: number, l: any) => s + (Number(l.subtotal) || 0), 0)
                     } else {
                       // Fallback antigo (um tipo por resultado)
                       const adultos = quartosIndividuais.reduce((sum, q) => sum + q.adults, 0);
                       const criancas_0_3 = quartosIndividuais.reduce((sum, q) => sum + q.children0to3, 0);
                       const criancas_4_5 = quartosIndividuais.reduce((sum, q) => sum + q.children4to5, 0);
                       const criancas_6_mais = quartosIndividuais.reduce((sum, q) => sum + q.children6plus, 0);
                       const calculoPagantes = calcularPagantesHospedagem(adultos, criancas_0_3, criancas_4_5, criancas_6_mais);
                       const precoHospedagem = calcularPrecoHospedagem(
                         disponibilidade.valor_diaria || (disponibilidade.valor_total / disponibilidade.noites) || 0,
                         disponibilidade.noites || 1,
                         calculoPagantes
                       );
                       finalPrice = precoHospedagem.precoTotal;
                     }
                   } else {
                     // Paquetes: exibir preço BASE (sem taxas) nos cards de resultados
                     if (disponibilidade.__total_composto != null) {
                       // Quando houver composição, usar o total base sem taxa aérea
                       finalPrice = Number(disponibilidade.__total_composto_base ?? disponibilidade.__total_composto) || 0
                     } else {
                       // Fallback: cálculo por idade (quarto único) SEM aplicar taxa aérea aqui
                       const basePrice = calcularPrecoTotalSeguro(disponibilidade, pessoas);
                       finalPrice = basePrice;
                     }
                     const { installments: inst, installmentValue: val } = calculateInstallments(finalPrice, disponibilidade.data_saida);
                     installments = inst;
                     installmentValue = val;
                   }

                   // Para Paquetes, exibir preço por pessoa (total dividido pelo nº de pessoas)
                   let displayPrice = finalPrice;
                   if (activeTab === 'paquetes') {
                     const totalPeople = (pessoas.adultos || 0) + (pessoas.criancas_0_3 || 0) + (pessoas.criancas_4_5 || 0) + (pessoas.criancas_6_mais || 0);
                     const perPerson = totalPeople > 0 ? (finalPrice / totalPeople) : finalPrice;
                     displayPrice = perPerson;
                     const { installments: instPP, installmentValue: valPP } = calculateInstallments(perPerson, disponibilidade.data_saida);
                     installments = instPP;
                     installmentValue = valPP;
                   }
                  
                  // Dados do Hotel
                  const hotelIdentifier = disponibilidade.slug_hospedagem || disponibilidade.hotel;
                  const hotelData = getHotelData(hotelIdentifier);
                  const hotelNameForDisplay = hotelData?.displayName || hotelIdentifier?.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || "Hotel no encontrado";
                  const hotelImage = hotelData?.imageFiles?.[0] || "/placeholder.svg";

                  // Comodidades
                  const amenidadesRaw = (hotelNameForDisplay && comodidadesCache[hotelNameForDisplay]) || [];
                  const maxComodidades = 4;
                  const amenidades = amenidadesRaw.slice(0, maxComodidades);
                  const hasMoreAmenidades = amenidadesRaw.length > maxComodidades;
                  const distanciaPraia = hotelNameForDisplay ? distanciaPraiaCache[hotelNameForDisplay] : undefined;

                  return (
                    <div key={disponibilidade.id} className={`bg-white border border-gray-100 rounded-3xl shadow-lg p-3 flex flex-col gap-4 hover:shadow-2xl transition-shadow duration-300 ${viewMode === 'list' ? 'md:flex-row md:gap-6' : ''}`}>
                       <div className={`relative w-full rounded-2xl overflow-hidden ${viewMode === 'list' ? 'md:w-1/3 h-auto' : 'h-64'}`}>
                        <Image src={hotelImage} alt={`Foto de ${hotelNameForDisplay}`} layout="fill" objectFit="cover" priority={index < 3} sizes={viewMode === 'list' ? '(min-width: 768px) 33vw, 100vw' : '(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw'} />
                      </div>

                      <div className={`flex flex-col gap-4 px-2 ${viewMode === 'list' ? 'md:w-2/3 md:px-0' : 'px-4 pb-2'}`}>
                        <div className="text-left">
                          <h3 className="font-bold text-2xl text-gray-900 font-manrope">{hotelNameForDisplay}</h3>
                          <p className="text-sm text-gray-600">
                            {Array.isArray(disponibilidade.__linhas_compostas) && disponibilidade.__linhas_compostas.length > 0
                              ? (() => {
                                  const tipos = disponibilidade.__linhas_compostas.map((l: any) => (l.quarto_tipo || '').trim()).filter(Boolean)
                                  const counts: Record<string, number> = {}
                                  tipos.forEach((t: string) => { counts[t] = (counts[t] || 0) + 1 })
                                  const parts = Object.entries(counts).map(([tipo, qtd]) => qtd > 1 ? `${qtd}x ${tipo}` : tipo)
                                  return parts.join(' + ')
                                })()
                              : (disponibilidade.tipo_quarto || gerarTextoTiposQuartos(disponibilidade))}
                          </p>
                          <div className="flex items-center text-sm text-gray-500 gap-2 mt-1">
                            <MapPin className="w-4 h-4 text-orange-500" />
                            <span>{filters.destino || 'Canasvieiras'}</span>
                            {distanciaPraia != null && (
                              <>
                                <span className="text-gray-400">•</span>
                                <span>{distanciaPraia}m de la Playa</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-4">
                          {amenidades.map((amenidade: any, idx: number) => {
                            const IconComponent = iconComponents[amenidade.icon] || Circle;
                            return(
                              <div key={idx} className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                                <IconComponent className="w-3.5 h-3.5" />
                                <span className="text-xs font-medium">{amenidade.label}</span>
                              </div>
                            )
                          })}
                          {hasMoreAmenidades && (
                            <div className="flex items-center justify-center bg-gray-100 text-gray-700 w-7 h-7 rounded-full text-xs font-bold">
                              +
                            </div>
                          )}
                        </div>
                        
                           <div className="text-sm mt-4">
                          {activeTab === 'paquetes' ? (
                            <div className="space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="border rounded-xl p-2 flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-orange-500"/><span>{formatDate(disponibilidade.data_saida)}</span></div>
                                <div className="border rounded-xl p-2 flex items-center gap-2"><Clock className="w-4 h-4 text-orange-500"/><span>{disponibilidade.noites_hotel || 7} noches</span></div>
                                <div className="border rounded-xl p-2 flex items-center gap-2">{disponibilidade.transporte === 'Aéreo' ? <Plane className="w-4 h-4 text-orange-500"/> : <Bus className="w-4 h-4 text-orange-500"/>}<span>{disponibilidade.transporte} + Hotel</span></div>
                                <div className="border rounded-xl p-2 flex items-center gap-2"><Users className="w-4 h-4 text-orange-500"/><span>{formatPessoas(pessoas)}</span></div>
                              </div>
                              {Array.isArray(disponibilidade.__linhas_compostas) && disponibilidade.__linhas_compostas.length > 0 && (
                                <div className="bg-gray-50 rounded-2xl p-3">
                                  {disponibilidade.__linhas_compostas.map((info: any, idx: number) => {
                                    const adults = Number(info?.quarto?.adults || 0)
                                    const c03 = Number(info?.quarto?.children0to3 || 0)
                                    const c45 = Number(info?.quarto?.children4to5 || 0)
                                    const c6  = Number(info?.quarto?.children6plus || 0)
                                    const unitAdult = Number(info?.preco_adulto || 0)
                                    const unit03    = Number(info?.preco_crianca_0_3 || 0)
                                    const unit45    = Number(info?.preco_crianca_4_5 || 0)
                                    const unit6     = Number(info?.preco_crianca_6_mais || 0)
                                    const roomSubtotal = unitAdult * adults + unit03 * c03 + unit45 * c45 + unit6 * c6
                                    const isAereo = disponibilidade.transporte === 'Aéreo'
                                    const label03 = isAereo ? '0–2 años' : '0–3 años'
                                    const label45 = isAereo ? '2–5 años' : '4–5 años'
                                    const label6p = '6+ años'

                                    return (
                                      <div key={idx} className="py-2">
                                        <div className="flex justify-between items-center">
                                          <div>
                                            <span className="font-bold text-orange-600">Cuarto {idx + 1}:</span>
                                            <span className="text-gray-800 ml-1">{info.quarto_tipo}</span>
                                          </div>
                                          <span className="font-semibold text-gray-700">{formatPrice(roomSubtotal)}</span>
                                        </div>
                                        <div className="mt-1 space-y-0.5 text-xs text-gray-600">
                                          {adults > 0 && (
                                            <div className="flex justify-between">
                                              <span>{adults} Adulto{adults > 1 ? 's' : ''}</span>
                                              <span className="text-gray-700">{formatPrice(unitAdult)} <span className="text-[10px] text-gray-500">por persona</span></span>
                                            </div>
                                          )}
                                          {c45 > 0 && (
                                            <div className="flex justify-between">
                                              <span>{c45} Niño{c45 > 1 ? 's' : ''} ({label45})</span>
                                              <span className="text-gray-700">{formatPrice(unit45)}</span>
                                            </div>
                                          )}
                                          {c03 > 0 && (
                                            <div className="flex justify-between">
                                              <span>{c03} Niño{c03 > 1 ? 's' : ''} ({label03})</span>
                                              <span className="text-gray-700">{formatPrice(unit03)}</span>
                                            </div>
                                          )}
                                          {c6 > 0 && (
                                            <div className="flex justify-between">
                                              <span>{c6} Niño{c6 > 1 ? 's' : ''} ({label6p})</span>
                                              <span className="text-gray-700">{formatPrice(unit6)}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {/* ✅ NOVO: Títulos fora dos retângulos */}
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <p className="text-xs font-medium text-gray-600 mb-1">Check-in</p>
                                  <div className="border rounded-xl p-2 flex items-center justify-center gap-2">
                                    <CalendarIcon className="w-4 h-4 text-green-500"/>
                                    <span className="font-bold">{filters.dateRange?.from ? formatDate(filters.dateRange.from.toISOString().split('T')[0]) : '-'}</span>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-gray-600 mb-1">Check-out</p>
                                  <div className="border rounded-xl p-2 flex items-center justify-center gap-2">
                                    <CalendarIcon className="w-4 h-4 text-red-500"/>
                                    <span className="font-bold">{filters.dateRange?.to ? formatDate(filters.dateRange.to.toISOString().split('T')[0]) : '-'}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="border rounded-xl p-2 flex items-center gap-2"><Users className="w-4 h-4 text-orange-500"/><span>{formatPessoas(pessoas)}</span></div>

                              {/* Distribuição por quarto no padrão de Paquetes */}
                              <div className="bg-gray-50 rounded-2xl p-3">
                                {quartosIndividuaisCard.map((q, idx) => {
                                  const roomType = determinarTipoQuarto(q)
                                  const noites = disponibilidade.noites || 1
                                  const diaria = Number(disponibilidade.valor_diaria || (disponibilidade.valor_total && disponibilidade.noites ? disponibilidade.valor_total / disponibilidade.noites : 0))
                                  const roomTotal = diaria * noites
                                  return (
                                    <div key={idx} className="flex justify-between items-center text-sm py-1">
                                      <div>
                                        <span className="font-bold text-orange-600">Cuarto {idx + 1}:</span>
                                        <span className="text-gray-800 ml-1">{roomType}</span>
                                        <p className="text-xs text-gray-500">{formatRoomPeople(q)}</p>
                                      </div>
                                      <span className="font-semibold text-gray-700">{formatPriceBRL(roomTotal)}</span>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Removido para evitar duplicidade: manter apenas o breakdown principal em Paquetes */}

                        {/* ✅ NOVO: Explicação de pagantes ACIMA da linha do valor */}
                        {activeTab === 'habitaciones' && (() => {
                          // Badge de resumo: somar pagantes no total para exibir na etiqueta
                          const adultos = quartosIndividuais.reduce((sum, q) => sum + q.adults, 0);
                          const criancas_0_3 = quartosIndividuais.reduce((sum, q) => sum + q.children0to3, 0);
                          const criancas_4_5 = quartosIndividuais.reduce((sum, q) => sum + q.children4to5, 0);
                          const criancas_6_mais = quartosIndividuais.reduce((sum, q) => sum + q.children6plus, 0);
                          const calculoPagantes = calcularPagantesHospedagem(adultos, criancas_0_3, criancas_4_5, criancas_6_mais);
                          const faixaGratis = calculoPagantes.criancasGratuitas > 0 ? (criancas_0_3 > 0 ? '0–3 años' : '0–5 años') : null;
                          
                          return (
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 border border-gray-200 rounded-full px-2 py-0.5 text-[11px]">
                                <Users className="w-3 h-3 text-orange-500" />
                                <span className="font-semibold">{calculoPagantes.totalPagantes}</span>
                                <span>pagantes</span>
                              </span>
                              {calculoPagantes.criancasGratuitas > 0 && (
                                <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5 text-[11px]">
                                  <Sparkles className="w-3 h-3" />
                                  <span className="font-semibold">{calculoPagantes.criancasGratuitas}</span>
                                  <span>niño{calculoPagantes.criancasGratuitas > 1 ? 's' : ''} ({faixaGratis}) gratis</span>
                                </span>
                              )}
                            </div>
                          );
                        })()}

                         <div className="border-t pt-4 mt-2 flex justify-between items-center">
                           <div>
                             <div className="flex items-center gap-2">
                              <p className="text-2xl font-bold text-gray-900 font-manrope">{activeTab === 'habitaciones' ? formatPriceBRL(displayPrice) : formatPrice(displayPrice)}</p>
                              {activeTab === 'paquetes' && (
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <button aria-label="Cómo calculamos" className="p-1 rounded-full hover:bg-gray-100">
                                      <Info className="w-4 h-4 text-gray-500" />
                                    </button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-64">
                                    <div className="text-xs text-gray-700">
                                      Precio por persona = Total del paquete ÷ Nº de personas.<br />
                                      {disponibilidade.transporte === 'Aéreo'
                                        ? 'Precio base sin tasas. La tasa aérea de USD 200 por adulto/niño 2–5/6+ (0–2 exento) se agrega en la página de detalles.'
                                        : 'Sin tasas administrativas adicionales.'}
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              )}
                            </div>
                            {activeTab === 'paquetes' && (
                              <p className="text-xs text-gray-500 -mt-1">por persona</p>
                            )}
                            {activeTab === 'habitaciones' && (
                              <p className="text-xs text-gray-500 -mt-1">por noche</p>
                            )}
                            {installments > 1 && activeTab === 'paquetes' && (
                              <p className="text-sm text-green-600 font-semibold">
                                hasta {installments}x de {formatPrice(installmentValue)}
                              </p>
                            )}
                          </div>
                          <Link href={gerarUrlDetalhes(disponibilidade, finalPrice, hotelNameForDisplay)} prefetch passHref>
                            <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-6 py-5 font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all">
                              Ver detalles <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </Link>
                        </div>

                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })()}
        </div>
      </div>
      <Footer />
    </div>
  )
}
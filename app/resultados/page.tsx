"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { UnifiedSearchFilter } from "@/components/unified-search-filter"
import { HabitacionesSearchFilter } from "@/components/habitaciones-search-filter"
import { PaseosSearchFilter } from "@/components/paseos-search-filter"
import { DisponibilidadeFilter, PrecoPessoas } from "@/lib/supabase"
import { fetchRealData, fetchHabitacionesData, SearchFilters, HabitacionSearchFilters } from "@/lib/supabase-service"
import { getHospedagemData, formatComodidadesForCards, COMODIDADES_GENERICAS } from "@/lib/hospedagens-service"
import { calculateInstallments } from "@/lib/utils";
import {
  computePackageBaseTotal,
  computePackagePricingSummary,
  type PackagePricingSummary,
} from "@/lib/package-pricing";
import { createLogger } from "@/lib/logger";
import { recordSearchEvent } from "@/lib/search-analytics";
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
  Sun,
  Info,
   CalendarCheck,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale";
import { DateRange } from "react-day-picker"
import { getHotelData } from "@/lib/hotel-data"
import { PaseoCard } from "@/components/ui/paseo-card"
import type { Paseo } from "@/lib/passeios-service"
import { FadeIn } from "@/components/ui/fade-in"

const resultadosLogger = createLogger("resultados-page")

const ResultsSkeleton = ({ viewMode }: { viewMode: "grid" | "list" }) => {
  const placeholders = Array.from({ length: viewMode === "list" ? 3 : 6 })
  const gridClass = viewMode === "grid"
    ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
    : "grid-cols-1"

  return (
    <div
      className={`grid gap-4 md:gap-6 ${gridClass}`}
      aria-label="Carregando resultados"
    >
      {placeholders.map((_, index) => (
        <Card key={index} className="border border-muted-foreground/10 shadow-sm">
          <CardContent className="p-0">
            <div className="h-48 w-full overflow-hidden rounded-t-xl bg-muted/40">
              <Skeleton className="h-full w-full" />
            </div>
            <div className="space-y-4 p-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-6 w-3/4" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-16" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

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
    
    router.push(`/resultados?${params.toString()}`);
  };

  const [sortBy, setSortBy] = useState("relevance")
  const [comodidadesCache, setComodidadesCache] = useState<{[key: string]: Array<{icon: string, label: string}>}>({})
  const [distanciaPraiaCache, setDistanciaPraiaCache] = useState<{[key: string]: number | null}>({})
  const [pricingSummaries, setPricingSummaries] = useState<Record<string, { summary: PackagePricingSummary; roomsSignature: string }>>({})
  
  const log = resultadosLogger

  const getQuartosIndividuais = useCallback((): Room[] => {
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
            children6plus: room.children_6 || 0,
          }))
        }
      } catch (error) {
        log.warn('⚠️ Erro ao decodificar rooms_config, usando fallback')
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
        children6plus: totalCriancas6,
      }]
    }
    
    const rooms: Room[] = []
    let adultosRestantes = totalAdultos
    let criancas0_3Restantes = totalCriancas0_3
    let criancas4_5Restantes = totalCriancas4_5
    let criancas6Restantes = totalCriancas6
    
    for (let i = 0; i < quartos; i++) {
      const divisor = Math.max(1, quartos - i)
      const adultosPorQuarto = Math.floor(adultosRestantes / divisor)
      const criancas0_3PorQuarto = Math.floor(criancas0_3Restantes / divisor)
      const criancas4_5PorQuarto = Math.floor(criancas4_5Restantes / divisor)
      const criancas6PorQuarto = Math.floor(criancas6Restantes / divisor)
      
      rooms.push({
        adults: adultosPorQuarto,
        children0to3: criancas0_3PorQuarto,
        children4to5: criancas4_5PorQuarto,
        children6plus: criancas6PorQuarto,
      })
      
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
  }, [log, searchParams])

  const parseRoomsFromURL = useCallback((): Room[] => {
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
      children6plus: totalCriancas6,
    }]
  }, [getQuartosIndividuais, searchParams])

  const buildRoomsForDisponibilidade = useCallback(
    (disponibilidade: any): Room[] => {
      if (Array.isArray(disponibilidade?.__linhas_compostas) && disponibilidade.__linhas_compostas.length > 0) {
        return disponibilidade.__linhas_compostas.map((info: any) => ({
          adults: Number(info?.quarto?.adults ?? 0),
          children0to3: Number(info?.quarto?.children0to3 ?? 0),
          children4to5: Number(info?.quarto?.children4to5 ?? 0),
          children6plus: Number(info?.quarto?.children6plus ?? 0),
        }))
      }
      return parseRoomsFromURL()
    },
    [parseRoomsFromURL],
  )

  const buildRoomsSignature = useCallback((rooms: Room[]) =>
    rooms
      .map((room) =>
        [room.adults, room.children0to3, room.children4to5, room.children6plus]
          .map((value) => String(value ?? 0))
          .join('-'),
      )
      .join('|'),
  [],)

  const buildResultKey = useCallback(
    (disponibilidade: any, rooms: Room[]) => {
      const baseId =
        disponibilidade.slug_pacote ||
        disponibilidade.slug ||
        disponibilidade.slug_hospedagem ||
        disponibilidade.id ||
        disponibilidade.hotel ||
        'resultado'
      return `${String(baseId)}::${buildRoomsSignature(rooms)}`
    },
    [buildRoomsSignature],
  )

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
  }, [searchParams]);

  const [pessoas, setPessoas] = useState<PrecoPessoas>({
    adultos: parseInt(searchParams.get("adultos") || "2"),
    criancas_0_3: parseInt(searchParams.get("criancas_0_3") || "0"),
    criancas_4_5: parseInt(searchParams.get("criancas_4_5") || "0"),
    criancas_6_mais: parseInt(searchParams.get("criancas_6") || "0")
  })

  const [disponibilidades, setDisponibilidades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [waitingForSearch, setWaitingForSearch] = useState(false) // Novo estado

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      setWaitingForSearch(false) // Resetar estado de espera

      // Validação Estrita de Filtros antes de buscar
      if (activeTab === 'habitaciones') {
        const hasDates = filters.dateRange?.from && filters.dateRange?.to
        if (!hasDates) {
           setDisponibilidades([])
           setWaitingForSearch(true)
           setLoading(false)
           return
        }
      } else if (activeTab === 'paquetes') {
        const hasTransport = !!filters.transporte
        const hasDate = !!filters.data_saida
        if (!hasTransport || !hasDate) {
           setDisponibilidades([])
           setWaitingForSearch(true)
           setLoading(false)
           return
        }
      }

      let data: any[] = []
      
      const categoriaAnalytics =
        activeTab === 'habitaciones' ? 'hospedagem' : activeTab === 'paseos' ? 'paseo' : 'paquete'
        
      const roomsSnapshot = parseRoomsFromURL()
      let analyticsFilters: Record<string, unknown> = {}

      if (activeTab === 'habitaciones') {
        const checkin = filters.dateRange?.from
          ? filters.dateRange.from.toISOString().split('T')[0]
          : undefined
        const checkout = filters.dateRange?.to
          ? filters.dateRange.to.toISOString().split('T')[0]
          : undefined

        const searchFilters: HabitacionSearchFilters = { checkin, checkout }
        data = await fetchHabitacionesData(searchFilters)
        analyticsFilters = {
          destino: filters.destino,
          checkin,
          checkout,
          rooms: roomsSnapshot,
        }
      } else if (activeTab === 'paquetes') {
        const searchFilters: SearchFilters = { ...filters }
        data = await fetchRealData(searchFilters)
        analyticsFilters = {
          ...searchFilters,
          rooms: roomsSnapshot,
        }
      } else if (activeTab === 'paseos') {
        const params = new URLSearchParams()
        const mes = searchParams.get('mes') || undefined
        const adultos = searchParams.get('adultos') || undefined
        const criancas = searchParams.get('criancas') || undefined
        if (mes) params.set('mes', mes)
        if (adultos) params.set('adultos', adultos)
        if (criancas) params.set('criancas', criancas)

        const response = await fetch(`/api/sugerir-passeios?${params.toString()}`)
        if (!response.ok) {
          throw new Error('Falha ao buscar passeios')
        }
        data = await response.json()
        analyticsFilters = {
          mes,
          adultos,
          criancas,
        }
      }

      log.debug('📊 Dados recebidos:', {
        tipo: activeTab,
        totalItems: data.length,
        tiposQuartoDisponiveis: [...new Set(data.map((item: any) => item.tipo_quarto))],
        capacidadesDisponiveis: [...new Set(data.map((item: any) => item.capacidade))],
        sampleItems: data.slice(0, 5).map((item: any) => ({
          id: item.id,
          slug_hospedagem: item.slug_hospedagem,
          tipo_quarto: item.tipo_quarto,
          capacidade: item.capacidade,
          valor_diaria: item.valor_diaria,
        })),
      })

      setDisponibilidades(data)

      const sanitizedFilters = Object.fromEntries(
        Object.entries(analyticsFilters).filter(([, value]) =>
          value !== undefined && value !== null && value !== ''
        )
      )

      await recordSearchEvent({
        categoria: categoriaAnalytics,
        filters: sanitizedFilters,
        resultCount: Array.isArray(data) ? data.length : 0,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [activeTab, filters, log, parseRoomsFromURL, searchParams]);

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
  }, [disponibilidades, comodidadesCache, distanciaPraiaCache])

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
    const totalAdultosPagantes = pessoas.adultos + pessoas.criancas_6_mais;
    let criancas0a5Pagam = 0;
    if (pessoas.criancas_0_3 > 0) {
      criancas0a5Pagam = Math.max(0, pessoas.criancas_0_3 - 1);
    }
    const precoAdultos = dadosValidados.preco_adulto * totalAdultosPagantes
    const precoCriancas03 = dadosValidados.preco_crianca_0_3 * criancas0a5Pagam
    const precoCriancas45 = dadosValidados.preco_crianca_4_5 * pessoas.criancas_4_5
    const total = precoAdultos + precoCriancas03 + precoCriancas45
    return isNaN(total) ? 0 : total
  }
  
  const verificarCapacidadeQuartos = (disponibilidade: any, quartos: Room[]): boolean => {
    const totalPessoas = quartos.reduce((total, room) =>
      total + room.adults + room.children0to3 + room.children4to5 + room.children6plus, 0
    )
    return disponibilidade.capacidade >= totalPessoas
  }

  const filtrarResultados = useCallback((items: any[], quartos: Room[]) => {
    if (!items || !Array.isArray(items) || items.length === 0) return []
    const itemsFiltrados = activeTab === 'habitaciones' ? items : items.filter(() => true)

    if (activeTab === 'paquetes') {
      const dataBusca = searchParams.get("data")
      const pacotesNaData = !dataBusca ? itemsFiltrados : itemsFiltrados.filter(p => p.data_saida === dataBusca)
      const tipoPorCapacidade = (cap: number): string => {
        if (cap === 1) return 'Single'
        if (cap === 2) return 'Doble'
        if (cap === 3) return 'Triple'
        if (cap === 4) return 'Cuádruple'
        if (cap === 5) return 'Quíntuple'
        return 'Familiar'
      }
      const quartosSolicitados = getQuartosIndividuais()
      const porHotel = new Map<string, any[]>()
      pacotesNaData.forEach(p => {
        const hotel = p.hotel
        if (!porHotel.has(hotel)) porHotel.set(hotel, [])
        porHotel.get(hotel)!.push(p)
      })
      const resultadosCompostos: any[] = []
      for (const [hotel, registros] of porHotel.entries()) {
        const linhasSelecionadas: any[] = []
        let hotelValido = true
        for (const quarto of quartosSolicitados) {
          const transporteHotelTmp = (registros[0]?.transporte) || 'Bus'
          const adultUnitTmp = Number(registros[0]?.preco_adulto) || 0
          const baseCalc = computePackageBaseTotal(
            transporteHotelTmp,
            adultUnitTmp,
            {
              adultos: (quarto.adults || 0) + (quarto.children6plus || 0),
              criancas_0_3: quarto.children0to3 || 0,
              criancas_4_5: quarto.children4to5 || 0,
              criancas_6_mais: 0,
            }
          )
          const adultosEquivalentes = baseCalc.breakdown.adultosCobrados
          let linha = registros.find(r => Number(r.capacidade) === adultosEquivalentes)
          if (!linha && registros.some(r => r.quarto_tipo)) {
            const tipoNecessario = tipoPorCapacidade(adultosEquivalentes)
            linha = registros.find(r => (r.quarto_tipo || '').toLowerCase().includes(tipoNecessario.toLowerCase()))
          }
          if (!linha) {
            hotelValido = false
            break
          }
          const unitAdultRaw = transporteHotelTmp === 'Aéreo'
            ? (Number(linha?.preco_adulto_aereo ?? linha?.preco_adulto) || 0)
            : (Number(linha?.preco_adulto) || 0)
          linhasSelecionadas.push({
            linha,
            quarto,
            adultosEquivalentes,
            subtotalBase: baseCalc.totalBaseUSD,
            unitPrice: unitAdultRaw,
          })
        }
        if (!hotelValido || linhasSelecionadas.length === 0) continue
        let totalHotel = 0
        const transporteHotel = (linhasSelecionadas[0]?.linha?.transporte) || 'Bus'
        linhasSelecionadas.forEach(({ subtotalBase }) => {
          totalHotel += Number(subtotalBase) || 0
        })
        const finalHotel = totalHotel
        const base = { ...linhasSelecionadas[0].linha }
        base.__linhas_compostas = linhasSelecionadas.map(({ linha, quarto, adultosEquivalentes, subtotalBase, unitPrice }: any) => {
          const adultUnit = unitPrice || 0
          return {
            quarto_tipo: tipoPorCapacidade(adultosEquivalentes),
            capacidade: adultosEquivalentes,
            preco_adulto: adultUnit,
            preco_crianca_0_3: transporteHotel === 'Aéreo' ? 160 : 50,
            preco_crianca_4_5: transporteHotel === 'Aéreo' ? 500 : 350,
            preco_crianca_6_mais: adultUnit,
            quarto,
            subtotal: subtotalBase,
            preco_adulto_original: Number(linha?.preco_adulto ?? adultUnit) || 0,
            preco_adulto_aereo: Number(linha?.preco_adulto_aereo ?? null),
            slug_pacote: linha?.slug_pacote ?? null,
            slug: linha?.slug ?? null,
            id: linha?.id,
          }
        })
        base.__total_composto_base = totalHotel
        base.__total_composto = finalHotel
        base.transporte = transporteHotel
        resultadosCompostos.push(base)
      }
      resultadosCompostos.sort((a, b) => (a.__total_composto || 0) - (b.__total_composto || 0))
      return resultadosCompostos
    }

    const quartosSolicitados: Room[] = getQuartosIndividuais()

    let expectedNights = 0
    if (activeTab === 'habitaciones') {
      const checkin = searchParams.get("checkin")
      const checkout = searchParams.get("checkout")
      if (checkin && checkout) {
        const d1 = new Date(checkin + "T00:00:00")
        const d2 = new Date(checkout + "T00:00:00")
        expectedNights = Math.max(1, Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24)))
      }
    }

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
      const linhasSelecionadas: any[] = []
      let valido = true
      for (const q of quartosSolicitados) {
        const calc = calcularPagantesHospedagem(
          q.adults,
          q.children0to3,
          q.children4to5,
          q.children6plus
        )
        let match: any = null
        porTipo.forEach((agg) => {
          if (match) return
          if (Number(agg.capacidade) === calc.totalPagantes) match = agg
        })
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

        if (activeTab === 'habitaciones' && expectedNights > 0 && (match.noites || 0) < expectedNights) {
           valido = false
           return
        }

        const noites = match.noites || 1
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
      const totalHotel = linhasSelecionadas.reduce((sum, it) => sum + (it.subtotal || 0), 0)
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
    resultadosCompostos.sort((a, b) => (a.__total_composto || 0) - (b.__total_composto || 0))
    return resultadosCompostos
  }, [activeTab, getQuartosIndividuais, searchParams])
  
  const quartosForRender = useMemo(() => parseRoomsFromURL(), [parseRoomsFromURL])
  const resultados = useMemo(
    () => filtrarResultados(disponibilidades, quartosForRender) || [],
    [disponibilidades, filtrarResultados, quartosForRender],
  )

  useEffect(() => {
    if (activeTab !== 'paquetes' || resultados.length === 0) {
      return
    }
    let cancelled = false
    const computePricing = async () => {
      const entries: Array<[string, { summary: PackagePricingSummary; roomsSignature: string }]> = []
      for (const disponibilidade of resultados) {
        const rooms = buildRoomsForDisponibilidade(disponibilidade)
        const roomsSignature = buildRoomsSignature(rooms)
        const key = buildResultKey(disponibilidade, rooms)
        const existing = pricingSummaries[key]
        if (existing && existing.roomsSignature === roomsSignature) {
          continue
        }
        const roomRequests = rooms.map((room, index) => {
          const composed = Array.isArray(disponibilidade.__linhas_compostas)
            ? disponibilidade.__linhas_compostas[index] || null
            : null
          const unitPrice = composed
            ? Number(composed.preco_adulto ?? composed.preco_adulto_original ?? disponibilidade.preco_adulto ?? 0)
            : Number(disponibilidade.preco_adulto ?? 0)
          return {
            precoAdultoUSD: unitPrice,
            pessoas: {
              adultos: (room.adults || 0) + (room.children6plus || 0),
              criancas_0_3: room.children0to3 || 0,
              criancas_4_5: room.children4to5 || 0,
              criancas_6_mais: 0,
            },
          }
        })
        try {
          const packageSlugContext =
            disponibilidade.slug_pacote ||
            disponibilidade.slug ||
            (Array.isArray(disponibilidade.__linhas_compostas)
              ? disponibilidade.__linhas_compostas[0]?.slug_pacote || disponibilidade.__linhas_compostas[0]?.slug
              : undefined)
          const hotelNameContext = disponibilidade.hotel || disponibilidade.slug_hospedagem
          const summary = await computePackagePricingSummary(disponibilidade.transporte, roomRequests, {
            destination: filters.destino || disponibilidade.destino,
            packageSlug: packageSlugContext || undefined,
            hotelName: hotelNameContext || undefined,
            departureDate: disponibilidade.data_saida || undefined,
          })
          if (cancelled) return
          entries.push([key, { summary, roomsSignature }])
        } catch (err) {
          log.warn('⚠️ Falha ao calcular descontos do pacote', err)
        }
      }
      if (cancelled || entries.length === 0) {
        return
      }
      setPricingSummaries((prev) => {
        const next = { ...prev }
        for (const [key, value] of entries) {
          next[key] = value
        }
        return next
      })
    }
    void computePricing()
    return () => {
      cancelled = true
    }
  }, [
    activeTab,
    buildResultKey,
    buildRoomsForDisponibilidade,
    buildRoomsSignature,
    filters.destino,
    log,
    pricingSummaries,
    resultados,
  ])

  const formatPrice = (price: number) => {
    const validPrice = Number(price) || 0;
    if (isNaN(validPrice)) return 'USD 0';
    return `USD ${Math.round(validPrice).toLocaleString('es-AR')}`;
  }

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
  
  const gerarUrlDetalhes = (
    disponibilidade: any,
    precoCalculado?: number,
    hotelName?: string,
    precoOriginal?: number,
  ) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('hotel', hotelName || disponibilidade.slug_hospedagem || disponibilidade.hotel)
    const basePrice = precoCalculado || 0
    params.set('preco', basePrice.toString())
    
    if (activeTab === 'paquetes') {
      if (Array.isArray(disponibilidade.__linhas_compostas)) {
        params.set('rooms_breakdown', JSON.stringify(disponibilidade.__linhas_compostas))
      } else {
        const dadosValidados = validarDadosPreco(disponibilidade);
        params.set('preco_adulto', dadosValidados.preco_adulto.toString());
      }
      if (disponibilidade.transporte) params.set('transporte', disponibilidade.transporte)
      if (disponibilidade.__total_composto_base != null) {
        params.set('preco_base_total', String(disponibilidade.__total_composto_base))
      }
      if (precoOriginal != null) {
        params.set('preco_original', String(Math.round(precoOriginal)))
      }
      if (disponibilidade.noites_hotel) params.set('noites_hotel', disponibilidade.noites_hotel.toString())
      if (disponibilidade.dias_totais) params.set('dias_totais', disponibilidade.dias_totais.toString())
      if (disponibilidade.dias_viagem) params.set('dias_viagem', disponibilidade.dias_viagem.toString())
      if (disponibilidade.slug_pacote) params.set('slug_pacote', disponibilidade.slug_pacote)
      if (disponibilidade.slug) params.set('slug', disponibilidade.slug)
    } else {
      // Para hospedagem, o valor diária deve ser a média para bater com o total
      // Se temos checkin/checkout, calculamos as noites.
      let nights = 1;
      const checkin = searchParams.get("checkin");
      const checkout = searchParams.get("checkout");
      if (checkin && checkout) {
         nights = Math.max(1, Math.ceil((new Date(checkout + "T00:00:00").getTime() - new Date(checkin + "T00:00:00").getTime()) / (1000 * 3600 * 24)))
      } else if (disponibilidade.noites) {
         nights = disponibilidade.noites
      }
      
      const avgDailyRate = basePrice / nights;
      params.set('valor_diaria', avgDailyRate.toString());
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
    params.set('rooms_config', JSON.stringify(roomsConfig))
    const url = activeTab === 'habitaciones' ? '/detalhes-hospedagem' : '/detalhes';
    return `${url}?${params.toString()}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20">
          <div className="bg-gray-100 border-b">
            <div className="container mx-auto px-4 lg:px-[70px] py-6 space-y-4">
              <div className="flex justify-center">
                <div className="h-11 w-full max-w-md rounded-2xl bg-white/70 border border-white/60 animate-pulse" />
              </div>
              <div className="h-32 rounded-2xl bg-white/70 border border-white/60 animate-pulse" />
            </div>
          </div>
          <div className="container mx-auto px-4 lg:px-[70px] py-8">
            <ResultsSkeleton viewMode={viewMode} />
          </div>
        </div>
        <Footer />
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
          <FadeIn className="container mx-auto px-4 lg:px-[70px] py-6">
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
                  Hospedajes
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
          </FadeIn>
        </div>

        <div className="container mx-auto px-4 lg:px-[70px] py-8">
          {(() => {
            if (activeTab === 'paseos') {
              if (loading) return <p>Carregando passeios...</p>
              if (error) return <p>Erro ao carregar passeios: {error}</p>
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                  {(disponibilidades as Paseo[]).map((paseo) => (
                    <PaseoCard key={paseo.id} passeio={paseo} />
                  ))}
                </div>
              );
            }

            if (waitingForSearch) {
              return (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <Search className="w-10 h-10 text-orange-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    {activeTab === 'habitaciones' ? 'Encuentra tu alojamiento ideal' : 'Configura tu paquete'}
                  </h3>
                  <p className="text-slate-500 max-w-md mx-auto">
                    {activeTab === 'habitaciones' 
                      ? 'Selecciona las fechas de check-in y check-out para ver la disponibilidad.'
                      : 'Selecciona el transporte y la fecha de salida para ver las mejores opciones.'
                    }
                  </p>
                </div>
              )
            }

            if (error) {
              return (
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                  <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center">
                    <Info className="h-8 w-8 text-red-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Erro ao carregar resultados</h3>
                  <p className="max-w-md text-sm text-gray-600">{error}</p>
                  <Button onClick={() => loadData()} variant="outline">Tentar novamente</Button>
                </div>
              )
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
              <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                {(resultados || []).map((disponibilidade, index) => {
                  const quartosIndividuaisCard = parseRoomsFromURL();
                  const temMultiplosQuartosCard = quartosIndividuaisCard.length > 1;

                  const roomsForCard = buildRoomsForDisponibilidade(disponibilidade)
                  const roomsSignatureForCard = buildRoomsSignature(roomsForCard)
                  const pricingKey = buildResultKey(disponibilidade, roomsForCard)
                  const summaryEntry = pricingSummaries[pricingKey]
                  const pricingSummaryEntry =
                    summaryEntry && summaryEntry.roomsSignature === roomsSignatureForCard
                      ? summaryEntry.summary
                      : undefined

                  let finalPrice = 0
                  let originalTotal = 0
                  let discountTotal = 0
                  let installments = 1
                  let installmentValue = 0
                  
                  let nights = 1
                  if (activeTab === 'habitaciones') {
                     if (filters.dateRange?.from && filters.dateRange?.to) {
                        nights = Math.max(1, Math.ceil((filters.dateRange.to.getTime() - filters.dateRange.from.getTime()) / (1000 * 3600 * 24)))
                     } else if (disponibilidade.noites) {
                        nights = disponibilidade.noites
                     }
                  } else if (disponibilidade.noites_hotel) {
                     nights = disponibilidade.noites_hotel
                  }

                  if (activeTab === 'habitaciones') {
                    if (Array.isArray(disponibilidade.__linhas_compostas) && disponibilidade.__linhas_compostas.length > 0) {
                      finalPrice = Number(disponibilidade.__total_composto) || disponibilidade.__linhas_compostas.reduce((s: number, l: any) => s + (Number(l.subtotal) || 0), 0)
                    } else {
                      const adultos = quartosIndividuais.reduce((sum, q) => sum + q.adults, 0)
                      const criancas_0_3 = quartosIndividuais.reduce((sum, q) => sum + q.children0to3, 0)
                      const criancas_4_5 = quartosIndividuais.reduce((sum, q) => sum + q.children4to5, 0)
                      const criancas_6_mais = quartosIndividuais.reduce((sum, q) => sum + q.children6plus, 0)
                      const calculoPagantes = calcularPagantesHospedagem(adultos, criancas_0_3, criancas_4_5, criancas_6_mais)
                      const precoHospedagem = calcularPrecoHospedagem(
                        disponibilidade.valor_diaria || (disponibilidade.valor_total / (disponibilidade.noites || 1)) || 0,
                        nights,
                        calculoPagantes,
                      )
                      finalPrice = precoHospedagem.precoTotal
                    }
                    originalTotal = finalPrice
                  } else {
                    let baseTotalCalculado = 0
                    if (Array.isArray(disponibilidade.__linhas_compostas) && disponibilidade.__linhas_compostas.length > 0) {
                      baseTotalCalculado = disponibilidade.__linhas_compostas.reduce((sum: number, info: any) => {
                        const unitAdult = Number(info?.preco_adulto || 0)
                        const q = info?.quarto || {}
                        const calc = computePackageBaseTotal(disponibilidade.transporte, unitAdult, {
                          adultos: Number(q.adults || 0) + Number(q.children6plus || 0),
                          criancas_0_3: Number(q.children0to3 || 0),
                          criancas_4_5: Number(q.children4to5 || 0),
                          criancas_6_mais: 0,
                        })
                        return sum + calc.totalBaseUSD
                      }, 0)
                    } else {
                      const adultUnit = Number(disponibilidade.preco_adulto) || 0
                      const calc = computePackageBaseTotal(disponibilidade.transporte, adultUnit, {
                        adultos: pessoas.adultos + pessoas.criancas_6_mais,
                        criancas_0_3: pessoas.criancas_0_3,
                        criancas_4_5: pessoas.criancas_4_5,
                        criancas_6_mais: 0,
                      })
                      baseTotalCalculado = calc.totalBaseUSD
                    }

                    if (pricingSummaryEntry) {
                      finalPrice = pricingSummaryEntry.totalUSD
                      originalTotal = pricingSummaryEntry.originalUSD
                      discountTotal = Math.max(0, pricingSummaryEntry.discountUSD)
                    } else {
                      finalPrice = baseTotalCalculado
                      originalTotal = baseTotalCalculado
                      discountTotal = 0
                    }

                    const instData = calculateInstallments(finalPrice, disponibilidade.data_saida)
                    installments = instData.installments
                    installmentValue = instData.installmentValue
                  }

                  let displayPrice = finalPrice
                  let originalDisplayPrice = originalTotal

                  if (activeTab === 'habitaciones') {
                     displayPrice = finalPrice / nights
                     originalDisplayPrice = originalTotal / nights
                  }

                  if (activeTab === 'paquetes') {
                    const totalPeople = (pessoas.adultos || 0) + (pessoas.criancas_0_3 || 0) + (pessoas.criancas_4_5 || 0) + (pessoas.criancas_6_mais || 0)
                    const perPersonFinal = totalPeople > 0 ? finalPrice / totalPeople : finalPrice
                    const perPersonOriginal = totalPeople > 0 ? originalTotal / totalPeople : originalTotal
                    displayPrice = perPersonFinal
                    originalDisplayPrice = perPersonOriginal
                  }

                  const hasDiscount = activeTab === 'paquetes' && discountTotal > 0
                  const appliedRules = pricingSummaryEntry?.appliedRules ?? []
                  
                  const hotelIdentifier = disponibilidade.slug_hospedagem || disponibilidade.hotel;
                  const hotelData = getHotelData(hotelIdentifier);
                  const hotelNameForDisplay = hotelData?.displayName || hotelIdentifier?.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || "Hotel no encontrado";
                  const hotelImage = hotelData?.imageFiles?.[0] || "/placeholder.svg";

                  const amenidadesRaw = (hotelNameForDisplay && comodidadesCache[hotelNameForDisplay]) || [];
                  const maxComodidades = 4;
                  const amenidades = amenidadesRaw.slice(0, maxComodidades);
                  const hasMoreAmenidades = amenidadesRaw.length > maxComodidades;
                  const distanciaPraia = hotelNameForDisplay ? distanciaPraiaCache[hotelNameForDisplay] : undefined;

                  return (
                    <FadeIn key={disponibilidade.id} delay={index * 0.05}>
                      <div className="group bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-500 flex flex-col overflow-hidden h-full hover:-translate-y-1">
                        <div className="relative w-full h-64 overflow-hidden">
                          <Image
                            src={hotelImage}
                            alt={`Foto de ${hotelNameForDisplay}`}
                            layout="fill"
                            objectFit="cover"
                            priority={index < 4}
                            className="group-hover:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60"></div>
                          <div className="absolute bottom-3 left-3">
                             <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm border border-white/50">
                               {disponibilidade.tipo_quarto || gerarTextoTiposQuartos(disponibilidade)}
                             </div>
                          </div>
                        </div>

                        <div className="flex flex-col flex-1 p-5 md:p-6">
                          <div className="mb-4">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-xl md:text-2xl text-gray-900 leading-tight mb-1 group-hover:text-orange-600 transition-colors font-manrope">
                                  {hotelNameForDisplay}
                                </h3>
                            </div>
                            
                            <div className="flex items-center text-sm text-gray-500 gap-2">
                              <MapPin className="w-4 h-4 text-orange-600 flex-shrink-0" strokeWidth={1.5} />
                              <span className="truncate font-medium">{filters.destino || 'Canasvieiras'}</span>
                              {distanciaPraia != null && (
                                <>
                                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                  <span className="truncate">{distanciaPraia}m de la Playa</span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-6">
                            {amenidades.map((amenidade: any, idx: number) => {
                              const IconComponent = iconComponents[amenidade.icon] || Circle;
                              return (
                                <div key={idx} className="flex items-center gap-1.5 bg-gray-50/80 px-3 py-1.5 rounded-full border border-gray-100 hover:bg-orange-50 hover:border-orange-100 transition-colors group/icon">
                                  <IconComponent className="w-3.5 h-3.5 text-gray-500 group-hover/icon:text-orange-500 transition-colors" strokeWidth={1.5} />
                                  <span className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">{amenidade.label}</span>
                                </div>
                              )
                            })}
                             {hasMoreAmenidades && (
                                <div className="flex items-center justify-center bg-gray-50 px-2 rounded-full border border-gray-100 text-[10px] font-bold text-gray-500">
                                  +{amenidadesRaw.length - maxComodidades}
                                </div>
                              )}
                          </div>

                          <div className="grid grid-cols-2 gap-3 mb-5">
                             <div className="bg-slate-100 rounded-2xl p-3 flex flex-col items-start justify-center hover:bg-orange-50 transition-colors border border-transparent hover:border-orange-100">
                                <div className="flex items-center gap-1.5 text-slate-600 mb-1">
                                   {activeTab === 'habitaciones' ? (
                                      <CalendarCheck className="w-4 h-4 text-orange-600" strokeWidth={1.5} />
                                   ) : (
                                      <CalendarIcon className="w-4 h-4 text-orange-600" strokeWidth={1.5} />
                                   )}
                                   <span className="text-[11px] font-bold uppercase tracking-wider opacity-90">
                                      {activeTab === 'habitaciones' ? 'Check-in' : 'Salida'}
                                   </span>
                                </div>
                                <span className="text-sm font-bold text-slate-900 capitalize tracking-tight">
                                   {activeTab === 'habitaciones' 
                                      ? (filters.dateRange?.from ? formatDate(filters.dateRange.from.toISOString().split('T')[0]) : '-')
                                      : formatDate(disponibilidade.data_saida)
                                   }
                                </span>
                             </div>

                             <div className="bg-slate-100 rounded-2xl p-3 flex flex-col items-start justify-center hover:bg-orange-50 transition-colors border border-transparent hover:border-orange-100">
                                <div className="flex items-center gap-1.5 text-slate-600 mb-1">
                                   <Clock className="w-4 h-4 text-orange-600" strokeWidth={1.5} />
                                   <span className="text-[11px] font-bold uppercase tracking-wider opacity-90">
                                      {activeTab === 'habitaciones' ? 'Estadía' : 'Duración'}
                                   </span>
                                </div>
                                <span className="text-sm font-bold text-slate-900 capitalize tracking-tight">
                                   {activeTab === 'habitaciones' 
                                      ? (filters.dateRange?.to && filters.dateRange.from 
                                          ? `${Math.round((filters.dateRange.to.getTime() - filters.dateRange.from.getTime()) / (1000 * 60 * 60 * 24))} Noches` 
                                          : '-')
                                      : `${disponibilidade.noites_hotel || 7} Noches`
                                   }
                                </span>
                             </div>

                             <div className="bg-slate-100 rounded-2xl p-3 flex flex-col items-start justify-center hover:bg-orange-50 transition-colors border border-transparent hover:border-orange-100">
                                <div className="flex items-center gap-1.5 text-slate-600 mb-1">
                                   {activeTab === 'habitaciones' 
                                      ? <Hotel className="w-4 h-4 text-orange-600" strokeWidth={1.5} /> 
                                      : (disponibilidade.transporte === 'Aéreo' ? <Plane className="w-4 h-4 text-orange-600" strokeWidth={1.5} /> : <Bus className="w-4 h-4 text-orange-600" strokeWidth={1.5} />)
                                   }
                                   <span className="text-[11px] font-bold uppercase tracking-wider opacity-90">
                                      {activeTab === 'habitaciones' ? 'Categoría' : 'Paquete'}
                                   </span>
                                </div>
                                <span className="text-sm font-bold text-slate-900 truncate w-full capitalize tracking-tight">
                                   {activeTab === 'habitaciones' ? 'Alojamiento' : `${disponibilidade.transporte}`}
                                </span>
                             </div>

                             <div className="bg-slate-100 rounded-2xl p-3 flex flex-col items-start justify-center hover:bg-orange-50 transition-colors border border-transparent hover:border-orange-100">
                                <div className="flex items-center gap-1.5 text-slate-600 mb-1">
                                   <Users className="w-4 h-4 text-orange-600" strokeWidth={1.5} />
                                   <span className="text-[11px] font-bold uppercase tracking-wider opacity-90">
                                      {activeTab === 'habitaciones' ? 'Huéspedes' : 'Pasajeros'}
                                   </span>
                                </div>
                                <span className="text-sm font-bold text-slate-900 truncate w-full capitalize tracking-tight">
                                   {formatPessoas(pessoas)}
                                </span>
                             </div>
                          </div>

                          {temMultiplosQuartosCard && (
                            <div className="mb-4 px-1 pl-2 border-l-2 border-orange-200">
                              <div className="space-y-1">
                                {quartosIndividuaisCard.map((q, idx) => (
                                  <div key={idx} className="flex items-center text-xs text-gray-500 font-medium">
                                    <span className="mr-1 text-gray-400">Cuarto {idx + 1}:</span>
                                    <span>{formatRoomPeople(q)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex-1"></div>
                          <div className="border-t border-gray-100 my-4"></div>

                          <div className="flex items-end justify-between gap-4 mt-2">
                             <div className="flex flex-col">
                                {hasDiscount && (
                                   <span className="text-xs text-gray-400 line-through font-medium mb-0.5">
                                      {formatPrice(originalDisplayPrice)}
                                   </span>
                                )}
                                
                                <div className="flex items-baseline gap-1">
                                   <span className="text-xs font-bold text-gray-400 mb-1 self-start mt-1">USD</span>
                                   <span className="text-4xl font-extrabold text-slate-900 tracking-tighter leading-none">
                                      {activeTab === 'habitaciones'
                                         ? Math.round(displayPrice).toLocaleString('pt-BR')
                                         : Math.round(displayPrice).toLocaleString('es-AR')
                                      }
                                   </span>
                                </div>
                                
                                <span className="text-xs text-gray-600 font-medium">
                                   {activeTab === 'habitaciones' ? 'por noche' : 'por persona'}
                                </span>

                                {installments > 1 && activeTab === 'paquetes' && (
                                   <span className="text-[11px] font-bold text-green-700 mt-1 bg-green-100 px-2 py-0.5 rounded-md w-fit border border-green-200">
                                      hasta {installments}x de {formatPrice(installmentValue)}
                                   </span>
                                )}
                             </div>

                             <Link href={gerarUrlDetalhes(disponibilidade, finalPrice, hotelNameForDisplay, originalTotal)} prefetch passHref className="w-auto">
                                <Button className="group relative bg-orange-600 hover:bg-orange-700 text-white rounded-full px-6 h-12 font-bold shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
                                   <span className="relative z-10 flex items-center">
                                     Ver detalles <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
                                   </span>
                                </Button>
                             </Link>
                          </div>
                        </div>
                      </div>
                    </FadeIn>
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
"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
  Search,
  MapPin,
  CalendarIcon,
  Users,
  Plane,
  Bus,
  Bed,
  Minus,
  Plus,
  ChevronDown,
  Trash2,
  Brain,
  Sparkles,
  ArrowRight,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useRouter } from "next/navigation"
import { useCidadesSaida, useDestinos, useDatasDisponiveis, useTransportesDisponiveis } from "@/hooks/use-packages"
import { useSmartFilter } from "@/hooks/use-smart-filter"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

// Dados de fallback para quando o Supabase não estiver configurado
const ENABLE_FALLBACK = (process.env.NEXT_PUBLIC_ENABLE_FALLBACK || '').toLowerCase() === 'true'
const FALLBACK_CITIES = [
  // ✅ CIDADES ARGENTINAS ATUALIZADAS (conforme Supabase)
  { id: 1, cidade: "Buenos Aires", provincia: "Buenos Aires", pais: "Argentina", transporte: "Bus" },
  { id: 2, cidade: "Lanús", provincia: "Buenos Aires", pais: "Argentina", transporte: "Bus" },
  { id: 3, cidade: "La Plata", provincia: "Buenos Aires", pais: "Argentina", transporte: "Bus" },
  { id: 4, cidade: "Lomas de Zamora", provincia: "Buenos Aires", pais: "Argentina", transporte: "Bus" },
  { id: 20, cidade: "Buenos Aires", provincia: "Buenos Aires", pais: "Argentina", transporte: "Aéreo" },
  { id: 21, cidade: "Córdoba", provincia: "Córdoba", pais: "Argentina", transporte: "Aéreo" },
  { id: 22, cidade: "Rosario", provincia: "Santa Fe", pais: "Argentina", transporte: "Aéreo" }
]

const FALLBACK_DESTINATIONS = [
  { id: 1, destino: "Canasvieiras" },
  { id: 2, destino: "Bombinhas" },
  { id: 3, destino: "Balneário Camboriú" }
]

const FALLBACK_TRANSPORTS = [
  { id: 1, transporte: "Bus" },
  { id: 2, transporte: "Aéreo" }
]

interface Room {
  id: string
  adults: number
  children_0_3: number
  children_4_5: number
  children_6: number
}

interface SearchFilters {
  salida: string
  destino: string
  data: Date | undefined
  rooms: Room[]
  transporte: string
}

interface UnifiedSearchFilterProps {
  variant?: "homepage" | "results"
  initialFilters?: Partial<SearchFilters>
  onSearch?: (filters: SearchFilters) => void
}

// Função para capitalizar apenas a primeira letra de cada palavra
const capitalizeWords = (str: string): string => {
  return str.toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
}

// Helper para normalizar transporte (remove todos os acentos → 'aereo' | 'bus')
const normalizeTransport = (t?: string): string => {
  return (t || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

// Helper para normalizar texto (comparar destinos com ou sem acento)
const normalizeText = (s?: string): string => {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

export function UnifiedSearchFilter({ 
  variant = "homepage", 
  initialFilters,
  onSearch 
}: UnifiedSearchFilterProps) {
  const router = useRouter()
  const isInitialMount = useRef(true);
  const prevTransportRef = useRef<string | undefined>(undefined)
  const isInitializedRef = useRef(false); // ✅ NOVO: Controle de inicialização
  
  // ✅ MELHORADO: Função para definir data padrão baseada no destino + transporte
  const getSmartDefaultDate = (
    destino: string = "", 
    transporte: string = "", 
    primeiraDataDisponivel?: string
  ): Date => {
    // Se temos a primeira data disponível real, usar ela
    if (primeiraDataDisponivel) {
      return new Date(primeiraDataDisponivel + 'T00:00:00')
    }
    
    // ✅ LÓGICA INTELIGENTE baseada em transporte + destino
    if (transporte === "Aéreo") {
      // Aéreo sempre Janeiro
      return new Date(2026, 0, 8) // 08 de Janeiro 2026
    } else if (transporte === "Bus" || transporte === "Bús") {
      const nd = normalizeText(destino)
      const isJanDest = nd === 'bombinhas' || (nd.includes('balneario') && nd.includes('camboriu'))
      if (isJanDest) {
        // Bús + Bombinhas/Balneário Camboriú = Janeiro
        return new Date(2026, 0, 4) // 04 de Janeiro 2026
      } else {
        // Bús + outros destinos = Outubro
        return new Date(2025, 9, 19) // 19 de Outubro 2025
      }
    }
    
    // Fallback padrão
    return new Date(2025, 9, 19) // 19 de Outubro 2025
  }

  // Data padrão: Hoje (Mês Atual)
  const defaultDate = new Date()

  // Estado local para filtros
  const [filters, setFilters] = useState<SearchFilters>(() => {
    const initialState = {
      salida: initialFilters?.salida || "",
      destino: initialFilters?.destino || "",
      transporte: initialFilters?.transporte || "",
      // ✅ CORREÇÃO: Usar data inteligente apenas se vier da URL, senão undefined (para obrigar seleção) ou hoje
      data: initialFilters?.data || undefined,
      rooms: initialFilters?.rooms || [{ id: "1", adults: 2, children_0_3: 0, children_4_5: 0, children_6: 0 }]
    }
    return initialState
  })

  // Hooks do Supabase com fallback
  const { cidades: supabaseCidades, loading: loadingCidades, error: errorCidades } = useCidadesSaida(filters.transporte)
  const { destinos: supabaseDestinos, loading: loadingDestinos, error: errorDestinos } = useDestinos()
  const { transportes: supabaseTransportes, loading: loadingTransportes, error: errorTransportes } = useTransportesDisponiveis()
  
  // Hook do Smart Filter
  const { executeSmartFilter, loading: loadingSmartFilter, results: smartResults } = useSmartFilter()
  
  // Hook para buscar datas disponíveis
  const { datas: datasDisponiveis, loading: loadingDatas } = useDatasDisponiveis(filters.destino, filters.transporte)
  


  // Usar dados de fallback se houver erro ou se estiver carregando por muito tempo
  const cidades = (ENABLE_FALLBACK && (errorCidades || supabaseCidades.length === 0)) ? FALLBACK_CITIES : supabaseCidades
  const destinos = useMemo(() => {
    const list = (ENABLE_FALLBACK && (errorDestinos || supabaseDestinos.length === 0))
      ? FALLBACK_DESTINATIONS 
      : supabaseDestinos.map((d: any) => typeof d === 'string' ? { id: Math.random(), destino: d } : { id: d.id || Math.random(), destino: d.destino || d })
    // Remover "Balneário Camboriú" quando o transporte selecionado for Aéreo
    const t = normalizeTransport(filters.transporte)
    if (t.startsWith('aer')) {
      return list.filter((d) => {
        const nd = normalizeText(typeof d === 'string' ? d : d.destino)
        // filtra qualquer variação com/sem acento/hífen/uppercase
        const isBalneario = nd.includes('balneario') && nd.includes('camboriu')
        return !isBalneario
      })
    }
    return list
  }, [errorDestinos, supabaseDestinos, filters.transporte])

  // Regra de negócio solicitada: "Balneário Camboriú" apenas para Bús
  const destinosFiltrados = destinos

  // Limpar destino automaticamente apenas na HOME (não em resultados)
  useEffect(() => {
    if (variant !== 'homepage') return
    if (!isInitializedRef.current) return
    if (!filters.destino) return
    const permitido = destinosFiltrados.some(d => normalizeText(d.destino) === normalizeText(filters.destino))
    if (!permitido) {
      setFilters(prev => ({ ...prev, destino: "" }))
    }
  }, [variant, destinosFiltrados, filters.destino])
  const transportes = (ENABLE_FALLBACK && (errorTransportes || supabaseTransportes.length === 0))
    ? FALLBACK_TRANSPORTS 
    : supabaseTransportes.map((t: any) => typeof t === 'string' ? { id: Math.random(), transporte: t } : { id: t.id || Math.random(), transporte: t.transporte || t })

  // ✅ SOLUÇÃO ELEGANTE: Inicialização controlada
  useEffect(() => {
    if (initialFilters && !isInitializedRef.current) {
      // ✅ Caso 1: Página de resultados com initialFilters
      isInitializedRef.current = true
      prevTransportRef.current = initialFilters.transporte || ""
      
      setFilters((prev: SearchFilters) => {
        const newState = {
          salida: initialFilters.salida || prev.salida,
          destino: initialFilters.destino || prev.destino,
          data: initialFilters.data ? new Date(initialFilters.data) : prev.data,
          rooms: initialFilters.rooms || prev.rooms,
          transporte: initialFilters.transporte || prev.transporte,
        }
        return newState
      })
    } else if (!initialFilters && !isInitializedRef.current) {
      // ✅ Caso 2: Homepage sem initialFilters
      isInitializedRef.current = true
      prevTransportRef.current = filters.transporte || ""
    }
  }, [initialFilters, filters.transporte])

  // Função para atualizar filtros
  const updateFilters = (updates: Partial<SearchFilters>) => {
    setFilters((prev: SearchFilters) => ({ ...prev, ...updates }))
  }

  // ✅ CORREÇÃO: Detectar mudança de TRANSPORTE + DESTINO e ajustar data automaticamente
  // 🎯 INTELIGENTE: Home ajusta sempre, Resultados ajusta apenas em mudanças manuais
  useEffect(() => {
    // ✅ SKIP se ainda não foi inicializado
    if (!isInitializedRef.current) {
      return
    }
    
    // ✅ SKIP se não temos transporte e destino válidos
    if (!filters.destino || !filters.transporte) {
      return
    }

    // ✅ CORREÇÃO: Na página de resultados, só ajustar em mudanças manuais
    if (variant === "results") {
      // Verificar se a combinação atual é diferente da inicial da URL
      const transporteInicial = initialFilters?.transporte || ""
      const destinoInicial = initialFilters?.destino || ""
      
      // Se não mudou nada desde a URL, não ajustar
      if (filters.transporte === transporteInicial && filters.destino === destinoInicial) {
        return // ← Preservar data da URL se não houve mudança manual
      }
      // Se chegou aqui, houve mudança manual → permitir ajuste
    }

    if (filters.data) {
      return
    }

    let novaData: Date | undefined = undefined
    
    // 🎯 REGRAS ESPECÍFICAS baseadas na combinação transporte + destino
    if (filters.transporte === "Aéreo") {
      // ✈️ AÉREO: Sempre Janeiro (independente do destino)
      if (datasDisponiveis.length > 0) {
        // Buscar a primeira data disponível em janeiro de qualquer ano recente (2026 ou 2025-12/2026-01 casos de virada)
        const primeiraDataAereo =
          datasDisponiveis.find(d => d.startsWith('2026-01')) ||
          datasDisponiveis.find(d => d.startsWith('2025-12')) ||
          datasDisponiveis[0]
        if (primeiraDataAereo) {
          novaData = new Date(primeiraDataAereo + 'T00:00:00')
        }
      } else {
        // ✅ FALLBACK: Usar data padrão enquanto carrega
        novaData = new Date(2026, 0, 8) // 08 de Janeiro 2026
      }
    } else if (filters.transporte === "Bus" || filters.transporte === "Bús") {
      // 🚌 ÔNIBUS: Depende do destino
      const nd = normalizeText(filters.destino)
      const isBalneario = nd.includes('balneario') && nd.includes('camboriu')
      const isBombinhas = nd === 'bombinhas'
      if (isBalneario || isBombinhas) {
        // Bús + Balneário Camboriú/Bombinhas = Janeiro
        if (datasDisponiveis.length > 0) {
          const dataBombinhas = datasDisponiveis.find(data => data.startsWith('2026-01'))
          if (dataBombinhas) {
            novaData = new Date(dataBombinhas + 'T00:00:00')
          }
        } else {
          // ✅ FALLBACK: Usar data padrão enquanto carrega
          novaData = new Date(2026, 0, 4) // 04 de Janeiro 2026
        }
      } else {
        // Bús + outros destinos = 19 de Outubro  
        if (datasDisponiveis.length > 0) {
          const dataOnibus = '2025-10-19'
          if (datasDisponiveis.includes(dataOnibus)) {
            novaData = new Date(dataOnibus + 'T00:00:00')
          }
        } else {
          // ✅ FALLBACK: Usar data padrão enquanto carrega
          novaData = new Date(2025, 9, 19) // 19 de Outubro 2025
        }
      }
    }
    
    // Aplicar mudança apenas se encontrou uma data específica E é diferente da atual
    if (novaData && filters.data && format(filters.data, 'yyyy-MM-dd') !== format(novaData, 'yyyy-MM-dd')) {
      setFilters(prev => ({ ...prev, data: novaData }))
    }
  }, [filters.data, filters.destino, filters.transporte, datasDisponiveis, loadingDatas, variant, initialFilters])

  // ✅ CORREÇÃO: Filtros condicionais - transporte filtra cidades disponíveis
  const cidadesDisponiveis = useMemo(() => {
    if (!filters.transporte) return []
    const tNorm = normalizeTransport(filters.transporte)
    const lista = cidades.filter(cidade => normalizeTransport(cidade.transporte) === tNorm)

    // ✅ REMOVIDO: Não adicionar cidade anterior que não pertence ao transporte
    // A cidade selecionada deve ser resetada quando o transporte muda
    return lista
  }, [cidades, filters.transporte])

  // ✅ NOVO: Agrupar cidades por província
  const groupedCities = useMemo(() => {
    if (!cidadesDisponiveis) return {}

    return cidadesDisponiveis.reduce((acc, cidade) => {
      const { provincia } = cidade
      if (!acc[provincia]) {
        acc[provincia] = []
      }
      acc[provincia].push(cidade)
      return acc
    }, {} as Record<string, typeof cidadesDisponiveis>)
  }, [cidadesDisponiveis])

  // ✅ SOLUÇÃO ELEGANTE: Reset de salida apenas em mudanças reais (não na inicialização)
  useEffect(() => {
    
    // Pular completamente durante a inicialização
    if (!isInitializedRef.current) {
      return
    }

    // Verificar se houve mudança real no transporte
    if (prevTransportRef.current === undefined) {
      prevTransportRef.current = filters.transporte
      return
    }

    if (prevTransportRef.current !== filters.transporte) {
      prevTransportRef.current = filters.transporte
      setFilters(prev => ({ ...prev, salida: "" }))
    }
  }, [filters.transporte])

  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [isRoomsOpen, setIsRoomsOpen] = useState(false)
  const [smartLoading, setSmartLoading] = useState(false)

  // ✅ ATUALIZADO: Função para desabilitar datas baseada nas datas disponíveis
  const isDateDisabled = (date: Date): boolean => {
    // Formatar a data para comparação
    const dateStr = format(date, 'yyyy-MM-dd')
    
    // SEMPRE permitir a data padrão (19 de outubro 2025)
    if (dateStr === '2025-10-19') {
      return false
    }
    
    // Se não temos datas disponíveis ainda, permitir apenas a data padrão
    if (!datasDisponiveis || datasDisponiveis.length === 0) {
      return true
    }
    
    // Habilitar apenas as datas que existem nas disponibilidades
    return !datasDisponiveis.includes(dateStr)
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // ✅ CORRIGIDO: Usar a data selecionada diretamente, sem ajuste forçado
      setFilters(prev => ({ ...prev, data: date }))
    } else {
      setFilters(prev => ({ ...prev, data: undefined }))
    }
    setIsCalendarOpen(false)
  }

  const addRoom = () => {
    const newRoom: Room = {
      id: Date.now().toString(),
      adults: 2,
      children_0_3: 0,
      children_4_5: 0,
      children_6: 0,
    }
    setFilters(prev => ({ ...prev, rooms: [...prev.rooms, newRoom] }))
  }

  const removeRoom = (roomId: string) => {
    if (filters.rooms.length > 1) {
      setFilters(prev => ({ ...prev, rooms: prev.rooms.filter(room => room.id !== roomId) }))
    }
  }

  // ✅ NOVO: Função para verificar limite de 5 pessoas por quarto
  const getRoomTotalPeople = (room: Room): number => {
    return room.adults + room.children_0_3 + room.children_4_5 + room.children_6
  }

  // ✅ MODIFICADO: Função updateRoom com validação de limite
  const updateRoom = (roomId: string, field: keyof Omit<Room, 'id'>, value: number) => {
    setFilters((prev: SearchFilters) => ({
      ...prev,
      rooms: prev.rooms.map(room => 
        room.id === roomId ? { ...room, [field]: value } : room
      )
    }))
  }

  const getTotalPeople = () => {
    // Para Aéreo, as faixas serão 0-2, 2-5 e 6+, mas a UI ainda usa 0-3/4-5/6.
    // Mantemos a soma genérica; o mapeamento por faixa é feito no cálculo.
    return filters.rooms.reduce((total, room) => 
      total + room.adults + room.children_0_3 + room.children_4_5 + room.children_6, 0
    )
  }

  const handleSmartFilter = async () => {
    if (!isFormValid) return
    
    setSmartLoading(true)
    
    try {
      // Converter Room[] para RoomConfig[]
      const roomsConfig = filters.rooms.map(room => ({
        adults: room.adults,
        children_0_3: room.children_0_3,
        children_4_5: room.children_4_5,
        children_6: room.children_6
      }))
      
      const smartFilters = {
        destino: filters.destino,
        transporte: filters.transporte || 'Bus',
        data_saida: format(filters.data!, 'yyyy-MM-dd'),
        adultos: filters.rooms.reduce((sum, room) => sum + room.adults, 0).toString(),
        criancas_0_3: filters.rooms.reduce((sum, room) => sum + room.children_0_3, 0).toString(),
        criancas_4_5: filters.rooms.reduce((sum, room) => sum + room.children_4_5, 0).toString(),
        criancas_6: filters.rooms.reduce((sum, room) => sum + room.children_6, 0).toString(),
        quartos: filters.rooms.length.toString()
      }
      
      const result = await executeSmartFilter(smartFilters, roomsConfig)
      
      if (result.success && result.results && result.results.length > 0) {
        // Navegar com os resultados do Smart Filter
        const params = new URLSearchParams()
        
        params.set('categoria', 'paquete')
        params.set('destino', filters.destino)
        params.set('data', format(filters.data!, 'yyyy-MM-dd'))
        
        if (filters.salida) {
          params.set('salida', filters.salida)  // ✅ CORREÇÃO: usar 'salida' em vez de 'cidade_saida'
        }
        
        if (filters.transporte) {
          params.set('transporte', filters.transporte)
        }
        
        // Calcular pessoas totais
        const totalAdultos = filters.rooms.reduce((sum, room) => sum + room.adults, 0)
        const totalCriancas03 = filters.rooms.reduce((sum, room) => sum + room.children_0_3, 0)
        const totalCriancas45 = filters.rooms.reduce((sum, room) => sum + room.children_4_5, 0)
        const totalCriancas6 = filters.rooms.reduce((sum, room) => sum + room.children_6, 0)
        
        params.set('adultos', totalAdultos.toString())
        params.set('criancas_0_3', totalCriancas03.toString())
        params.set('criancas_4_5', totalCriancas45.toString())
        params.set('criancas_6', totalCriancas6.toString())
        params.set('quartos', filters.rooms.length.toString())

        // Adicionar configuração específica por quarto se múltiplos quartos
        if (filters.rooms.length > 1) {
          const roomsConfig = filters.rooms.map(room => ({
            adults: room.adults,
            children_0_3: room.children_0_3,
            children_4_5: room.children_4_5,
            children_6: room.children_6
          }))
          
          params.set('rooms_config', encodeURIComponent(JSON.stringify(roomsConfig)))
        }
        
        router.push(`/resultados?${params.toString()}`)
      } else {
        // Fazer busca normal como fallback
        handleNormalSearch()
      }
    } catch (error) {
      // Em caso de erro, fazer busca normal como fallback
      handleNormalSearch()
    } finally {
      setSmartLoading(false)
    }
  }

  const handleNormalSearch = () => {
    const params = new URLSearchParams()
    
    // Parâmetros básicos
    params.set('categoria', 'paquete')
    params.set('destino', filters.destino)
    params.set('data', format(filters.data!, 'yyyy-MM-dd'))
    
    if (filters.salida) {
      params.set('salida', filters.salida)
    }
    
    if (filters.transporte) {
      params.set('transporte', filters.transporte)
    }
    
    // Calcular pessoas totais
    const totalAdultos = filters.rooms.reduce((sum, room) => sum + room.adults, 0)
    const totalCriancas03 = filters.rooms.reduce((sum, room) => sum + room.children_0_3, 0)
    const totalCriancas45 = filters.rooms.reduce((sum, room) => sum + room.children_4_5, 0)
    const totalCriancas6 = filters.rooms.reduce((sum, room) => sum + room.children_6, 0)
    
    params.set('adultos', totalAdultos.toString())
    params.set('criancas_0_3', totalCriancas03.toString())
    params.set('criancas_4_5', totalCriancas45.toString())
    params.set('criancas_6', totalCriancas6.toString())
    params.set('quartos', filters.rooms.length.toString())

    // Adicionar configuração específica por quarto se múltiplos quartos
    if (filters.rooms.length > 1) {
      const roomsConfig = filters.rooms.map(room => ({
        adults: room.adults,
        children_0_3: room.children_0_3,
        children_4_5: room.children_4_5,
        children_6: room.children_6
      }))
      
      params.set('rooms_config', encodeURIComponent(JSON.stringify(roomsConfig)))
    }
    
    router.push(`/resultados?${params.toString()}`)
  }

  // Agora o handleSearch sempre usa Smart Filter
  const handleSearch = handleSmartFilter

  const isFormValid = filters.salida && filters.destino && filters.data

  // Styles for Inputs - Glassmorphism for Homepage
  const inputContainerClass = cn(
    "relative h-14 rounded-2xl border transition-all duration-300 group hover:shadow-md",
    variant === "homepage" 
      ? "bg-white/90 border-white/20 backdrop-blur-md focus-within:bg-white focus-within:border-[#FF6B35]/50 hover:bg-white/95" 
      : "bg-white border-slate-200 focus-within:border-[#FF6B35]/50 hover:border-slate-300"
  )

  const labelClass = cn(
    "absolute left-12 top-2 text-[10px] font-bold uppercase tracking-wider transition-colors z-10",
    variant === "homepage" ? "text-slate-500 group-hover:text-[#FF6B35]" : "text-slate-400 group-focus-within:text-[#FF6B35]"
  )

  const iconClass = cn(
    "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors z-10",
    variant === "homepage" ? "text-[#FF6B35]" : "text-slate-400 group-focus-within:text-[#FF6B35]"
  )

  const triggerClass = "w-full h-full pl-12 pr-4 pt-5 pb-1 bg-transparent border-0 ring-0 focus:ring-0 text-sm font-semibold text-slate-900 placeholder:text-slate-400"

  // ✅ ATUALIZADO: Função para determinar o mês inicial do calendário baseado nas datas disponíveis
  const getInitialCalendarMonth = (): Date => {
    // Se há uma data selecionada, abrir o calendário no mês dela
    if (filters.data) {
      return filters.data
    }
    
    // Se temos datas disponíveis, abrir no mês da primeira data
    if (datasDisponiveis.length > 0) {
      const primeiraData = new Date(datasDisponiveis[0] + 'T00:00:00')
      return primeiraData
    }
    
    // Fallback
    return new Date()
  }

  return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 lg:gap-4">
        {/* Transporte */}
        <div className={inputContainerClass}>
          <label className={labelClass}>Transporte</label>
          <div className="relative h-full">
            {!filters.transporte && <Bus className={iconClass} />}
            <Select value={filters.transporte} onValueChange={(value) => setFilters(prev => ({ ...prev, transporte: value }))}>
              <SelectTrigger className={triggerClass}>
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border border-slate-100/50 shadow-2xl p-1 min-w-[var(--radix-select-trigger-width)]">
                {transportes.map((transporte) => (
                  <SelectItem key={transporte.id} value={transporte.transporte} className="rounded-lg text-sm font-medium py-2 cursor-pointer focus:bg-orange-50 focus:text-orange-600">
                    <div className="flex items-center gap-2">
                      {transporte.transporte === "Bus" || transporte.transporte === "Bús" ? (
                        <Bus className="w-4 h-4 text-orange-500" />
                      ) : (
                        <Plane className="w-4 h-4 text-orange-500" />
                      )}
                      <span>{transporte.transporte}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Cidade de Saída */}
        <div className={inputContainerClass}>
          <label className={labelClass}>Embarque</label>
          <div className="relative h-full">
            {!filters.salida && <MapPin className={iconClass} />}
            <Select
              value={filters.salida}
              onValueChange={(value) => setFilters(prev => ({ ...prev, salida: value }))}
              disabled={!filters.transporte}
            >
              <SelectTrigger className={`${triggerClass} ${!filters.transporte ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent 
                className="rounded-xl border border-slate-100/50 shadow-2xl max-h-[300px] p-1 min-w-[var(--radix-select-trigger-width)]"
                position="popper"
                sideOffset={8}
              >
                <ScrollArea className="h-64">
                  {Object.entries(groupedCities).map(([provincia, cidades]) => (
                    <SelectGroup key={provincia}>
                      <SelectLabel className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 sticky top-0 backdrop-blur-sm z-10">{provincia}</SelectLabel>
                      {cidades.map((cidade) => (
                        <SelectItem key={cidade.id} value={cidade.cidade} className="rounded-lg pl-4 text-sm py-2 cursor-pointer focus:bg-orange-50 focus:text-orange-600">
                          {cidade.cidade}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Destino */}
        <div className={inputContainerClass}>
          <label className={labelClass}>Destino</label>
          <div className="relative h-full">
            {!filters.destino && <MapPin className={iconClass} />}
            <Select value={filters.destino} onValueChange={(value) => setFilters(prev => ({ ...prev, destino: value }))}>
              <SelectTrigger className={triggerClass}>
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border border-slate-100/50 shadow-2xl p-1 min-w-[var(--radix-select-trigger-width)]">
                {destinosFiltrados.map((destino) => (
                  <SelectItem key={destino.id} value={destino.destino} className="rounded-lg text-sm py-2 cursor-pointer focus:bg-orange-50 focus:text-orange-600">
                    {destino.destino}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Data */}
        <div className={inputContainerClass}>
          <label className={labelClass}>Fecha</label>
          <div className="relative h-full">
            {!filters.data && <CalendarIcon className={iconClass} />}
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <button className={`text-left ${triggerClass}`}>
                  <span className="truncate capitalize">
                    {filters.data ? format(filters.data, "d 'de' MMM", { locale: es }) : "Seleccionar"}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2 rounded-2xl border-0 shadow-2xl overflow-hidden bg-white" align="start" side="bottom" sideOffset={8} collisionPadding={10}>
                <div className="h-[350px] flex items-start justify-center pt-2">
                  <Calendar
                      mode="single"
                      selected={filters.data}
                      onSelect={handleDateSelect}
                      disabled={isDateDisabled}
                      defaultMonth={filters.data || new Date()}
                      locale={es}
                      weekStartsOn={0}
                      initialFocus
                      className="rounded-lg border-0"
                      modifiers={{
                        available: (date) => !isDateDisabled(date)
                      }}
                      modifiersStyles={{
                        available: {
                          color: '#EA580C',
                          fontWeight: 'bold',
                          backgroundColor: '#FFF7ED',
                          borderRadius: '100%'
                        }
                      }}
                    />
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Quartos e Pessoas */}
        <div className={inputContainerClass}>
          <label className={labelClass}>Viajeros</label>
          <div className="relative h-full">
            {!filters.rooms.length && <Users className={iconClass} />}
            <Popover open={isRoomsOpen} onOpenChange={setIsRoomsOpen}>
              <PopoverTrigger asChild>
                <button className={`text-left ${triggerClass} flex items-center gap-3`}>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-orange-500" />
                    <span>{getTotalPeople()}</span>
                  </div>
                  <div className="w-px h-4 bg-slate-200"></div>
                  <div className="flex items-center gap-1.5">
                    <Bed className="w-4 h-4 text-orange-500" />
                    <span>{filters.rooms.length}</span>
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-3 rounded-2xl border border-slate-100/50 shadow-2xl bg-white" align="end">
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h4 className="font-bold text-sm text-slate-800">Habitaciones y Pasajeros</h4>
                  </div>
                  
                  {filters.rooms.map((room, index) => {
                    const roomTotal = getRoomTotalPeople(room)
                    const isAtLimit = roomTotal >= 5
                    const isAereo = filters.transporte === 'Aéreo'
                    
                    return (
                    <div key={room.id} className="bg-slate-50/50 rounded-xl p-3 space-y-2 border border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Habitación {index + 1}</span>
                        {filters.rooms.length > 1 && (
                          <button onClick={() => removeRoom(room.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded-md transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-700">Adultos</span>
                          <div className="flex items-center gap-2">
                            <button onClick={() => updateRoom(room.id, 'adults', room.adults - 1)} disabled={room.adults <= 1} className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:border-orange-500 hover:text-orange-600 disabled:opacity-30 transition-colors shadow-sm">
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-4 text-center text-sm font-bold text-slate-900">{room.adults}</span>
                            <button onClick={() => updateRoom(room.id, 'adults', room.adults + 1)} disabled={isAtLimit} className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:border-orange-500 hover:text-orange-600 disabled:opacity-30 transition-colors shadow-sm">
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        
                        {[
                          { key: 'children_0_3', label: isAereo ? 'Bebés (0-2)' : 'Bebés (0-3)' },
                          { key: 'children_4_5', label: isAereo ? 'Niños (2-5)' : 'Niños (4-5)' },
                          { key: 'children_6', label: isAereo ? 'Niños (6+)' : 'Niños (6+)' }
                        ].map((field) => (
                          <div key={field.key} className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700">{field.label}</span>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => updateRoom(room.id, field.key as any, (room[field.key as keyof Room] as number) - 1)} 
                                disabled={(room[field.key as keyof Room] as number) <= 0} 
                                className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:border-orange-500 hover:text-orange-600 disabled:opacity-30 transition-colors shadow-sm"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-4 text-center text-sm font-bold text-slate-900">{(room[field.key as keyof Room] as number)}</span>
                              <button 
                                onClick={() => updateRoom(room.id, field.key as any, (room[field.key as keyof Room] as number) + 1)} 
                                disabled={isAtLimit} 
                                className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:border-orange-500 hover:text-orange-600 disabled:opacity-30 transition-colors shadow-sm"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    )
                  })}
                  
                  <button
                    onClick={addRoom}
                    className="w-full py-2.5 border border-dashed border-slate-300 rounded-xl text-xs font-bold uppercase tracking-wide text-slate-500 hover:text-orange-600 hover:border-orange-300 hover:bg-orange-50 transition-all"
                  >
                    + Agregar habitación
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Botão de Busca */}
        <div className="h-14">
          <button
            onClick={handleSearch}
            disabled={!isFormValid || smartLoading}
            className="btn-liquid-orange w-full h-full rounded-2xl flex items-center justify-center gap-2 group disabled:opacity-50 disabled:grayscale"
          >
            {smartLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span className="text-sm font-bold tracking-wide">BUSCANDO...</span>
              </>
            ) : (
              <>
                <span className="text-base font-bold tracking-wide uppercase">Buscar</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>

        {/* Indicador de dados de fallback */}
        {ENABLE_FALLBACK && (errorCidades || errorDestinos || errorTransportes) && variant === "homepage" && (
          <div className="col-span-1 md:col-span-2 lg:col-span-6 mt-2 p-3 bg-amber-50/80 backdrop-blur-sm border border-amber-200 rounded-xl flex items-center justify-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <p className="text-xs font-medium text-amber-800">
              Modo de demostración activo
            </p>
          </div>
        )}
    </div>
  )
}

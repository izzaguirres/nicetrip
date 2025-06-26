"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useRouter } from "next/navigation"
import { useCidadesSaida, useDestinos, useDatasDisponiveis, useTransportesDisponiveis } from "@/hooks/use-packages"
import { useSmartFilter } from "@/hooks/use-smart-filter"

// Dados de fallback para quando o Supabase não estiver configurado
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
  { id: 2, destino: "Bombinhas" }
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

export function UnifiedSearchFilter({ 
  variant = "homepage", 
  initialFilters,
  onSearch 
}: UnifiedSearchFilterProps) {
  const router = useRouter()
  
  // ✅ NOVO: Função para definir data padrão baseada no destino
  const getDefaultDateForDestino = (destino: string, primeiraDataDisponivel?: string): Date => {
    // Se temos a primeira data disponível real, usar ela
    if (primeiraDataDisponivel) {
      return new Date(primeiraDataDisponivel + 'T00:00:00')
    }
    
    // Fallback para quando não temos dados ainda
    if (destino === "Bombinhas") {
      // Para Bombinhas: janeiro 2026 (quando tem disponibilidade)
      return new Date(2026, 0, 4) // 04 de Janeiro 2026
    }
    // Para outros destinos: 19 de outubro 2025 (primeira data disponível)
    return new Date(2025, 9, 19) // 19 de Outubro 2025
  }

  // Data padrão: 19 de outubro 2025
  const defaultDate = new Date(2025, 9, 19) // 19 de Outubro 2025

  const [filters, setFilters] = useState<SearchFilters>({
    salida: initialFilters?.salida || "",
    destino: initialFilters?.destino || "Canasvieiras",
    data: initialFilters?.data || defaultDate,
    rooms: initialFilters?.rooms || [{ id: "1", adults: 2, children_0_3: 0, children_4_5: 0, children_6: 0 }],
    transporte: initialFilters?.transporte || "Bus",
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
  const cidades = errorCidades || supabaseCidades.length === 0 ? FALLBACK_CITIES : supabaseCidades
  const destinos = errorDestinos || supabaseDestinos.length === 0 
    ? FALLBACK_DESTINATIONS 
    : supabaseDestinos.map((d: any) => typeof d === 'string' ? { id: Math.random(), destino: d } : { id: d.id || Math.random(), destino: d.destino || d })
  const transportes = errorTransportes || supabaseTransportes.length === 0 
    ? FALLBACK_TRANSPORTS 
    : supabaseTransportes.map((t: any) => typeof t === 'string' ? { id: Math.random(), transporte: t } : { id: t.id || Math.random(), transporte: t.transporte || t })

  // Atualizar filtros quando initialFilters mudar (importante para página de resultados)
  useEffect(() => {
    if (initialFilters) {
      setFilters(prev => ({
        salida: initialFilters.salida || prev.salida,
        destino: initialFilters.destino || prev.destino,
        data: initialFilters.data || prev.data,
        rooms: initialFilters.rooms || prev.rooms,
        transporte: initialFilters.transporte || prev.transporte,
      }))
    }
  }, [initialFilters])

  // ✅ NOVO: Detectar mudança de destino/transporte e ajustar data automaticamente (PROTEGER DATA PADRÃO)
  useEffect(() => {
    if (datasDisponiveis.length > 0 && !loadingDatas && filters.data) {
      const dataAtual = format(filters.data, 'yyyy-MM-dd')
      
             // NUNCA mexer na data padrão (19 de outubro 2025)
       if (dataAtual === '2025-10-19') {
         return
       }
      
      // APENAS ajustar se a data atual NÃO está nas datas disponíveis (não forçar mudança na data padrão válida)
      if (!datasDisponiveis.includes(dataAtual)) {
        console.log(`📅 Data atual (${dataAtual}) não está disponível, ajustando para primeira disponível: ${datasDisponiveis[0]}`)
        const novaData = new Date(datasDisponiveis[0] + 'T00:00:00')
        setFilters(prev => ({ ...prev, data: novaData }))
      }
    }
  }, [datasDisponiveis, loadingDatas, filters.destino, filters.transporte])

  // ✅ NOVO: Filtros condicionais - transporte filtra cidades disponíveis
  const cidadesDisponiveis = useMemo(() => {
    if (!filters.transporte) return [] // Não mostrar cidades se não há transporte selecionado
    return cidades.filter(cidade => cidade.transporte === filters.transporte)
  }, [cidades, filters.transporte])

  // ✅ NOVO: Reset cidades quando muda transporte e auto-selecionar primeira cidade se não tem seleção
  useEffect(() => {
    if (filters.transporte) {
      const cidadeAtualDisponivel = cidadesDisponiveis.find(c => c.cidade === filters.salida)
      
      if (!cidadeAtualDisponivel && cidadesDisponiveis.length > 0) {
        // Se não tem cidade selecionada ou ela não é compatível, selecionar a primeira
        console.log('🔄 Auto-selecionando primeira cidade disponível para transporte:', filters.transporte)
        setFilters(prev => ({ ...prev, salida: cidadesDisponiveis[0].cidade }))
      }
    }
  }, [filters.transporte, cidadesDisponiveis])

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
    setFilters(prev => ({
      ...prev,
      rooms: prev.rooms.map(room => {
        if (room.id !== roomId) return room
        
        const newRoom = { ...room, [field]: Math.max(0, value) }
        const newTotal = getRoomTotalPeople(newRoom)
        
        // ✅ LIMITE: Não permitir mais de 5 pessoas por quarto
        if (newTotal > 5) {
          return room // Manter valor anterior se exceder limite
        }
        
        return newRoom
      })
    }))
  }

  const getTotalPeople = () => {
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
      
      console.log('🤖 Executando Smart Filter...', { smartFilters, roomsConfig })
      
      const result = await executeSmartFilter(smartFilters, roomsConfig)
      
      console.log('🔍 Resultado do Smart Filter:', result)
      
      if (result.success && result.results && result.results.length > 0) {
        // Navegar com os resultados do Smart Filter
        const bestResult = result.results[0]
        
        const params = new URLSearchParams()
        
        if (filters.salida) params.set('salida', filters.salida)
        if (filters.destino) params.set('destino', filters.destino)
        if (filters.data) params.set('data', format(filters.data, 'yyyy-MM-dd'))
        if (filters.transporte) params.set('transporte', filters.transporte)
        
        params.set('quartos', filters.rooms.length.toString())
        
        const totalAdultos = filters.rooms.reduce((sum, room) => sum + room.adults, 0)
        const totalCriancas03 = filters.rooms.reduce((sum, room) => sum + room.children_0_3, 0)
        const totalCriancas45 = filters.rooms.reduce((sum, room) => sum + room.children_4_5, 0)
        const totalCriancas6 = filters.rooms.reduce((sum, room) => sum + room.children_6, 0)
        
        params.set('adultos', totalAdultos.toString())
        params.set('criancas_0_3', totalCriancas03.toString())
        params.set('criancas_4_5', totalCriancas45.toString())
        params.set('criancas_6', totalCriancas6.toString())
        
        // Adicionar configuração específica dos quartos
        params.set('rooms_config', JSON.stringify(roomsConfig))
        
        // Adicionar informações do resultado inteligente
        params.set('smart_suggestion', 'true')
        params.set('suggested_hotel', bestResult.hotel)
        params.set('suggested_room_type', bestResult.quarto_tipo)
        params.set('suggested_price', bestResult.preco_por_pessoa.toString())
        params.set('suggested_justificativa', bestResult.justificativa || '')
        params.set('suggested_score', bestResult.score_otimizacao?.toString() || '95')
        
        console.log('✅ Smart Filter: Navegando com resultado otimizado')
        router.push(`/resultados?${params.toString()}`)
      } else {
        // ✅ SEMPRE fazer busca normal quando Smart Filter não retorna resultados
        console.log('⚠️ Smart Filter sem resultados específicos, fazendo busca normal com dados preservados')
        handleNormalSearch()
      }
    } catch (error) {
      console.error('❌ Erro no Smart Filter:', error)
      // Em caso de erro, fazer busca normal como fallback
      handleNormalSearch()
    } finally {
      setSmartLoading(false)
    }
  }

  const handleNormalSearch = () => {
    if (onSearch) {
      onSearch(filters)
    } else {
      // Navegar para página de resultados com parâmetros URL
      const params = new URLSearchParams()
      
      if (filters.salida) params.set('salida', filters.salida)
      if (filters.destino) params.set('destino', filters.destino)
      if (filters.data) params.set('data', format(filters.data, 'yyyy-MM-dd'))
      if (filters.transporte) params.set('transporte', filters.transporte)
      
      // Adicionar informações dos quartos
      params.set('quartos', filters.rooms.length.toString())
      
      // Somar totais de pessoas
      const totalAdultos = filters.rooms.reduce((sum, room) => sum + room.adults, 0)
      const totalCriancas03 = filters.rooms.reduce((sum, room) => sum + room.children_0_3, 0)
      const totalCriancas45 = filters.rooms.reduce((sum, room) => sum + room.children_4_5, 0)
      const totalCriancas6 = filters.rooms.reduce((sum, room) => sum + room.children_6, 0)
      
      params.set('adultos', totalAdultos.toString())
      params.set('criancas_0_3', totalCriancas03.toString())
      params.set('criancas_4_5', totalCriancas45.toString())
      params.set('criancas_6', totalCriancas6.toString())
      
      // ✅ NOVO: Adicionar configuração específica por quarto se múltiplos quartos
      if (filters.rooms.length > 1) {
        const roomsConfig = filters.rooms.map(room => ({
          adults: room.adults,
          children_0_3: room.children_0_3,
          children_4_5: room.children_4_5,
          children_6: room.children_6
        }))
        
        params.set('rooms_config', encodeURIComponent(JSON.stringify(roomsConfig)))
        console.log('🎯 FORMULÁRIO: ADICIONANDO CONFIGURAÇÃO ESPECÍFICA:', roomsConfig)
      }
      
      router.push(`/resultados?${params.toString()}`)
    }
  }

  // Agora o handleSearch sempre usa Smart Filter
  const handleSearch = handleSmartFilter

  const isFormValid = filters.salida && filters.destino && filters.data

  // Layout sem wrapper para variant="results"
  // ✅ LAYOUT RESPONSIVO: Mobile (2 cols) | Desktop (5 cols + botão)
  const containerClass = "grid grid-cols-2 lg:grid-cols-6 gap-3 lg:gap-4"

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
      <div className={containerClass}>
        {/* Transporte - MOVIDO PARA PRIMEIRO */}
        <div className="space-y-2">
          <label className={`text-sm font-bold ${variant === 'homepage' ? 'text-white' : 'text-gray-800'}`}>
            Transporte
          </label>
          <Select value={filters.transporte} onValueChange={(value) => setFilters(prev => ({ ...prev, transporte: value }))}>
            <SelectTrigger className="w-full h-10 lg:h-12 rounded-2xl border-2 border-gray-200 hover:border-[#EE7215]/50 focus:border-[#EE7215] transition-all duration-200 shadow-sm hover:shadow-md">
              <div className="flex items-center">
                {filters.transporte === "Bus" ? (
                  <Bus className="w-4 h-4 text-[#EE7215] mr-2 flex-shrink-0" />
              ) : filters.transporte === "Aéreo" ? (
                <Plane className="w-4 h-4 text-[#EE7215] mr-2 flex-shrink-0" />
                ) : (
                <Bus className="w-4 h-4 text-[#EE7215] mr-2 flex-shrink-0" />
                )}
              <SelectValue placeholder="Seleccionar transporte">
                <span className="text-sm font-medium">
                  {filters.transporte || "Seleccionar transporte"}
                </span>
              </SelectValue>
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-2 border-gray-200 shadow-xl">
              {transportes.map((transporte) => (
                <SelectItem key={transporte.id} value={transporte.transporte} className="rounded-lg hover:bg-[#EE7215]/5">
                <div className="flex items-center gap-2">
                  {transporte.transporte === "Bus" || transporte.transporte === "Bús" ? (
                    <Bus className="w-4 h-4 text-[#EE7215]" />
                  ) : (
                    <Plane className="w-4 h-4 text-[#EE7215]" />
                  )}
                  <span className="font-medium">{transporte.transporte}</span>
                </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Cidade de Saída */}
        <div className="space-y-2">
          <label className={`text-sm font-bold ${variant === 'homepage' ? 'text-white' : 'text-gray-800'}`}>
            Salida
          </label>
          <Select
            value={filters.salida}
            onValueChange={(value) => setFilters(prev => ({ ...prev, salida: value }))}
            disabled={!filters.transporte}
          >
            <SelectTrigger className={`h-10 lg:h-12 rounded-xl border-2 border-gray-200 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:border-[#EE7215]/30 ${!filters.transporte ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#EE7215]" />
                <SelectValue placeholder={filters.transporte ? "Elegir ciudad de salida" : "Primero selecciona transporte"} />
              </div>
            </SelectTrigger>
            <SelectContent 
              className="rounded-xl border-2 border-gray-200 shadow-xl max-h-[200px] overflow-y-auto"
              position="popper"
              sideOffset={4}
              align="start"
            >
              {cidadesDisponiveis.map((cidade) => (
                <SelectItem key={cidade.id} value={cidade.cidade} className="rounded-lg hover:bg-[#EE7215]/5">
                  <div className="flex flex-col">
                    <span className="font-medium">{cidade.cidade}</span>
                    <span className="text-xs text-gray-500">{cidade.provincia}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Destino */}
        <div className="space-y-2">
          <label className={`text-sm font-bold ${variant === 'homepage' ? 'text-white' : 'text-gray-800'}`}>
            Destino
          </label>
          <Select value={filters.destino} onValueChange={(value) => setFilters(prev => ({ ...prev, destino: value }))}>
            <SelectTrigger className="w-full h-10 lg:h-12 rounded-2xl border-2 border-gray-200 hover:border-[#EE7215]/50 focus:border-[#EE7215] transition-all duration-200 shadow-sm hover:shadow-md">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 text-[#EE7215] mr-2 flex-shrink-0" />
              <SelectValue placeholder="Seleccionar destino">
                <span className="text-sm font-medium">
                  {filters.destino || "Seleccionar destino"}
                </span>
              </SelectValue>
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-2 border-gray-200 shadow-xl">
              {destinos.map((destino) => (
                <SelectItem key={destino.id} value={destino.destino} className="rounded-lg hover:bg-[#EE7215]/5">
                  {destino.destino}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Data - Ao lado do destino */}
        <div className="space-y-2">
          <label className={`text-sm font-bold ${variant === 'homepage' ? 'text-white' : 'text-gray-800'}`}>
            Fecha
          </label>
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <button
                className="w-full h-10 lg:h-12 justify-start text-left font-normal rounded-2xl border-2 border-gray-200 hover:border-[#EE7215]/50 focus:border-[#EE7215] transition-all duration-200 shadow-sm hover:shadow-md bg-white px-3 flex items-center"
              >
                <CalendarIcon className="w-4 h-4 text-[#EE7215] mr-2 flex-shrink-0" />
                <span className="truncate text-sm font-medium text-gray-900">
                  {filters.data ? format(filters.data, "d 'de' MMMM", { locale: es }) : "Seleccionar fecha"}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-xl border-2 border-gray-200 shadow-xl" align="start">
              <div className="w-[320px] h-[380px] flex flex-col">
                <div className="flex-1 p-3">
                  <Calendar
                    mode="single"
                    selected={filters.data}
                    onSelect={handleDateSelect}
                    disabled={isDateDisabled}
                    defaultMonth={getInitialCalendarMonth()}
                    className="text-sm"
                    initialFocus
                    modifiers={{
                      available: (date) => !isDateDisabled(date)
                    }}
                    modifiersStyles={{
                      available: {
                        backgroundColor: '#FFF7ED',
                        color: '#EA580C',
                        borderRadius: '50%',
                        border: '1px solid #FB923C'
                      }
                    }}
                  />
                </div>
                <div className="border-t bg-gradient-to-r from-gray-50 to-gray-100 p-3 text-xs text-gray-600 leading-relaxed">
                  <div className="text-center space-y-1">
                  <p className="font-semibold">Fechas de salida disponibles.</p>
                  <p>Solo puedes seleccionar los días destacados con salidas programadas.</p>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Quartos e Pessoas - 1 coluna igual aos outros */}
        <div className="space-y-2 col-span-2 lg:col-span-1">
          <label className={`text-sm font-bold ${variant === 'homepage' ? 'text-white' : 'text-gray-800'}`}>
            Personas
          </label>
          <Popover open={isRoomsOpen} onOpenChange={setIsRoomsOpen}>
            <PopoverTrigger asChild>
              <button
                className="w-full h-10 lg:h-12 justify-start text-left font-normal rounded-2xl border-2 border-gray-200 hover:border-[#EE7215]/50 focus:border-[#EE7215] transition-all duration-200 shadow-sm hover:shadow-md bg-white px-3 flex items-center"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <Bed className="w-4 h-4 text-[#EE7215] flex-shrink-0" />
                    <span className="text-gray-900 text-sm font-medium">{filters.rooms.length}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-[#EE7215] flex-shrink-0" />
                    <span className="text-gray-900 text-sm font-medium">{getTotalPeople()}</span>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-3 rounded-xl border-2 border-gray-200 shadow-xl" align="start">
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {filters.rooms.map((room, index) => {
                  const roomTotal = getRoomTotalPeople(room)
                  const isNearLimit = roomTotal >= 4
                  const isAtLimit = roomTotal >= 5
                  
                  return (
                  <div key={room.id} className={`border rounded-xl p-3 space-y-2 transition-all duration-200 ${
                    isAtLimit ? 'border-amber-300 bg-amber-50' : 
                    isNearLimit ? 'border-orange-200 bg-orange-50' : 
                    'border-gray-200 bg-white'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-gray-800">Habitación {index + 1}</h4>
                        {isAtLimit && (
                          <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                            Máx 5 personas
                          </span>
                        )}
                      </div>
                      {filters.rooms.length > 1 && (
                        <button
                          onClick={() => removeRoom(room.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 h-6 w-6 rounded-lg flex items-center justify-center transition-all duration-200"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-700">Adultos</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateRoom(room.id, 'adults', room.adults - 1)}
                            disabled={room.adults <= 1}
                            className="h-7 w-7 rounded-lg border border-gray-300 hover:border-[#EE7215] bg-white hover:bg-[#EE7215]/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                          >
                            <Minus className="w-3 h-3 text-gray-600" />
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-gray-900">{room.adults}</span>
                          <button
                            onClick={() => updateRoom(room.id, 'adults', room.adults + 1)}
                            disabled={isAtLimit}
                            className="h-7 w-7 rounded-lg border border-gray-300 hover:border-[#EE7215] bg-white hover:bg-[#EE7215]/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                          >
                            <Plus className="w-3 h-3 text-gray-600" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-700">Niños (0-3 años)</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateRoom(room.id, 'children_0_3', room.children_0_3 - 1)}
                            disabled={room.children_0_3 <= 0}
                            className="h-7 w-7 rounded-lg border border-gray-300 hover:border-[#EE7215] bg-white hover:bg-[#EE7215]/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                          >
                            <Minus className="w-3 h-3 text-gray-600" />
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-gray-900">{room.children_0_3}</span>
                          <button
                            onClick={() => updateRoom(room.id, 'children_0_3', room.children_0_3 + 1)}
                            disabled={isAtLimit}
                            className="h-7 w-7 rounded-lg border border-gray-300 hover:border-[#EE7215] bg-white hover:bg-[#EE7215]/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                          >
                            <Plus className="w-3 h-3 text-gray-600" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-700">Niños (4-5 años)</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateRoom(room.id, 'children_4_5', room.children_4_5 - 1)}
                            disabled={room.children_4_5 <= 0}
                            className="h-7 w-7 rounded-lg border border-gray-300 hover:border-[#EE7215] bg-white hover:bg-[#EE7215]/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                          >
                            <Minus className="w-3 h-3 text-gray-600" />
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-gray-900">{room.children_4_5}</span>
                          <button
                            onClick={() => updateRoom(room.id, 'children_4_5', room.children_4_5 + 1)}
                            disabled={isAtLimit}
                            className="h-7 w-7 rounded-lg border border-gray-300 hover:border-[#EE7215] bg-white hover:bg-[#EE7215]/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                          >
                            <Plus className="w-3 h-3 text-gray-600" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-700">Niños (6+ años)</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateRoom(room.id, 'children_6', room.children_6 - 1)}
                            disabled={room.children_6 <= 0}
                            className="h-7 w-7 rounded-lg border border-gray-300 hover:border-[#EE7215] bg-white hover:bg-[#EE7215]/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                          >
                            <Minus className="w-3 h-3 text-gray-600" />
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-gray-900">{room.children_6}</span>
                          <button
                            onClick={() => updateRoom(room.id, 'children_6', room.children_6 + 1)}
                            disabled={isAtLimit}
                            className="h-7 w-7 rounded-lg border border-gray-300 hover:border-[#EE7215] bg-white hover:bg-[#EE7215]/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                          >
                            <Plus className="w-3 h-3 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  )
                })}
                
                <button
                  onClick={addRoom}
                  className="w-full h-10 border-2 border-dashed border-gray-300 hover:border-[#EE7215] text-gray-600 hover:text-[#EE7215] rounded-xl font-semibold text-sm transition-all duration-200 hover:bg-[#EE7215]/5 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Habitación
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Botão de Busca Inteligente - Mantém tamanho original no desktop */}
        <div className="space-y-2 col-span-2 lg:col-span-1">
          <label className={`text-sm font-medium opacity-0 lg:opacity-0 ${variant === 'homepage' ? 'text-white' : 'text-gray-700'}`}>
            Buscar
          </label>
          <div className="h-12 lg:h-12">
            {/* Botão Smart Filter Único - Mais Grosso */}
            <button
              onClick={handleSearch}
              disabled={!isFormValid || smartLoading}
              className="relative w-full h-full bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-500 hover:via-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-[0_8px_24px_rgba(99,102,241,0.4)] hover:shadow-[0_12px_32px_rgba(99,102,241,0.6)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] transform-gpu overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              title="Busca otimizada com Inteligência Artificial"
            >
              {/* Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
              
              <span className="relative flex items-center justify-center gap-2 text-sm font-black tracking-wide">
                {smartLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Analizando...</span>
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" />
                    <span>Buscar con IA</span>
                  </>
                )}
              </span>
            </button>
          </div>
        </div>

        {/* Indicador de dados de fallback */}
        {(errorCidades || errorDestinos || errorTransportes) && variant === "homepage" && (
          <div className="col-span-2 lg:col-span-6 mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ Usando datos de demostración. Configure las variables de entorno de Supabase para datos reales.
            </p>
          </div>
        )}
    </div>
  )
} 
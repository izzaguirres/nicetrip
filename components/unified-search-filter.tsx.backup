"use client"

import { useState, useEffect } from "react"
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
  { id: 1, cidade: "Buenos Aires", provincia: "Buenos Aires", pais: "Argentina", transporte: "Bus" },
  { id: 2, cidade: "São Paulo", provincia: "São Paulo", pais: "Brasil", transporte: "Bus" },
  { id: 3, cidade: "Rio De Janeiro", provincia: "Rio de Janeiro", pais: "Brasil", transporte: "Aéreo" },
  { id: 4, cidade: "Montevideo", provincia: "Montevideo", pais: "Uruguay", transporte: "Bus" },
]

const FALLBACK_DESTINATIONS = [
  "Canasvieiras",
  "Florianópolis", 
  "Bombinhas",
  "Balneário Camboriú",
  "Gramado",
  "Porto Alegre"
]

const FALLBACK_TRANSPORTS = ["Bus", "Aéreo"]

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
  
  // Hooks do Supabase com fallback
  const { cidades: supabaseCidades, loading: loadingCidades, error: errorCidades } = useCidadesSaida()
  const { destinos: supabaseDestinos, loading: loadingDestinos, error: errorDestinos } = useDestinos()
  const { transportes: supabaseTransportes, loading: loadingTransportes, error: errorTransportes } = useTransportesDisponiveis()
  
  // Hook do Smart Filter
  const { executeSmartFilter, loading: loadingSmartFilter, results: smartResults } = useSmartFilter()

  // Usar dados de fallback se houver erro ou se estiver carregando por muito tempo
  const cidades = errorCidades || supabaseCidades.length === 0 ? FALLBACK_CITIES : supabaseCidades.map(c => ({ ...c, transporte: "Bus" }))
  const destinos = errorDestinos || supabaseDestinos.length === 0 ? FALLBACK_DESTINATIONS : supabaseDestinos
  const transportes = errorTransportes || supabaseTransportes.length === 0 ? FALLBACK_TRANSPORTS : supabaseTransportes

  // ✅ NOVO: Função para definir data padrão baseada no destino
  const getDefaultDateForDestino = (destino: string): Date => {
    if (destino === "Bombinhas") {
      // Para Bombinhas: janeiro 2026 (quando tem disponibilidade)
      return new Date(2026, 0, 1) // Janeiro é mês 0 (0-indexed)
    }
    // Para outros destinos: outubro 2025 (padrão atual)
    return new Date(2025, 9, 2) // Outubro é mês 9 (0-indexed)
  }

  const defaultDate = getDefaultDateForDestino(initialFilters?.destino || "Canasvieiras")

  const [filters, setFilters] = useState<SearchFilters>({
    salida: initialFilters?.salida || "Buenos Aires",
    destino: initialFilters?.destino || "Canasvieiras",
    data: initialFilters?.data || defaultDate,
    rooms: initialFilters?.rooms || [{ id: "1", adults: 2, children_0_3: 0, children_4_5: 0, children_6: 0 }],
    transporte: initialFilters?.transporte || "Bus",
  })

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

  // ✅ NOVO: Detectar mudança de destino e ajustar data automaticamente
  useEffect(() => {
    // Só aplicar se não é inicialização e o destino mudou
    if (filters.destino === "Bombinhas" && filters.data && filters.data < new Date(2026, 0, 1)) {
      console.log('🎯 Bombinhas selecionado: ajustando data para janeiro 2026')
      const bombinaDate = getDefaultDateForDestino("Bombinhas")
      setFilters(prev => ({ ...prev, data: bombinaDate }))
    } else if (filters.destino !== "Bombinhas" && filters.data && filters.data >= new Date(2026, 0, 1)) {
      console.log('🎯 Outro destino selecionado: voltando para data padrão outubro 2025')
      const otherDestinationDate = getDefaultDateForDestino(filters.destino)
      setFilters(prev => ({ ...prev, data: otherDestinationDate }))
    }
  }, [filters.destino]) // Disparar apenas quando destino mudar

  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [isRoomsOpen, setIsRoomsOpen] = useState(false)
  const [smartLoading, setSmartLoading] = useState(false)

  // ✅ ATUALIZADO: Função para desabilitar datas baseada no destino
  const isDateDisabled = (date: Date): boolean => {
    if (filters.destino === "Bombinhas") {
      // Para Bombinhas: permitir datas a partir de janeiro 2026
      const january2026 = new Date(2026, 0, 1) // Janeiro de 2026
      return date < january2026
    }
    // Para outros destinos: regra original (outubro 2025)
    const october2025 = new Date(2025, 9, 1) // Outubro de 2025
    return date < october2025
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
  const containerClass = "grid grid-cols-2 lg:grid-cols-6 gap-3 lg:gap-4"

  // ✅ ATUALIZADO: Função para determinar o mês inicial do calendário baseado no destino e data
  const getInitialCalendarMonth = (): Date => {
    // Se há uma data selecionada, abrir o calendário no mês dela
    if (filters.data) {
      return filters.data
    }
    
    // Para Bombinhas, abrir em janeiro 2026
    if (filters.destino === "Bombinhas") {
      return new Date(2026, 0, 1) // Janeiro de 2026
    }
    
    const now = new Date()
    const october2025 = new Date(2025, 9, 1) // Outubro de 2025
    
    // Para outros destinos: se estamos antes de outubro 2025, abrir em outubro 2025
    if (now < october2025) {
      return october2025
    }
    
    // Senão, abrir no mês atual
    return now
  }

  return (
      <div className={containerClass}>
        {/* Cidade de Saída */}
        <div className="space-y-2">
          <label className={`text-sm font-bold ${variant === 'homepage' ? 'text-white' : 'text-gray-800'}`}>
            Salida
          </label>
          <Select value={filters.salida} onValueChange={(value) => setFilters(prev => ({ ...prev, salida: value }))}>
            <SelectTrigger className="w-full h-10 rounded-2xl border-2 border-gray-200 hover:border-[#EE7215]/50 focus:border-[#EE7215] transition-all duration-200 shadow-sm hover:shadow-md">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 text-[#EE7215] mr-2 flex-shrink-0" />
              <SelectValue placeholder="Seleccionar ciudad">
                <span className="text-sm font-medium">
                  {filters.salida ? capitalizeWords(filters.salida) : "Seleccionar ciudad"}
                </span>
              </SelectValue>
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-2 border-gray-200 shadow-xl">
              {cidades.map((cidade) => (
                <SelectItem key={cidade.id} value={cidade.cidade} className="rounded-lg hover:bg-[#EE7215]/5">
                  {capitalizeWords(cidade.cidade)}
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
            <SelectTrigger className="w-full h-10 rounded-2xl border-2 border-gray-200 hover:border-[#EE7215]/50 focus:border-[#EE7215] transition-all duration-200 shadow-sm hover:shadow-md">
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
                <SelectItem key={destino} value={destino} className="rounded-lg hover:bg-[#EE7215]/5">
                  {destino}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Data - Ocupa linha inteira no mobile */}
        <div className="space-y-2 col-span-2 lg:col-span-1">
          <label className={`text-sm font-bold ${variant === 'homepage' ? 'text-white' : 'text-gray-800'}`}>
            Fecha
          </label>
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <button
                className="w-full h-10 justify-start text-left font-normal rounded-2xl border-2 border-gray-200 hover:border-[#EE7215]/50 focus:border-[#EE7215] transition-all duration-200 shadow-sm hover:shadow-md bg-white px-3 flex items-center"
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
                  />
                </div>
                <div className="border-t bg-gradient-to-r from-gray-50 to-gray-100 p-3 text-xs text-gray-600 leading-relaxed">
                  <div className="text-center space-y-1">
                  <p className="font-semibold">Selecciona cualquier fecha deseada.</p>
                  <p>Te mostraremos paquetes de la fecha más próxima disponible.</p>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Quartos e Pessoas */}
        <div className="space-y-2">
          <label className={`text-sm font-bold ${variant === 'homepage' ? 'text-white' : 'text-gray-800'}`}>
            Personas
          </label>
          <Popover open={isRoomsOpen} onOpenChange={setIsRoomsOpen}>
            <PopoverTrigger asChild>
              <button
                className="w-full h-10 justify-start text-left font-normal rounded-2xl border-2 border-gray-200 hover:border-[#EE7215]/50 focus:border-[#EE7215] transition-all duration-200 shadow-sm hover:shadow-md bg-white px-3 flex items-center"
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

        {/* Transporte */}
        <div className="space-y-2">
          <label className={`text-sm font-bold ${variant === 'homepage' ? 'text-white' : 'text-gray-800'}`}>
            Transporte
          </label>
          <Select value={filters.transporte} onValueChange={(value) => setFilters(prev => ({ ...prev, transporte: value }))}>
            <SelectTrigger className="w-full h-10 rounded-2xl border-2 border-gray-200 hover:border-[#EE7215]/50 focus:border-[#EE7215] transition-all duration-200 shadow-sm hover:shadow-md">
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
                <SelectItem key={transporte} value={transporte} className="rounded-lg hover:bg-[#EE7215]/5">
                <div className="flex items-center gap-2">
                  {transporte === "Bus" ? (
                    <Bus className="w-4 h-4 text-[#EE7215]" />
                  ) : (
                    <Plane className="w-4 h-4 text-[#EE7215]" />
                  )}
                  <span className="font-medium">{transporte}</span>
                </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Botão de Busca Inteligente */}
        <div className="space-y-2 col-span-2 lg:col-span-1">
          <label className={`text-sm font-medium lg:opacity-0 ${variant === 'homepage' ? 'text-white' : 'text-gray-700'}`}>
            Buscar
          </label>
          <div className="h-10">
            {/* Botão Smart Filter Único */}
            <button
              onClick={handleSearch}
              disabled={!isFormValid || smartLoading}
              className="relative w-full bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-500 hover:via-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-[0_8px_24px_rgba(99,102,241,0.4)] hover:shadow-[0_12px_32px_rgba(99,102,241,0.6)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] transform-gpu overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
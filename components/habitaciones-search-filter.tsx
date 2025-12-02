"use client"

import { useState, useEffect } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
  MapPin,
  CalendarIcon,
  Users,
  Bed,
  Minus,
  Plus,
  ChevronDown,
  Trash2,
  Search,
  Info,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { DateRange } from "react-day-picker"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const DESTINOS_DISPONIBLES = [
  { id: 1, nome: "Canasvieiras" },
]

interface Room {
  id: string
  adults: number
  children_0_3: number
  children_4_5: number
  children_6: number
}

interface SearchFilters {
  destino: string
  dateRange: DateRange | undefined
  rooms: Room[]
}

interface HabitacionesSearchFilterProps {
  variant?: "homepage" | "results"
  initialFilters?: Partial<SearchFilters>
  onSearch?: (filters: SearchFilters) => void
}

export function HabitacionesSearchFilter({
  variant = "homepage",
  initialFilters,
  onSearch,
}: HabitacionesSearchFilterProps) {
  const router = useRouter()

  // Calendário deve iniciar no mês atual
  const [month, setMonth] = useState<Date>(new Date());

  const [filters, setFilters] = useState<SearchFilters>({
    destino: initialFilters?.destino || "Canasvieiras", // Default to Canasvieiras
    dateRange: initialFilters?.dateRange || undefined,
    rooms: initialFilters?.rooms || [
      { id: "1", adults: 2, children_0_3: 0, children_4_5: 0, children_6: 0 },
    ],
  })

  useEffect(() => {
    if (initialFilters) {
      setFilters(prev => ({
        destino: initialFilters.destino || prev.destino,
        dateRange: initialFilters.dateRange || prev.dateRange,
        rooms: initialFilters.rooms || prev.rooms,
      }))
    }
  }, [initialFilters])

  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [isRoomsOpen, setIsRoomsOpen] = useState(false)

  const handleDateSelect = (range: DateRange | undefined) => {
    setFilters(prev => ({ ...prev, dateRange: range }))
    if (range?.from && range?.to) {
      setIsCalendarOpen(false)
    }
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
      setFilters(prev => ({
        ...prev,
        rooms: prev.rooms.filter(room => room.id !== roomId),
      }))
    }
  }

  const getRoomTotalPeople = (room: Room): number => {
    return room.adults + room.children_0_3 + room.children_4_5 + room.children_6
  }

  const updateRoom = (
    roomId: string,
    field: keyof Omit<Room, "id">,
    value: number
  ) => {
    setFilters(prev => ({
      ...prev,
      rooms: prev.rooms.map(room => {
        if (room.id !== roomId) return room
        const newRoom = { ...room, [field]: Math.max(0, value) }
        const newTotal = getRoomTotalPeople(newRoom)
        if (newTotal > 5) {
          return room
        }
        return newRoom
      }),
    }))
  }

  const getTotalPeople = () => {
    return filters.rooms.reduce(
      (total, room) =>
        total +
        room.adults +
        room.children_0_3 +
        room.children_4_5 +
        room.children_6,
      0
    )
  }

  const handleSearch = () => {
    if (onSearch) {
      onSearch(filters)
    } else {
      const params = new URLSearchParams()
      params.set("categoria", "hospedagem") // ✅ ADICIONADO PARA DIFERENCIAR
      if (filters.destino) params.set("destino", filters.destino)
      if (filters.dateRange?.from)
        params.set("checkin", format(filters.dateRange.from, "yyyy-MM-dd"))
      if (filters.dateRange?.to)
        params.set("checkout", format(filters.dateRange.to, "yyyy-MM-dd"))

      params.set("quartos", filters.rooms.length.toString())
      const totalAdultos = filters.rooms.reduce(
        (sum, room) => sum + room.adults,
        0
      )
      const totalCriancas03 = filters.rooms.reduce(
        (sum, room) => sum + room.children_0_3,
        0
      )
      const totalCriancas45 = filters.rooms.reduce(
        (sum, room) => sum + room.children_4_5,
        0
      )
      const totalCriancas6 = filters.rooms.reduce(
        (sum, room) => sum + room.children_6,
        0
      )
      params.set("adultos", totalAdultos.toString())
      params.set("criancas_0_3", totalCriancas03.toString())
      params.set("criancas_4_5", totalCriancas45.toString())
      params.set("criancas_6", totalCriancas6.toString())

      if (filters.rooms.length > 1) {
        const roomsConfig = filters.rooms.map(room => ({
          adults: room.adults,
          children_0_3: room.children_0_3,
          children_4_5: room.children_4_5,
          children_6: room.children_6,
        }))
        params.set("rooms_config", encodeURIComponent(JSON.stringify(roomsConfig)))
      }
      router.push(`/resultados?${params.toString()}`)
    }
  }

  const isFormValid =
    filters.destino && filters.dateRange?.from && filters.dateRange?.to

  // Styles for Inputs - Glassmorphism (Matching UnifiedSearchFilter)
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      {/* Destino */}
      <div className={inputContainerClass}>
        <label className={labelClass}>Destino</label>
        <div className="relative h-full">
          {!filters.destino && <MapPin className={iconClass} />}
          <Select
            value={filters.destino}
            onValueChange={value => setFilters(prev => ({ ...prev, destino: value }))}
          >
            <SelectTrigger className={triggerClass}>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border border-slate-100/50 shadow-2xl p-1 min-w-[var(--radix-select-trigger-width)]">
              {DESTINOS_DISPONIBLES.map(destino => (
                <SelectItem
                  key={destino.id}
                  value={destino.nome}
                  className="rounded-lg hover:bg-orange-50 text-sm py-2 cursor-pointer focus:bg-orange-50 focus:text-orange-600"
                >
                  {destino.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Datas (Check-in / Check-out) */}
      <div className={inputContainerClass}>
        <label className={labelClass}>Fechas</label>
        <div className="relative h-full">
          {!filters.dateRange?.from && <CalendarIcon className={iconClass} />}
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <button className={`text-left ${triggerClass} flex items-center`}>
                <span className="truncate capitalize">
                  {filters.dateRange?.from ? (
                    filters.dateRange.to ? (
                      <>
                        {format(filters.dateRange.from, "d MMM", { locale: es })} - {format(filters.dateRange.to, "d MMM", { locale: es })}
                      </>
                    ) : (
                      format(filters.dateRange.from, "d MMM", { locale: es })
                    )
                  ) : (
                    "Check-in / Check-out"
                  )}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-2 rounded-2xl border-0 shadow-2xl overflow-hidden bg-white"
              align="start"
              side="bottom" 
              sideOffset={8} 
              collisionPadding={10}
            >
              <div className="h-[350px] flex items-start justify-center pt-2">
                <Calendar
                  mode="range"
                  selected={filters.dateRange}
                  onSelect={handleDateSelect}
                  locale={es}
                  weekStartsOn={0}
                  numberOfMonths={1}
                  defaultMonth={filters.dateRange?.from || new Date()}
                  disabled={{ before: new Date() }}
                  className="rounded-lg border-0"
                  classNames={{
                    day_range_start: "rounded-l-full bg-orange-500 text-white hover:bg-orange-500 hover:text-white",
                    day_range_end: "rounded-r-full bg-orange-500 text-white hover:bg-orange-500 hover:text-white",
                    day_range_middle: "bg-orange-100 text-orange-900 hover:bg-orange-100 hover:text-orange-900 rounded-none",
                    day_today: "text-orange-600 font-bold bg-orange-50/50",
                  }}
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Quartos e Pessoas */}
      <div className={inputContainerClass}>
        <label className={labelClass}>Huéspedes</label>
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
            <PopoverContent
              className="w-72 p-3 rounded-2xl border border-slate-100/50 shadow-2xl bg-white"
              align="end"
            >
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h4 className="font-bold text-sm text-slate-800">Habitaciones y Pasajeros</h4>
                </div>
                {filters.rooms.map((room, index) => {
                  const roomTotal = getRoomTotalPeople(room)
                  const isAtLimit = roomTotal >= 5

                  return (
                    <div
                      key={room.id}
                      className="bg-slate-50/50 rounded-xl p-3 space-y-2 border border-slate-100"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Habitación {index + 1}</span>
                        {filters.rooms.length > 1 && (
                          <button
                            onClick={() => removeRoom(room.id)}
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded-md transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-700">Adultos</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateRoom(room.id, 'adults', room.adults - 1)}
                              disabled={room.adults <= 1}
                              className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:border-orange-500 hover:text-orange-600 disabled:opacity-30 transition-colors shadow-sm"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-4 text-center text-sm font-bold text-slate-900">{room.adults}</span>
                            <button
                              onClick={() => updateRoom(room.id, 'adults', room.adults + 1)}
                              disabled={isAtLimit}
                              className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:border-orange-500 hover:text-orange-600 disabled:opacity-30 transition-colors shadow-sm"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {[
                           { key: 'children_0_3', label: 'Bebés (0-3)' },
                           { key: 'children_4_5', label: 'Niños (4-5)' },
                           { key: 'children_6', label: 'Niños (6+)' }
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
          disabled={!isFormValid}
          className="btn-liquid-orange w-full h-full rounded-2xl flex items-center justify-center gap-2 group disabled:opacity-50 disabled:grayscale transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <span className="text-base font-bold tracking-wide uppercase text-white">Buscar</span>
          <Search className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  )
} 
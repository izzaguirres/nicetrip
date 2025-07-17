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
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { DateRange } from "react-day-picker"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

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

  const [month, setMonth] = useState<Date>(new Date(2025, 6));

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
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>()

  const handlePopoverOpenChange = (open: boolean) => {
    if (open) {
      setTempDateRange(filters.dateRange)
    }
    setIsCalendarOpen(open)
  }

  const handleConfirmDates = () => {
    setFilters(prev => ({ ...prev, dateRange: tempDateRange }))
    setIsCalendarOpen(false)
  }

  const handleClearDates = () => {
    setTempDateRange(undefined)
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
      params.set("tipo", "habitacion")
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

  const containerClass = "grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4"

  return (
    <div className={containerClass}>
      {/* Destino */}
      <div className="space-y-2">
        <label
          className={`text-sm font-bold ${
            variant === "homepage" ? "text-[#222222]" : "text-gray-800"
          }`}
        >
          Destino
        </label>
        <Select
          value={filters.destino}
          onValueChange={value => setFilters(prev => ({ ...prev, destino: value }))}
        >
          <SelectTrigger className="w-full h-10 lg:h-12 rounded-2xl border-2 border-gray-200 hover:border-[#EE7215]/50 focus:border-[#EE7215] transition-all duration-200 shadow-sm hover:shadow-md">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#EE7215] mr-2 flex-shrink-0" />
              <SelectValue placeholder="Seleccionar" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-xl border-2 border-gray-200 shadow-xl">
            {DESTINOS_DISPONIBLES.map(destino => (
              <SelectItem
                key={destino.id}
                value={destino.nome}
                className="rounded-lg hover:bg-[#EE7215]/5"
              >
                {destino.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Datas (Check-in / Check-out) */}
      <div className="space-y-2">
        <label
          className={`text-sm font-bold ${
            variant === "homepage" ? "text-[#222222]" : "text-gray-800"
          }`}
        >
          Fechas
        </label>
        <Popover open={isCalendarOpen} onOpenChange={handlePopoverOpenChange}>
          <PopoverTrigger asChild>
            <button className="w-full h-10 lg:h-12 justify-start text-left font-normal rounded-2xl border-2 border-gray-200 hover:border-[#EE7215]/50 focus:border-[#EE7215] transition-all duration-200 shadow-sm hover:shadow-md bg-white px-3 flex items-center">
              <CalendarIcon className="w-4 h-4 text-[#EE7215] mr-2 flex-shrink-0" />
              <span className="truncate text-sm font-medium text-gray-900">
                {filters.dateRange?.from ? (
                  filters.dateRange.to ? (
                    <>
                      {format(filters.dateRange.from, "LLL dd, y", {
                        locale: es,
                      })}{" "}
                      -{" "}
                      {format(filters.dateRange.to, "LLL dd, y", { locale: es })}
                    </>
                  ) : (
                    format(filters.dateRange.from, "LLL dd, y", { locale: es })
                  )
                ) : (
                  "Check-in / Check-out"
                )}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 rounded-xl border-2 border-gray-200 shadow-xl"
            align="start"
          >
            <div className="w-[320px] flex flex-col">
              <div className="p-3">
                <Calendar
                  mode="range"
                  selected={tempDateRange}
                  onSelect={setTempDateRange}
                  locale={es}
                  weekStartsOn={0}
                  numberOfMonths={1}
                  month={month}
                  onMonthChange={setMonth}
                  disabled={{ before: new Date() }}
                />
              </div>
              <div className="border-t bg-gradient-to-r from-gray-50 to-gray-100 p-3 flex justify-between items-center">
                <Button variant="ghost" size="sm" onClick={handleClearDates}>Limpiar</Button>
                <Button size="sm" onClick={handleConfirmDates} className="bg-orange-500 hover:bg-orange-600 text-white">Confirmar</Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Quartos e Pessoas */}
      <div className="space-y-2 col-span-2 lg:col-span-1">
        <label
          className={`text-sm font-bold ${
            variant === "homepage" ? "text-[#222222]" : "text-gray-800"
          }`}
        >
          Personas
        </label>
        <Popover open={isRoomsOpen} onOpenChange={setIsRoomsOpen}>
          <PopoverTrigger asChild>
            <button className="w-full h-10 lg:h-12 justify-start text-left font-normal rounded-2xl border-2 border-gray-200 hover:border-[#EE7215]/50 focus:border-[#EE7215] transition-all duration-200 shadow-sm hover:shadow-md bg-white px-3 flex items-center">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <Bed
                    className="w-4 h-4 text-[#EE7215] flex-shrink-0"
                  />
                  <span className="text-gray-900 text-sm font-medium">
                    {filters.rooms.length}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Users
                    className="w-4 h-4 text-[#EE7215] flex-shrink-0"
                  />
                  <span className="text-gray-900 text-sm font-medium">
                    {getTotalPeople()}
                  </span>
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-72 p-3 rounded-xl border-2 border-gray-200 shadow-xl"
            align="start"
          >
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {filters.rooms.map((room, index) => {
                const roomTotal = getRoomTotalPeople(room)
                const isNearLimit = roomTotal >= 4
                const isAtLimit = roomTotal >= 5

                return (
                  <div
                    key={room.id}
                    className={`border rounded-xl p-3 space-y-2 transition-all duration-200 ${
                      isAtLimit
                        ? "border-amber-300 bg-amber-50"
                        : isNearLimit
                        ? "border-orange-200 bg-orange-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-gray-800">
                          Habitación {index + 1}
                        </h4>
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
                        <span className="text-xs font-semibold text-gray-700">
                          Adultos
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateRoom(room.id, "adults", room.adults - 1)
                            }
                            disabled={room.adults <= 1}
                            className="h-7 w-7 rounded-lg border border-gray-300 hover:border-[#EE7215] bg-white hover:bg-[#EE7215]/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                          >
                            <Minus className="w-3 h-3 text-gray-600" />
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-gray-900">
                            {room.adults}
                          </span>
                          <button
                            onClick={() =>
                              updateRoom(room.id, "adults", room.adults + 1)
                            }
                            disabled={isAtLimit}
                            className="h-7 w-7 rounded-lg border border-gray-300 hover:border-[#EE7215] bg-white hover:bg-[#EE7215]/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                          >
                            <Plus className="w-3 h-3 text-gray-600" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-700">
                          Niños (0-3 años)
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateRoom(
                                room.id,
                                "children_0_3",
                                room.children_0_3 - 1
                              )
                            }
                            disabled={room.children_0_3 <= 0}
                            className="h-7 w-7 rounded-lg border border-gray-300 hover:border-[#EE7215] bg-white hover:bg-[#EE7215]/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                          >
                            <Minus className="w-3 h-3 text-gray-600" />
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-gray-900">
                            {room.children_0_3}
                          </span>
                          <button
                            onClick={() =>
                              updateRoom(
                                room.id,
                                "children_0_3",
                                room.children_0_3 + 1
                              )
                            }
                            disabled={isAtLimit}
                            className="h-7 w-7 rounded-lg border border-gray-300 hover:border-[#EE7215] bg-white hover:bg-[#EE7215]/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                          >
                            <Plus className="w-3 h-3 text-gray-600" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-700">
                          Niños (4-5 años)
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateRoom(
                                room.id,
                                "children_4_5",
                                room.children_4_5 - 1
                              )
                            }
                            disabled={room.children_4_5 <= 0}
                            className="h-7 w-7 rounded-lg border border-gray-300 hover:border-[#EE7215] bg-white hover:bg-[#EE7215]/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                          >
                            <Minus className="w-3 h-3 text-gray-600" />
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-gray-900">
                            {room.children_4_5}
                          </span>
                          <button
                            onClick={() =>
                              updateRoom(
                                room.id,
                                "children_4_5",
                                room.children_4_5 + 1
                              )
                            }
                            disabled={isAtLimit}
                            className="h-7 w-7 rounded-lg border border-gray-300 hover:border-[#EE7215] bg-white hover:bg-[#EE7215]/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                          >
                            <Plus className="w-3 h-3 text-gray-600" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-700">
                          Niños (6+ años)
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateRoom(
                                room.id,
                                "children_6",
                                room.children_6 - 1
                              )
                            }
                            disabled={room.children_6 <= 0}
                            className="h-7 w-7 rounded-lg border border-gray-300 hover:border-[#EE7215] bg-white hover:bg-[#EE7215]/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                          >
                            <Minus className="w-3 h-3 text-gray-600" />
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-gray-900">
                            {room.children_6}
                          </span>
                          <button
                            onClick={() =>
                              updateRoom(
                                room.id,
                                "children_6",
                                room.children_6 + 1
                              )
                            }
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

      {/* Botão de Busca */}
      <div className="space-y-2 col-span-2 lg:col-span-1">
        <label
          className={`text-sm font-medium opacity-0 ${
            variant === "homepage" ? "text-white" : "text-gray-700"
          }`}
        >
          Buscar
        </label>
        <div className="h-12 lg:h-12">
          <button
            onClick={handleSearch}
            disabled={!isFormValid}
            className="w-full h-full bg-gradient-to-r from-[#FF6B35] via-[#EE7215] to-[#F7931E] hover:from-[#FF5722] hover:via-[#E65100] hover:to-[#FF8F00] text-white font-bold rounded-2xl shadow-[0_8px_24px_rgba(238,114,21,0.4)] hover:shadow-[0_12px_32px_rgba(238,114,21,0.6)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] transform-gpu overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <span className="flex items-center justify-center gap-2 text-sm font-black tracking-wide">
              <Search className="w-4 h-4" />
              <span>Buscar</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  )
} 
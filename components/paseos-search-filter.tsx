"use client"

import { useState, useEffect } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Search,
  CalendarIcon,
  Users,
  Minus,
  Plus,
  ChevronDown,
  Trash2,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useRouter } from "next/navigation"

interface PeopleSelection {
  adults: number
  children_0_3: number
  children_4_5: number
  children_6_plus: number
}

interface PaseosSearchFilters {
  month: string | undefined
  people: PeopleSelection
}

// Helper para gerar meses específicos de Agosto 2025 até Abril 2026
const getSpecificMonths = (): { value: string; label: string }[] => {
  const months = [
    { date: new Date(2025, 7), name: "Agosto" },    // Agosto 2025
    { date: new Date(2025, 8), name: "Septiembre" }, // Setembro 2025
    { date: new Date(2025, 9), name: "Octubre" },   // Outubro 2025
    { date: new Date(2025, 10), name: "Noviembre" }, // Novembro 2025
    { date: new Date(2025, 11), name: "Diciembre" }, // Dezembro 2025
    { date: new Date(2026, 0), name: "Enero" },     // Janeiro 2026
    { date: new Date(2026, 1), name: "Febrero" },   // Fevereiro 2026
    { date: new Date(2026, 2), name: "Marzo" },     // Março 2026
    { date: new Date(2026, 3), name: "Abril" },     // Abril 2026
  ]

  return months.map(month => ({
    value: format(month.date, "yyyy-MM"),
    label: `${month.name} ${format(month.date, "yyyy")}`,
  }))
}

interface PaseosSearchFilterProps {
  variant?: "homepage" | "results"
  onSearch?: (filters: PaseosSearchFilters) => void
  initialFilters?: Partial<PaseosSearchFilters>
}

export function PaseosSearchFilter({
  variant = "homepage",
  onSearch,
  initialFilters,
}: PaseosSearchFilterProps) {
  const router = useRouter()
  const availableMonths = getSpecificMonths()

  const [filters, setFilters] = useState<PaseosSearchFilters>({
    month: initialFilters?.month || availableMonths[0].value,
    people: initialFilters?.people || { adults: 2, children_0_3: 0, children_4_5: 0, children_6_plus: 0 },
  })

  // ✅ NOVO: Manter mês selecionado após busca
  useEffect(() => {
    if (initialFilters) {
      setFilters(prev => ({
        month: initialFilters.month || prev.month,
        people: initialFilters.people || prev.people,
      }))
    }
  }, [initialFilters])

  const [isPeopleOpen, setIsPeopleOpen] = useState(false)

  const handleMonthSelect = (value: string) => {
    setFilters(prev => ({ ...prev, month: value }))
  }

  const updatePeopleCount = (
    field: keyof PeopleSelection,
    value: number
  ) => {
    setFilters(prev => ({
      ...prev,
      people: {
        ...prev.people,
        [field]: Math.max(0, value),
      },
    }))
  }

  const getTotalPeople = () => {
    const { adults, children_0_3, children_4_5, children_6_plus } = filters.people
    return adults + children_0_3 + children_4_5 + children_6_plus
  }

  const handleSearch = () => {
    if (onSearch) {
      onSearch(filters)
      return
    }

    const params = new URLSearchParams()
    params.set("categoria", "passeio")

    if (filters.month) {
      params.set("mes", filters.month)
    }

    params.set("adultos", filters.people.adults.toString())
    params.set("criancas_0_3", filters.people.children_0_3.toString())
    params.set("criancas_4_5", filters.people.children_4_5.toString())
    params.set("criancas_6_plus", filters.people.children_6_plus.toString())

    router.push(`/resultados?${params.toString()}`)
  }

  const isFormValid = filters.month && getTotalPeople() > 0

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
      {/* Seletor de Data (Mês) */}
      <div className="space-y-2 col-span-2 lg:col-span-1">
        <label className="text-sm font-bold text-[#222222]">Mes</label>
        <Select value={filters.month} onValueChange={handleMonthSelect}>
            <SelectTrigger className="w-full h-10 lg:h-12 rounded-2xl border-2 border-gray-200 hover:border-[#EE7215]/50 focus:border-[#EE7215] transition-all duration-200 shadow-sm hover:shadow-md bg-white px-3 text-left">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <CalendarIcon className="w-4 h-4 text-[#EE7215] mr-2 flex-shrink-0" />
                  <SelectValue placeholder="Seleccionar mes" className="font-medium" />
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-2 border-gray-200 shadow-xl max-h-60 overflow-y-auto">
              {availableMonths.map((month: { value: string; label: string }) => (
                <SelectItem key={month.value} value={month.value} className="rounded-lg hover:bg-[#EE7215]/5 py-3">
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
        </Select>
      </div>

      {/* Seletor de Pessoas */}
      <div className="space-y-2 col-span-2 lg:col-span-1">
        <label className="text-sm font-bold text-[#222222]">Personas</label>
        <Popover open={isPeopleOpen} onOpenChange={setIsPeopleOpen}>
          <PopoverTrigger asChild>
            <button className="w-full h-10 lg:h-12 justify-start text-left font-normal rounded-2xl border-2 border-gray-200 hover:border-[#EE7215]/50 focus:border-[#EE7215] transition-all duration-200 shadow-sm hover:shadow-md bg-white px-3 flex items-center">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#EE7215] flex-shrink-0" />
                <span className="text-gray-900 text-sm font-medium">
                  {getTotalPeople()} Personas
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0 ml-auto" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-4 rounded-xl border-2 border-gray-200 shadow-xl" align="start">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Adultos</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updatePeopleCount('adults', filters.people.adults - 1)} disabled={filters.people.adults <= 1} className="h-7 w-7 rounded-lg border border-gray-300 hover:border-[#EE7215] bg-white hover:bg-[#EE7215]/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center">
                      <Minus className="w-3 h-3 text-gray-600" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-gray-900">{filters.people.adults}</span>
                    <button onClick={() => updatePeopleCount('adults', filters.people.adults + 1)} className="h-7 w-7 rounded-lg border border-gray-300 hover:border-[#EE7215] bg-white hover:bg-[#EE7215]/5 transition-all duration-200 flex items-center justify-center">
                      <Plus className="w-3 h-3 text-gray-600" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Niños (0-3 años)</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updatePeopleCount('children_0_3', filters.people.children_0_3 - 1)} disabled={filters.people.children_0_3 <= 0} className="h-7 w-7 rounded-lg border border-gray-300 hover:border-[#EE7215] bg-white hover:bg-[#EE7215]/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center">
                      <Minus className="w-3 h-3 text-gray-600" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-gray-900">{filters.people.children_0_3}</span>
                    <button onClick={() => updatePeopleCount('children_0_3', filters.people.children_0_3 + 1)} className="h-7 w-7 rounded-lg border border-gray-300 hover:border-[#EE7215] bg-white hover:bg-[#EE7215]/5 transition-all duration-200 flex items-center justify-center">
                      <Plus className="w-3 h-3 text-gray-600" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Niños (4-5 años)</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updatePeopleCount('children_4_5', filters.people.children_4_5 - 1)} disabled={filters.people.children_4_5 <= 0} className="h-7 w-7 rounded-lg border border-gray-300 hover:border-[#EE7215] bg-white hover:bg-[#EE7215]/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center">
                      <Minus className="w-3 h-3 text-gray-600" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-gray-900">{filters.people.children_4_5}</span>
                    <button onClick={() => updatePeopleCount('children_4_5', filters.people.children_4_5 + 1)} className="h-7 w-7 rounded-lg border border-gray-300 hover:border-[#EE7215] bg-white hover:bg-[#EE7215]/5 transition-all duration-200 flex items-center justify-center">
                      <Plus className="w-3 h-3 text-gray-600" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Niños (6+ años)</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updatePeopleCount('children_6_plus', filters.people.children_6_plus - 1)} disabled={filters.people.children_6_plus <= 0} className="h-7 w-7 rounded-lg border border-gray-300 hover:border-[#EE7215] bg-white hover:bg-[#EE7215]/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center">
                      <Minus className="w-3 h-3 text-gray-600" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-gray-900">{filters.people.children_6_plus}</span>
                    <button onClick={() => updatePeopleCount('children_6_plus', filters.people.children_6_plus + 1)} className="h-7 w-7 rounded-lg border border-gray-300 hover:border-[#EE7215] bg-white hover:bg-[#EE7215]/5 transition-all duration-200 flex items-center justify-center">
                      <Plus className="w-3 h-3 text-gray-600" />
                    </button>
                  </div>
                </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Botao de Busca */}
      <div className="space-y-2 col-span-2 lg:col-span-1">
        <label className="text-sm font-medium opacity-0">Buscar</label>
        <Button
          onClick={handleSearch}
          disabled={!isFormValid}
          className="w-full h-10 lg:h-12 bg-gradient-to-r from-[#FF6B35] via-[#EE7215] to-[#F7931E] hover:from-[#FF5722] hover:to-[#FF8F00] text-white font-bold rounded-2xl shadow-[0_8px_24px_rgba(238,114,21,0.4)] hover:shadow-[0_12px_32px_rgba(238,114,21,0.6)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
          <span className="relative z-10 flex items-center">
            <Search className="w-4 h-4 mr-2" />
            Buscar Paseos
          </span>
        </Button>
      </div>
    </div>
  )
} 
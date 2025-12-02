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

  // Styles for Inputs - Glassmorphism (Matching UnifiedSearchFilter)
  const inputContainerClass = "relative h-14 rounded-2xl border transition-all duration-300 group hover:shadow-md bg-white/90 border-white/20 backdrop-blur-md focus-within:bg-white focus-within:border-[#FF6B35]/50 hover:bg-white/95"

  const labelClass = "absolute left-12 top-2 text-[10px] font-bold uppercase tracking-wider transition-colors z-10 text-slate-500 group-hover:text-[#FF6B35]"

  const iconClass = "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors z-10 text-[#FF6B35]"

  const triggerClass = "w-full h-full pl-12 pr-4 pt-5 pb-1 bg-transparent border-0 ring-0 focus:ring-0 text-sm font-semibold text-slate-900 placeholder:text-slate-400"

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
      {/* Seletor de Data (Mês) */}
      <div className={inputContainerClass}>
        <label className={labelClass}>Mes</label>
        <div className="relative h-full">
            <CalendarIcon className={iconClass} />
            <Select value={filters.month} onValueChange={handleMonthSelect}>
                <SelectTrigger className={triggerClass}>
                  <SelectValue placeholder="Seleccionar mes" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-slate-100/50 shadow-2xl p-1 min-w-[var(--radix-select-trigger-width)] max-h-60 overflow-y-auto">
                  {availableMonths.map((month: { value: string; label: string }) => (
                    <SelectItem key={month.value} value={month.value} className="rounded-lg hover:bg-orange-50 text-sm py-2 cursor-pointer focus:bg-orange-50 focus:text-orange-600">
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
            </Select>
        </div>
      </div>

      {/* Seletor de Pessoas */}
      <div className={inputContainerClass}>
        <label className={labelClass}>Personas</label>
        <div className="relative h-full">
            <Users className={iconClass} />
            <Popover open={isPeopleOpen} onOpenChange={setIsPeopleOpen}>
              <PopoverTrigger asChild>
                <button className={`text-left ${triggerClass} flex items-center justify-between`}>
                  <span className="truncate">
                    {getTotalPeople()} Personas
                  </span>
                  <ChevronDown className="h-4 w-4 text-slate-400 opacity-50" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-3 rounded-2xl border border-slate-100/50 shadow-2xl bg-white" align="start">
                <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <h4 className="font-bold text-sm text-slate-900">Cantidad de personas</h4>
                    </div>

                    {[
                       { key: 'adults', label: 'Adultos' },
                       { key: 'children_0_3', label: 'Niños (0-3 años)' },
                       { key: 'children_4_5', label: 'Niños (4-5 años)' },
                       { key: 'children_6_plus', label: 'Niños (6+ años)' }
                    ].map((field) => (
                       <div key={field.key} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-700">{field.label}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updatePeopleCount(field.key as any, filters.people[field.key as keyof PeopleSelection] - 1)}
                              disabled={field.key === 'adults' ? filters.people.adults <= 1 : filters.people[field.key as keyof PeopleSelection] <= 0}
                              className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:border-orange-500 hover:text-orange-600 disabled:opacity-30 transition-colors shadow-sm"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-sm font-bold text-slate-900">{filters.people[field.key as keyof PeopleSelection]}</span>
                            <button
                              onClick={() => updatePeopleCount(field.key as any, filters.people[field.key as keyof PeopleSelection] + 1)}
                              className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:border-orange-500 hover:text-orange-600 disabled:opacity-30 transition-colors shadow-sm"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                       </div>
                    ))}
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
                    <span className="text-xs font-medium text-slate-500">Total: {getTotalPeople()} personas</span>
                </div>
              </PopoverContent>
            </Popover>
        </div>
      </div>

      {/* Botao de Busca */}
      <div className="h-14">
        <button
          onClick={handleSearch}
          disabled={!isFormValid}
          className="btn-liquid-orange w-full h-full rounded-2xl flex items-center justify-center gap-2 group disabled:opacity-50 disabled:grayscale transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <span className="text-base font-bold tracking-wide uppercase text-white">Buscar Paseos</span>
          <Search className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  )
} 
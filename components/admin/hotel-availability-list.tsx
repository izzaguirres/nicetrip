"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { format, addMonths, subMonths, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getHospedagemDiarias, type HospedagemDiaria } from "@/lib/admin-hoteis"
import { hotelDataMap } from "@/lib/hotel-data"
import { HOSPEDAGENS_PERMITIDAS } from "@/lib/constants-hoteis"
import { Edit, Search, Loader2, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { HotelDayEditor } from "./hotel-day-editor"

interface HotelAvailabilityListProps {
  onEdit?: (diaria: HospedagemDiaria) => void
  refreshTrigger: number
  selectedHotel?: string | null
}

interface DayGroup {
  date: string
  items: HospedagemDiaria[]
}

export function HotelAvailabilityList({ refreshTrigger, selectedHotel }: HotelAvailabilityListProps) {
  const [diarias, setDiarias] = useState<HospedagemDiaria[]>([])
  const [loading, setLoading] = useState(true)
  
  const [filters, setFilters] = useState({
    slug_hospedagem: selectedHotel || HOSPEDAGENS_PERMITIDAS[0],
    month: new Date().toISOString().slice(0, 7), // YYYY-MM
  })
  const { toast } = useToast()

  const [editorState, setEditorState] = useState<{
    isOpen: boolean
    date: string
    diarias: HospedagemDiaria[]
  }>({
    isOpen: false,
    date: "",
    diarias: []
  })

  useEffect(() => {
    if (selectedHotel) {
      setFilters(prev => ({ ...prev, slug_hospedagem: selectedHotel }))
    }
  }, [selectedHotel])

  // Lista filtrada de hotéis
  const hoteis = useMemo(() => {
    return HOSPEDAGENS_PERMITIDAS.map(slug => ({
      slug,
      name: hotelDataMap[slug]?.displayName || slug
    }))
  }, [])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const startDate = `${filters.month}-01`
      const [year, month] = filters.month.split('-').map(Number)
      const lastDay = new Date(year, month, 0).getDate()
      const endDate = `${filters.month}-${lastDay}`

      const data = await getHospedagemDiarias({
        slug_hospedagem: filters.slug_hospedagem,
        startDate,
        endDate
      })
      setDiarias(data)
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Erro ao carregar",
        description: "Não foi possível carregar as diárias."
      })
    } finally {
      setLoading(false)
    }
  }, [filters, toast])

  useEffect(() => {
    loadData()
  }, [loadData, refreshTrigger])

  // Agrupar por data e Ordenar por capacidade
  const groupedData = useMemo(() => {
    const groups: Record<string, HospedagemDiaria[]> = {}
    diarias.forEach(d => {
      const dateKey = d.data.split('T')[0]
      if (!groups[dateKey]) groups[dateKey] = []
      groups[dateKey].push(d)
    })
    
    return Object.entries(groups)
      .map(([date, items]) => ({ 
        date, 
        items: items.sort((a, b) => {
          // Ordenar por Capacidade (Crescente)
          if (a.capacidade !== b.capacidade) return a.capacidade - b.capacidade
          // Se empate, ordenar por Valor (Crescente)
          return a.valor_diaria - b.valor_diaria
        })
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [diarias])

  const handleEditDay = (dayGroup: DayGroup) => {
    setEditorState({
      isOpen: true,
      date: dayGroup.date,
      diarias: dayGroup.items
    })
  }

  // Controles de Mês
  const currentMonthDate = parseISO(filters.month + "-01")
  
  const handlePrevMonth = () => {
    const newDate = subMonths(currentMonthDate, 1)
    setFilters(prev => ({ ...prev, month: format(newDate, "yyyy-MM") }))
  }

  const handleNextMonth = () => {
    const newDate = addMonths(currentMonthDate, 1)
    setFilters(prev => ({ ...prev, month: format(newDate, "yyyy-MM") }))
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <CardTitle className="text-lg font-medium flex items-center gap-2 self-start md:self-center">
               <CalendarDays className="w-5 h-5 text-gray-500" />
               Calendário de Tarifas
            </CardTitle>
            
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
               {/* Seletor de Hotel */}
               <div className="w-full md:w-[280px]">
                  <Select 
                    value={filters.slug_hospedagem} 
                    onValueChange={(v) => setFilters(prev => ({ ...prev, slug_hospedagem: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o Hotel" />
                    </SelectTrigger>
                    <SelectContent>
                      {hoteis.map(hotel => (
                        <SelectItem key={hotel.slug} value={hotel.slug}>
                          {hotel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
               </div>

               {/* Navegação de Mês Inteligente */}
               <div className="flex items-center justify-between bg-white border rounded-md p-1 w-full md:w-auto min-w-[240px]">
                  <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                     <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="font-semibold capitalize text-sm min-w-[120px] text-center">
                     {format(currentMonthDate, "MMMM yyyy", { locale: es })}
                  </span>
                  <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                     <ChevronRight className="w-4 h-4" />
                  </Button>
               </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="w-[120px]">Data</TableHead>
                  <TableHead>Quartos & Tarifas (Ordenado por Capacidade)</TableHead>
                  <TableHead className="text-right w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                         <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                         <span className="text-xs text-muted-foreground">Carregando tarifas...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : groupedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-32 text-center text-muted-foreground bg-slate-50/50">
                      <div className="flex flex-col items-center justify-center gap-2">
                         <CalendarDays className="w-8 h-8 text-slate-300" />
                         <p>Nenhuma diária encontrada para {format(currentMonthDate, "MMMM", { locale: es })}.</p>
                         <Button variant="link" onClick={() => {
                            // Tenta sugerir importação ou criação (feedback visual)
                         }}>
                            Use o botão "Importar CSV" ou "Lançamento Manual" acima.
                         </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  groupedData.map((group) => {
                      const dateObj = new Date(group.date + "T12:00:00")
                      const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6

                      return (
                      <TableRow key={group.date} className={isWeekend ? "bg-slate-50/60" : ""}>
                        <TableCell className="font-medium align-middle">
                          <div className="flex flex-col">
                            <span className="text-base font-bold text-slate-700">
                              {format(dateObj, "dd/MM")}
                            </span>
                            <span className={`text-xs font-medium capitalize ${isWeekend ? "text-orange-600" : "text-muted-foreground"}`}>
                               {format(dateObj, "EEEE", { locale: es })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            {group.items.map(item => (
                              <Badge 
                                 key={item.id} 
                                 variant="outline" 
                                 className={`flex flex-col items-start gap-0.5 px-3 py-1.5 h-auto border transition-all ${
                                    !item.ativo ? "opacity-50 bg-gray-100 border-dashed" : "bg-white hover:border-blue-300 hover:shadow-sm"
                                 }`}
                              >
                                <div className="flex justify-between w-full gap-2">
                                   <span className="font-bold text-[11px] uppercase tracking-wide text-slate-700">
                                      {item.tipo_quarto}
                                   </span>
                                   {/* Indicador visual de capacidade */}
                                   <span className="text-[9px] bg-slate-100 px-1 rounded text-slate-500 font-medium">
                                      {Array(item.capacidade).fill('👤').join('')}
                                   </span>
                                </div>
                                <div className="flex items-center justify-between w-full mt-0.5">
                                  <span className="text-green-600 font-bold text-sm">USD {item.valor_diaria}</span>
                                </div>
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right align-middle">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditDay(group)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {editorState.isOpen && (
        <HotelDayEditor
          isOpen={editorState.isOpen}
          onClose={() => setEditorState(prev => ({ ...prev, isOpen: false }))}
          hotelSlug={filters.slug_hospedagem}
          hotelName={hoteis.find(h => h.slug === filters.slug_hospedagem)?.name || filters.slug_hospedagem}
          date={editorState.date}
          diariasIniciais={editorState.diarias}
          onSuccess={loadData}
        />
      )}
    </>
  )
}
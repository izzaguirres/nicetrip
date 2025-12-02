"use client"

import { useState, useMemo } from "react"
import { Disponibilidade } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Calendar, Bus, Plane, Pencil, Trash2, Plus, Info } from "lucide-react"
import { DisponibilidadeForm, type DisponibilidadeFormData } from "./disponibilidade-form"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface HotelAvailabilityListProps {
  hotelName: string
  initialData: Disponibilidade[]
}

export function HotelAvailabilityList({ hotelName, initialData }: HotelAvailabilityListProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [records, setRecords] = useState(initialData)
  
  // Estado para criar nova saída avulsa
  const [createOpen, setCreateOpen] = useState(false)
  const [createData, setCreateData] = useState<DisponibilidadeFormData | undefined>(undefined)

  // Estado para editar uma data específica (grupo de registros)
  const [editDateOpen, setEditDateOpen] = useState(false)
  const [selectedDateGroup, setSelectedDateGroup] = useState<Disponibilidade[]>([])
  
  // Estado para editar um registro específico dentro do grupo (usando o form padrão)
  const [editSingleOpen, setEditSingleOpen] = useState(false)
  const [editSingleData, setEditSingleData] = useState<DisponibilidadeFormData | undefined>(undefined)

  const [transportFilter, setTransportFilter] = useState<string>('all')

  // Agrupar por Data + Transporte
  const groupedDates = useMemo(() => {
    const groups = new Map<string, Disponibilidade[]>()
    
    records.forEach(r => {
      // Filtro de transporte
      if (transportFilter !== 'all') {
        const t1 = r.transporte.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        const t2 = transportFilter.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        if (!t1.includes(t2)) return
      }

      const key = `${r.data_saida}::${r.transporte}`
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)?.push(r)
    })

    return Array.from(groups.entries()).map(([key, items]) => {
      const [date, transport] = key.split('::')
      const minPrice = Math.min(...items.map(i => i.preco_adulto))
      // Ordenar quartos: Single, Doble, Triple...
      const sortedItems = items.sort((a, b) => (a.capacidade || 0) - (b.capacidade || 0))
      
      return {
        date,
        transport,
        items: sortedItems,
        minPrice,
        capacitySummary: sortedItems.map(i => i.quarto_tipo).join(', ')
      }
    }).sort((a, b) => a.date.localeCompare(b.date))
  }, [records, transportFilter])

  const handleOpenDate = (items: Disponibilidade[]) => {
    setSelectedDateGroup(items)
    setEditDateOpen(true)
  }

  const handleEditSingle = (record: Disponibilidade) => {
    setEditSingleData(record)
    setEditSingleOpen(true)
  }

  const handleDeleteSingle = async (id: number) => {
    if (!confirm("Tem certeza?")) return
    try {
      await fetch(`/api/admin/disponibilidades?id=${id}`, { method: 'DELETE' })
      
      // Atualizar estado local
      const newRecords = records.filter(r => r.id !== id)
      setRecords(newRecords)
      
      // Atualizar o grupo selecionado também para refletir na modal aberta
      setSelectedDateGroup(prev => prev.filter(r => r.id !== id))
      
      toast({ title: "Removido com sucesso" })
      router.refresh()
    } catch (e) {
      toast({ variant: "destructive", title: "Erro ao remover" })
    }
  }

  const handleCreateNew = () => {
    setCreateData({ hotel: hotelName } as any)
    setCreateOpen(true)
  }

  const formatDate = (val: string) => {
    try {
      if (!val) return val
      // Fix Timezone: Parse manual parts to ensure local date
      const [year, month, day] = val.split('-').map(Number)
      const date = new Date(year, month - 1, day)
      return format(date, 'dd MMM yyyy', { locale: ptBR })
    } catch { return val }
  }

  const toCurrency = (val: number) => 
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD' }).format(val)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-100/80 p-1 rounded-xl w-fit border border-slate-200/50">
            <button
              onClick={() => setTransportFilter('all')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                transportFilter === 'all' 
                  ? "bg-white shadow-sm text-slate-900" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
              )}
            >
              Todos
            </button>
            <button
              onClick={() => setTransportFilter('bus')}
              className={cn(
                "flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                transportFilter === 'bus' 
                  ? "bg-white shadow-sm text-amber-600" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
              )}
            >
              <Bus className="w-4 h-4" /> Bus
            </button>
            <button
              onClick={() => setTransportFilter('aereo')}
              className={cn(
                "flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                transportFilter === 'aereo' 
                  ? "bg-white shadow-sm text-sky-600" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
              )}
            >
              <Plane className="w-4 h-4" /> Aéreo
            </button>
        </div>
        
        <Button onClick={handleCreateNew} className="bg-orange-600 hover:bg-orange-700 text-white shadow-sm gap-2 rounded-lg">
          <Plus className="w-4 h-4" /> Nova Saída
        </Button>
      </div>

      {/* Grid de Datas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {groupedDates.map((group) => (
          <div 
            key={`${group.date}-${group.transport}`}
            onClick={() => handleOpenDate(group.items)}
            className="group cursor-pointer flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-orange-300 hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-600 group-hover:bg-orange-100 transition-colors">
                   <Calendar className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                   <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Saída</span>
                   <span className="font-bold text-slate-800">{formatDate(group.date)}</span>
                </div>
              </div>
              <Badge variant="outline" className={cn(
                 "border-0 px-2 py-1",
                 group.transport === 'Aéreo' ? 'bg-sky-50 text-sky-700' : 'bg-amber-50 text-amber-700'
              )}>
                {group.transport === 'Aéreo' ? <Plane className="w-3 h-3 mr-1"/> : <Bus className="w-3 h-3 mr-1"/>}
                {group.transport}
              </Badge>
            </div>
            
            <div className="flex-1 space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Disponibilidade</p>
              <div className="flex flex-wrap gap-1.5">
                {group.items.map(item => (
                  <span key={item.id} className="inline-flex items-center px-2 py-1 bg-slate-50 border border-slate-100 rounded-md text-xs font-medium text-slate-600">
                    {item.quarto_tipo}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">A partir de</span>
              <span className="font-bold text-lg text-emerald-600 tracking-tight">{toCurrency(group.minPrice)}</span>
            </div>
          </div>
        ))}

        {groupedDates.length === 0 && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-slate-500">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-medium text-slate-900">Nenhuma data encontrada</p>
            <p className="text-sm mt-1">Adicione uma nova saída para começar a vender.</p>
          </div>
        )}
      </div>

      {/* Modal de Detalhes da Data */}
      <Dialog open={editDateOpen} onOpenChange={setEditDateOpen}>
        <DialogContent className="max-w-4xl rounded-xl border border-slate-200 bg-white p-0 overflow-hidden shadow-2xl">
          <DialogHeader className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
            <DialogTitle className="text-lg font-bold text-slate-900">Gerenciar Tarifário</DialogTitle>
            <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
              {selectedDateGroup.length > 0 && (
                <>
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-slate-400"/> {formatDate(selectedDateGroup[0].data_saida)}</span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1.5">
                     {selectedDateGroup[0].transporte === 'Aéreo' ? <Plane className="w-4 h-4 text-slate-400"/> : <Bus className="w-4 h-4 text-slate-400"/>} 
                     {selectedDateGroup[0].transporte}
                  </span>
                </>
              )}
            </div>
          </DialogHeader>

          <div className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-slate-100">
                  <TableHead className="pl-6">Tipo de Quarto</TableHead>
                  <TableHead>Capacidade</TableHead>
                  <TableHead>Preço Adulto</TableHead>
                  <TableHead>Preço Criança (4-5)</TableHead>
                  <TableHead className="text-right pr-6">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedDateGroup.map(item => (
                  <TableRow key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <TableCell className="pl-6 font-medium text-slate-700">{item.quarto_tipo}</TableCell>
                    <TableCell>{item.capacidade} <span className="text-xs text-slate-400">pax</span></TableCell>
                    <TableCell className="font-mono text-slate-700">{toCurrency(item.preco_adulto)}</TableCell>
                    <TableCell className="font-mono text-slate-500">{toCurrency(item.preco_crianca_4_5)}</TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-600" onClick={() => handleEditSingle(item)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-red-600" onClick={() => handleDeleteSingle(Number(item.id))}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="bg-blue-50/50 border-t border-blue-100 p-4 flex gap-3">
            <Info className="w-5 h-5 text-blue-600 shrink-0" />
            <p className="text-xs text-blue-700 leading-relaxed">
               Dica: Para adicionar um novo tipo de quarto nesta data (ex: Quíntuplo), use o botão <strong>Nova Saída</strong> na tela anterior e selecione a mesma data de saída. O sistema irá agrupar automaticamente.
            </p>
          </div>

          <DialogFooter className="bg-slate-50 px-6 py-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setEditDateOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição Unitária */}
      <DisponibilidadeForm 
        open={editSingleOpen} 
        onOpenChange={setEditSingleOpen} 
        initialData={editSingleData} 
        mode="edit" 
      />

      {/* Modal de Criação */}
      <DisponibilidadeForm 
        open={createOpen} 
        onOpenChange={setCreateOpen} 
        initialData={createData} 
        mode="create" 
      />
    </div>
  )
}
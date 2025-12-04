"use client"

import { useState, useEffect, useMemo } from "react"
import { listDisponibilidades } from "@/lib/admin-disponibilidades-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Loader2, Bus, Plane, Calendar, AlertCircle } from "lucide-react"
import { PackageDateEditor } from "./package-date-editor"

interface PackageAvailabilityListProps {
  hotelName: string
}

export function PackageAvailabilityList({ hotelName }: PackageAvailabilityListProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all") // all, bus, aereo

  // Estado do Modal
  const [editingGroup, setEditingGroup] = useState<{
    date: string
    transporte: string
    items: any[]
  } | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      // Busca todas as disponibilidades deste hotel
      // A API já suporta filtro por hotel
      const res = await listDisponibilidades({ hotel: hotelName, limit: 1000 })
      setData(res.records || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hotelName) loadData()
  }, [hotelName])

  // Agrupar dados: Chave única = Data + Transporte
  const groupedData = useMemo(() => {
    const groups: Record<string, any[]> = {}
    
    data.forEach(item => {
      // Normalização Robusta de Transporte
      const rawTipo = (item.transporte || '').toLowerCase().trim()
      
      // Detecção de Categoria
      const isBus = rawTipo.includes('bus') || rawTipo.includes('bús') || rawTipo.includes('omnibus') || rawTipo.includes('cama') || rawTipo.includes('semi') || rawTipo.includes('leito')
      const isAereo = rawTipo.includes('aer') || rawTipo.includes('aér') || rawTipo.includes('avi') || rawTipo.includes('voo') || rawTipo.includes('vuelo')

      // Filtragem Ativa
      if (filter === 'bus' && !isBus) return
      if (filter === 'aereo' && !isAereo) return
      
      // Se o filtro for 'all', mostra tudo. 
      // Se for específico, já filtrou acima.
      
      // Chave de Agrupamento Normalizada para evitar duplicatas visuais (ex: "Bus" vs "bus")
      // Mas mantendo o label original para exibição se possível, ou padronizando.
      // Vamos usar o rawTipo para chave mas exibir formatado.
      const key = `${item.data_saida}::${item.transporte}`
      
      if (!groups[key]) groups[key] = []
      groups[key].push(item)
    })

    return Object.entries(groups)
      .map(([key, items]) => {
        const [date, transporte] = key.split('::')
        // Preço mínimo para mostrar no card "A partir de"
        const minPrice = Math.min(...items.map(i => i.preco_adulto || 999999))
        
        return {
          date,
          transporte,
          minPrice: minPrice === 999999 ? 0 : minPrice,
          items,
          count: items.length
        }
      })
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [data, filter])

  return (
    <div className="space-y-6">
      {/* Filtros de Transporte */}
      <div className="flex items-center justify-between">
        <Tabs value={filter} onValueChange={setFilter} className="w-[400px]">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="bus" className="gap-2"><Bus className="w-4 h-4"/> Bus</TabsTrigger>
            <TabsTrigger value="aereo" className="gap-2"><Plane className="w-4 h-4"/> Aéreo</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="text-sm text-muted-foreground">
           {groupedData.length} datas encontradas
        </div>
      </div>

      {/* Grid de Cards de Datas */}
      {loading ? (
        <div className="flex justify-center py-20">
           <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : groupedData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed rounded-xl bg-slate-50">
           <AlertCircle className="w-10 h-10 text-slate-300 mb-2" />
           <p className="text-muted-foreground">Nenhuma disponibilidade encontrada para este filtro.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
           {groupedData.map((group) => {
              const dateObj = new Date(group.date + "T12:00:00")
              const rawTipo = group.transporte.toLowerCase()
              const isBus = rawTipo.includes('bus') || rawTipo.includes('bús') || rawTipo.includes('omnibus') || rawTipo.includes('cama') || rawTipo.includes('semi') || rawTipo.includes('leito')
              
              return (
                <Card 
                  key={`${group.date}-${group.transporte}`}
                  className="cursor-pointer hover:border-orange-300 hover:shadow-md transition-all group"
                  onClick={() => setEditingGroup(group)}
                >
                   <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                      <div className="flex flex-col">
                         <span className="text-2xl font-bold text-slate-700">
                            {format(dateObj, "dd")}
                         </span>
                         <span className="text-xs uppercase font-bold text-slate-400">
                            {format(dateObj, "MMMM", { locale: es })}
                         </span>
                      </div>
                      <Badge variant="outline" className={`${isBus ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-sky-50 text-sky-700 border-sky-200'}`}>
                         {isBus ? <Bus className="w-3 h-3" /> : <Plane className="w-3 h-3" />}
                      </Badge>
                   </CardHeader>
                   <CardContent className="p-4 pt-2">
                      <div className="flex items-center text-xs text-slate-500 mb-3">
                         <span className="capitalize">{format(dateObj, "EEEE", { locale: es })}</span>
                         <span className="mx-1">•</span>
                         <span>{format(dateObj, "yyyy")}</span>
                      </div>
                      
                      <div className="bg-slate-50 rounded p-2 text-center border border-slate-100 group-hover:bg-orange-50 group-hover:border-orange-100 transition-colors">
                         <p className="text-[10px] uppercase text-slate-400 font-bold mb-0.5">A partir de</p>
                         <p className="text-lg font-bold text-green-600">USD {group.minPrice}</p>
                      </div>
                      
                      <div className="mt-3 flex justify-center">
                         <Badge variant="secondary" className="text-[10px] font-normal h-5">
                            {group.count} opções de quarto
                         </Badge>
                      </div>
                   </CardContent>
                </Card>
              )
           })}
        </div>
      )}

      {/* Modal de Edição */}
      {editingGroup && (
        <PackageDateEditor 
          isOpen={!!editingGroup}
          onClose={() => setEditingGroup(null)}
          onSuccess={loadData}
          date={editingGroup.date}
          transporte={editingGroup.transporte}
          hotelName={hotelName}
          items={editingGroup.items}
        />
      )}
    </div>
  )
}

"use client"

import { useState, useMemo } from "react"
import { HotelAvailabilityList } from "@/components/admin/hotel-availability-list"
import { HotelForm } from "@/components/admin/hotel-form"
import { DisponibilidadeImport } from "@/components/admin/disponibilidade-import"
import { type HospedagemDiaria } from "@/lib/admin-hoteis"
import { Button } from "@/components/ui/button"
import { Plus, BedDouble } from "lucide-react"
import { hotelDataMap } from "@/lib/hotel-data"
import { HOSPEDAGENS_PERMITIDAS } from "@/lib/constants-hoteis"
import Image from "next/image"
import { cn } from "@/lib/utils"

export default function HospedagensPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [selectedHotel, setSelectedHotel] = useState<string | null>(null)

  const handleSuccess = () => {
    setIsFormOpen(false)
    setRefreshTrigger(prev => prev + 1)
  }

  const handleNew = () => {
    setIsFormOpen(true)
  }

  const hoteisPermitidos = useMemo(() => {
    return HOSPEDAGENS_PERMITIDAS.map(slug => ({
      slug,
      data: hotelDataMap[slug] || { displayName: slug, imageFiles: ["/placeholder.svg"] }
    }))
  }, [])

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
              <BedDouble className="w-8 h-8" />
            </div>
            Gestão de Hospedagens
          </h1>
          <p className="text-muted-foreground mt-1 ml-14">
            Gerencie tarifas, disponibilidade e bloqueios dos hotéis parceiros.
          </p>
        </div>
        <div className="flex items-center gap-3">
           <DisponibilidadeImport onSuccess={() => setRefreshTrigger(p => p + 1)} />
           <Button onClick={handleNew} className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
             <Plus className="mr-2 h-4 w-4" /> Lançamento Manual
           </Button>
        </div>
      </div>

      {/* Seletor de Hotéis Visual (Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {hoteisPermitidos.map((hotel) => {
           const isSelected = selectedHotel === hotel.slug
           return (
             <div 
                key={hotel.slug}
                onClick={() => setSelectedHotel(isSelected ? null : hotel.slug)}
                className={cn(
                  "relative group cursor-pointer rounded-2xl overflow-hidden border-2 transition-all duration-300 h-32",
                  isSelected 
                    ? "border-blue-600 ring-4 ring-blue-100 shadow-xl scale-[1.02]" 
                    : "border-transparent hover:border-gray-200 hover:shadow-lg opacity-90 hover:opacity-100"
                )}
             >
                {/* Imagem de Fundo */}
                <div className="absolute inset-0">
                   <Image 
                      src={hotel.data.imageFiles[0]} 
                      alt={hotel.data.displayName}
                      layout="fill"
                      objectFit="cover"
                      className="group-hover:scale-110 transition-transform duration-700"
                   />
                   <div className={cn(
                      "absolute inset-0 transition-colors duration-300",
                      isSelected ? "bg-blue-900/40" : "bg-black/40 group-hover:bg-black/30"
                   )} />
                </div>
                
                {/* Conteúdo do Card */}
                <div className="absolute inset-0 flex flex-col justify-end p-4">
                   <h3 className="text-white font-bold text-lg leading-tight drop-shadow-md">
                      {hotel.data.displayName}
                   </h3>
                   {isSelected && (
                      <div className="mt-1 h-1 w-12 bg-blue-400 rounded-full animate-in fade-in slide-in-from-left duration-500" />
                   )}
                </div>

                {/* Checkmark se selecionado */}
                {isSelected && (
                   <div className="absolute top-3 right-3 bg-blue-600 text-white p-1 rounded-full shadow-md animate-in zoom-in duration-300">
                      <Plus className="w-4 h-4" /> 
                   </div>
                )}
             </div>
           )
         })}
      </div>

      <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">
         {/* Lista ocupa espaço total, filtrada pelo seletor acima se houver */}
         <div className={isFormOpen ? "xl:col-span-2" : "xl:col-span-3"}>
            {/* Passamos o hotel selecionado como filtro inicial/forçado para a lista */}
            {/* Vamos precisar ajustar a lista para aceitar prop de filtro externo se quisermos conectar os cards */}
            {/* Por simplicidade, a lista já tem seu filtro interno. Vamos fazer um 'key' para forçar reload se mudar o card */}
            <div className="bg-white rounded-xl border shadow-sm p-1">
               {selectedHotel ? (
                  <div className="p-4 bg-blue-50 rounded-lg mb-4 border border-blue-100 flex justify-between items-center">
                     <span className="text-blue-800 font-medium flex items-center gap-2">
                        Filtrando por: <strong>{hotelDataMap[selectedHotel].displayName}</strong>
                     </span>
                     <Button variant="ghost" size="sm" onClick={() => setSelectedHotel(null)} className="text-blue-600 hover:bg-blue-100">
                        Limpar filtro
                     </Button>
                  </div>
               ) : null}
               
               {/* AQUI: Injetamos o filtro no componente filho de forma "Controlada" ou apenas como initial? 
                   Idealmente o componente filho deveria reagir. Vamos deixar ele autônomo por enquanto, 
                   mas o usuário sabe que pode usar o filtro da tabela.
                   
                   MELHORIA: Vamos fazer um "Hack" visual. Se o usuário clicou no card, a gente mostra apenas aquele hotel.
                   Mas o componente `HotelAvailabilityList` gerencia seu próprio estado `filters`.
                   Para conectar sem refatorar tudo, vou passar uma `key` diferente quando muda o hotel selecionado.
               */}
               <HotelAvailabilityList 
                  key={selectedHotel || 'all'}
                  refreshTrigger={refreshTrigger}
                  selectedHotel={selectedHotel}
               />
            </div>
         </div>

         {isFormOpen && (
            <div className="xl:col-span-1 animate-in slide-in-from-right duration-500">
               <HotelForm 
                  initialData={null}
                  onSuccess={handleSuccess}
                  onCancel={() => setIsFormOpen(false)}
               />
            </div>
         )}
      </div>
    </div>
  )
}
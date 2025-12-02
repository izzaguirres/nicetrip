"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MapPin, ArrowRight, Plus, Bus, Plane, Calendar, Package } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { getHotelData } from '@/lib/hotel-data'
import { DisponibilidadeForm } from './disponibilidade-form'

export interface DashboardHotel {
  hotel: string
  destino: string
  transports: string[]
  slug: string
  count: number
  minPrice: number
}

interface DisponibilidadesTableProps {
  hotels: DashboardHotel[]
}

export function DisponibilidadesTable({
  hotels,
}: DisponibilidadesTableProps) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'create' | 'edit' | 'duplicate'>('create')

  const openCreateForm = () => {
    setMode('create')
    setOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header da Página */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Meus Produtos</h2>
          <p className="text-sm text-slate-500 mt-1">
            Gerencie os pacotes e hotéis disponíveis para venda.
          </p>
        </div>
        <Button
          onClick={openCreateForm}
          className="bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Disponibilidade
        </Button>
      </div>

      {/* Grid de Cards Limpos */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {hotels.map((hotel) => {
          // Buscar imagem (usando helper de frontend como fallback)
          const hotelData = getHotelData(hotel.hotel)
          const imageSrc = hotelData?.imageFiles?.[0] || "/placeholder.svg"

          return (
          <Link 
            key={hotel.slug} 
            href={`/admin/hoteis/${hotel.slug}?name=${encodeURIComponent(hotel.hotel)}`}
            className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-orange-200"
          >
            {/* Imagem Capa */}
            <div className="relative h-48 w-full overflow-hidden bg-slate-100">
              <Image 
                src={imageSrc} 
                alt={hotel.hotel} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-80" />
              
              {/* Badges de Transporte */}
              <div className="absolute top-3 right-3 flex gap-1.5">
                {hotel.transports.some(t => t.toLowerCase().includes('aer') || t.toLowerCase().includes('avi')) && (
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-sky-600 shadow-sm backdrop-blur-sm" title="Aéreo">
                    <Plane className="h-4 w-4" />
                  </div>
                )}
                {hotel.transports.some(t => t.toLowerCase().includes('bus')) && (
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-amber-600 shadow-sm backdrop-blur-sm" title="Ônibus">
                    <Bus className="h-4 w-4" />
                  </div>
                )}
              </div>
              
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="font-bold text-lg leading-snug line-clamp-2">{hotel.hotel}</h3>
                <div className="flex items-center gap-1.5 text-xs font-medium opacity-90 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-400" />
                  {hotel.destino}
                </div>
              </div>
            </div>

            {/* Corpo do Card */}
            <div className="flex flex-1 flex-col justify-between p-4">
              <div className="grid grid-cols-2 gap-4 py-2">
                 <div className="space-y-0.5">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Saídas</p>
                    <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                       <Calendar className="w-4 h-4 text-slate-400" />
                       {hotel.count}
                    </div>
                 </div>
                 <div className="space-y-0.5 text-right">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">A partir de</p>
                    <p className="text-emerald-600 font-bold">USD {hotel.minPrice}</p>
                 </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500 group-hover:text-orange-600 transition-colors">
                <span>Gerenciar produto</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        )})}

        {/* Empty State */}
        {hotels.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center border border-dashed border-slate-300 rounded-xl bg-slate-50">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
              <Package className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Sem produtos cadastrados</h3>
            <p className="text-sm text-slate-500 max-w-xs mt-2 mb-6">
              Comece importando um CSV ou criando uma disponibilidade manualmente.
            </p>
            <Button onClick={openCreateForm} variant="default">
              Criar Disponibilidade
            </Button>
          </div>
        )}
      </div>

      {/* Modal de Criação Rápida */}
      <DisponibilidadeForm open={open} onOpenChange={setOpen} mode={mode} />
    </div>
  )
}

"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AdminSurface } from "@/components/admin/surface"
import { PromotionForm, PromotionFormData } from "@/components/admin/promotion-form"
import type { Promotion, PromotionType } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { Trash2, Pencil, ArrowUp, ArrowDown, Plus, MapPin, Calendar, Bus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PromotionListProps {
  type: PromotionType
  label: string
  items: Promotion[]
}

const formatter = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD' })
const dateFormatter = new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })

const sectionCopy: Record<PromotionType, { title: string; description: string }> = {
  paquete: {
    title: 'Promociones Paquetes',
    description: 'Curá las salidas con transporte incluido y mantené visibles las tarifas que querés empujar en la landing.',
  },
  hospedaje: {
    title: 'Promociones Hospedajes',
    description: 'Destacá hoteles y habitaciones con disponibilidad fresca para que el equipo comercial use como vitrina.',
  },
  paseo: {
    title: 'Promociones Paseos',
    description: 'Organizá excursiones y actividades destacadas para cruzar com upsell en la home.',
  },
}

export function PromotionList({ type, label, items }: PromotionListProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<PromotionFormData | null>(null)
  const [localItems, setLocalItems] = useState(items)

  useEffect(() => {
    setLocalItems(items)
  }, [items])

  const ordered = useMemo(
    () => [...localItems].sort((a, b) => a.position - b.position),
    [localItems],
  )

  const openNewForm = () => {
    setEditing({ type, title: '', is_active: true, departure_date: '' } as PromotionFormData)
    setFormOpen(true)
  }

  const openEditForm = (promotion: Promotion) => {
    setEditing({
      id: promotion.id,
      type: promotion.type,
      title: promotion.title,
      subtitle: promotion.subtitle ?? '',
      destino: promotion.destino ?? '',
      hotel: promotion.hotel ?? '',
      transporte: promotion.transporte ?? '',
      departure_date: promotion.departure_date ?? '',
      slug_disponibilidad: promotion.slug_disponibilidade ?? '',
      slug_hospedagem: promotion.slug_hospedagem ?? '',
      slug_paseo: promotion.slug_paseo ?? '',
      price_single: promotion.price_single?.toString() ?? '',
      price_double: promotion.price_double?.toString() ?? '',
      price_triple: promotion.price_triple?.toString() ?? '',
      price_quad: promotion.price_quad?.toString() ?? '',
      price_quint: promotion.price_quint?.toString() ?? '',
      cta_label: promotion.cta_label ?? '',
      cta_url: promotion.cta_url ?? '',
      image_url: promotion.image_url ?? '',
      is_active: promotion.is_active,
    })
    setFormOpen(true)
  }

  const refresh = () => router.refresh()

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja remover esta promoção?')) return
    const response = await fetch(`/api/admin/promotions?id=${id}`, { method: 'DELETE' })
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      toast({ variant: 'destructive', title: 'Erro ao remover', description: data.error })
      return
    }
    toast({ title: 'Promoção removida', description: 'O card não aparecerá mais na home.' })
    refresh()
  }

  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    const next = [...ordered]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= next.length) return
    const temp = next[index]
    next[index] = next[targetIndex]
    next[targetIndex] = temp
    setLocalItems(next)
    await fetch('/api/admin/promotions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: next.map((item) => item.id) }),
    })
    refresh()
  }

  const priceEntries = (promotion: Promotion) => {
    let labels = [
      { key: "price_single", label: "Single" },
      { key: "price_double", label: "Doble" },
      { key: "price_triple", label: "Triple" },
      { key: "price_quad", label: "Quad" },
      { key: "price_quint", label: "Quint" },
    ]

    if (promotion.type === 'hospedaje') {
      labels = [
        { key: "price_single", label: "Diária" },
        { key: "price_double", label: "Pct 7d" },
        { key: "price_triple", label: "Total" },
        { key: "price_quad", label: "Extra" },
        { key: "price_quint", label: "Extra 2" },
      ]
    } else if (promotion.type === 'paseo') {
      labels = [
        { key: "price_single", label: "Adulto" },
        { key: "price_double", label: "Niño (4-5)" },
        { key: "price_triple", label: "Niño (6+)" },
        { key: "price_quad", label: "Grupo" },
        { key: "price_quint", label: "Privado" },
      ]
    }

    const entries = labels.map(item => ({
      label: item.label,
      value: (promotion as any)[item.key]
    }))

    return entries.filter((entry) => entry.value != null)
  }

  return (
    <AdminSurface className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Home & Landing Page</p>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{sectionCopy[type].title}</h2>
          <p className="text-sm text-slate-500 mt-1">{sectionCopy[type].description}</p>
        </div>
        <Button
          onClick={openNewForm}
          className="bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" /> Nueva promoción
        </Button>
      </div>

      <div className="space-y-4">
        {ordered.length === 0 && (
           <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
              <p className="text-sm text-slate-500">Nenhuma promoção cadastrada para esta categoria.</p>
           </div>
        )}
        
        {ordered.map((promotion, index) => (
          <div
            key={promotion.id}
            className={cn(
              'group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-orange-200',
              !promotion.is_active && 'opacity-60 grayscale-[0.5]'
            )}
          >
            <div className="flex flex-col md:flex-row">
              {/* Imagem */}
              <div className="relative h-48 md:h-auto md:w-64 lg:w-72 flex-shrink-0 bg-slate-100">
                {promotion.image_url ? (
                  <Image
                    src={promotion.image_url}
                    alt={promotion.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">Sem imagem</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent md:bg-gradient-to-r" />
                
                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                   {!promotion.is_active ? (
                      <Badge variant="secondary" className="bg-slate-900/80 text-white border-0 backdrop-blur-sm">Inativo</Badge>
                   ) : (
                      <Badge className="bg-emerald-500/90 hover:bg-emerald-600 text-white border-0 backdrop-blur-sm shadow-sm">Ativo</Badge>
                   )}
                </div>
              </div>

              {/* Conteúdo */}
              <div className="flex flex-1 flex-col justify-between p-5 md:p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 leading-tight">{promotion.title}</h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{promotion.subtitle || 'Sin subtítulo.'}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {promotion.transporte && (
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                        <Bus className="w-3 h-3" /> {promotion.transporte}
                      </span>
                    )}
                    {promotion.departure_date && (
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        <Calendar className="w-3 h-3" />
                        {(() => {
                          try {
                            return dateFormatter.format(new Date(`${promotion.departure_date}T00:00:00`))
                          } catch {
                            return promotion.departure_date
                          }
                        })()}
                      </span>
                    )}
                    {promotion.destino && (
                       <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          <MapPin className="w-3 h-3" /> {promotion.destino}
                       </span>
                    )}
                  </div>

                  {/* Preços Grid */}
                  {priceEntries(promotion).length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 pt-2">
                      {priceEntries(promotion).map((entry) => (
                        <div key={entry.label} className="rounded-lg border border-slate-100 bg-slate-50/50 p-2 text-center">
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">{entry.label}</p>
                          <p className="text-sm font-bold text-slate-900">{formatter.format(entry.value || 0)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer / Actions */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
                   <div className="text-xs text-slate-400">
                      {promotion.cta_url ? `Link: ${promotion.cta_url}` : 'Sem link configurado'}
                   </div>
                   
                   <div className="flex items-center gap-2">
                      <div className="flex bg-slate-100 rounded-lg p-0.5 mr-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 rounded-md p-0 hover:bg-white hover:shadow-sm"
                          onClick={() => handleReorder(index, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-3.5 w-3.5 text-slate-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 rounded-md p-0 hover:bg-white hover:shadow-sm"
                          onClick={() => handleReorder(index, 'down')}
                          disabled={index === ordered.length - 1}
                        >
                          <ArrowDown className="h-3.5 w-3.5 text-slate-500" />
                        </Button>
                      </div>
                      
                      <Button variant="outline" size="sm" onClick={() => openEditForm(promotion)} className="h-8">
                        <Pencil className="mr-1.5 h-3.5 w-3.5" /> Editar
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(promotion.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                   </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <PromotionForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditing(null)
        }}
        initialData={editing || undefined}
        onSaved={refresh}
      />
    </AdminSurface>
  )
}

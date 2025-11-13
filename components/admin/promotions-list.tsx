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
import { Trash2, Pencil, ArrowUp, ArrowDown, Plus } from "lucide-react"
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
    const entries: { label: string; value: number | null }[] = [
      { label: 'Single', value: promotion.price_single },
      { label: 'Doble', value: promotion.price_double },
      { label: 'Triple', value: promotion.price_triple },
      { label: 'Quadruple', value: promotion.price_quad },
      { label: 'Quintuple', value: promotion.price_quint },
    ]
    return entries.filter((entry) => entry.value != null)
  }

  return (
    <AdminSurface className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Home · {label}</p>
          <h2 className="text-2xl font-semibold text-slate-900">{sectionCopy[type].title}</h2>
          <p className="mt-2 text-sm text-slate-500">{sectionCopy[type].description}</p>
        </div>
        <Button
          onClick={openNewForm}
          className="h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 px-6 text-white shadow-lg"
        >
          <Plus className="mr-2 h-4 w-4" /> Nueva promoción
        </Button>
      </div>

      <div className="space-y-4">
        {ordered.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma promoção cadastrada para esta categoria.</p>}
        {ordered.map((promotion, index) => (
          <div
            key={promotion.id}
            className={cn(
              'rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-[0_28px_70px_rgba(15,23,42,0.1)] backdrop-blur-xl',
              !promotion.is_active && 'opacity-70'
            )}
          >
            <div className="flex flex-col gap-6 lg:flex-row">
              <div className="relative w-full overflow-hidden rounded-[28px] bg-slate-100 lg:w-64 lg:flex-shrink-0">
                {promotion.image_url ? (
                  <Image
                    src={promotion.image_url}
                    alt={promotion.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 256px"
                    className="object-cover"
                    priority={false}
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center text-sm text-slate-500">Sin imagen</div>
                )}
                {promotion.transporte && (
                  <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow">
                    {promotion.transporte}
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-semibold text-slate-900">{promotion.title}</h3>
                    {!promotion.is_active && <Badge variant="secondary">Inactivo</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{promotion.subtitle || 'Sin subtítulo cargado.'}</p>
                </div>

                <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                  {promotion.transporte && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-orange-600">
                      Transporte · {promotion.transporte}
                    </span>
                  )}
                  {promotion.departure_date && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-slate-600">
                      Salida · {(() => {
                        try {
                          return dateFormatter.format(new Date(`${promotion.departure_date}T00:00:00`))
                        } catch {
                          return promotion.departure_date
                        }
                      })()}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                  {promotion.destino && <span className="rounded-full bg-slate-100 px-3 py-1">Destino · {promotion.destino}</span>}
                  {promotion.hotel && <span className="rounded-full bg-slate-100 px-3 py-1">Hotel · {promotion.hotel}</span>}
                </div>

                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Tarifas por habitación</p>
                  <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                    {priceEntries(promotion).map((entry) => (
                      <div
                        key={entry.label}
                        className="flex items-center justify-between rounded-2xl bg-white/90 px-3 py-2 text-sm text-slate-700 shadow-inner"
                      >
                        <dt className="font-semibold">{entry.label}</dt>
                        <dd>{formatter.format(entry.value || 0)}</dd>
                      </div>
                    ))}
                    {priceEntries(promotion).length === 0 && (
                      <span className="text-sm text-slate-400">Sin tarifas cargadas.</span>
                    )}
                  </dl>
                </div>

                {promotion.cta_url && (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white/80 px-4 py-3 text-xs text-slate-500">
                    CTA / enlace: {promotion.cta_url}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 rounded-3xl border border-slate-100 bg-white/90 p-4 text-sm lg:w-52">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Acciones</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    onClick={() => handleReorder(index, 'up')}
                    disabled={index === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    onClick={() => handleReorder(index, 'down')}
                    disabled={index === ordered.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="outline" className="justify-center" onClick={() => openEditForm(promotion)}>
                  <Pencil className="mr-2 h-4 w-4" /> Editar
                </Button>
                <Button variant="ghost" className="justify-center text-red-500 hover:bg-red-50" onClick={() => handleDelete(promotion.id)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                </Button>
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

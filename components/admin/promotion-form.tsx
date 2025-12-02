"use client"

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react"
import { z } from "zod"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { adminInputClass, adminSelectTriggerClass } from "@/components/admin/styles"
import { SingleSelectCombobox, type SingleSelectOption } from "@/components/admin/single-select-combobox"

const formSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.enum(["paquete", "hospedaje", "paseo"]),
  title: z.string().min(2, "Informe o título"),
  subtitle: z.string().optional(),
  destino: z.string().optional(),
  hotel: z.string().optional(),
  transporte: z.string().nullable().optional(),
  departure_date: z.string().nullable().optional(),
  price_single: z.string().optional(),
  price_double: z.string().optional(),
  price_triple: z.string().optional(),
  price_quad: z.string().optional(),
  price_quint: z.string().optional(),
  cta_label: z.string().optional(),
  cta_url: z.string().optional(),
  image_url: z.string().optional(),
  valid_until: z.string().optional(),
  auto_hide: z.boolean().optional(),
  is_active: z.boolean().optional(),
})

const getPriceLabels = (type: "paquete" | "hospedaje" | "paseo") => {
  if (type === "hospedaje") {
    return [
      { id: "price_single", label: "Diária (Média)" },
      { id: "price_double", label: "Pacote 7 Noites" },
      { id: "price_triple", label: "Total (Exemplo)" },
      { id: "price_quad", label: "Extra 1" },
      { id: "price_quint", label: "Extra 2" },
    ]
  }
  if (type === "paseo") {
    return [
      { id: "price_single", label: "Adulto" },
      { id: "price_double", label: "Niño (4-5)" },
      { id: "price_triple", label: "Niño (6+)" },
      { id: "price_quad", label: "Grupo (+4)" },
      { id: "price_quint", label: "Privado" },
    ]
  }
  // Default Paquete
  return [
    { id: "price_single", label: "Single" },
    { id: "price_double", label: "Doble" },
    { id: "price_triple", label: "Triple" },
    { id: "price_quad", label: "Quadruple" },
    { id: "price_quint", label: "Quintuple" },
  ]
}

const getDateLabel = (type: "paquete" | "hospedaje" | "paseo") => {
  if (type === "hospedaje") return "Check-in Sugerido"
  if (type === "paseo") return "Data do Passeio"
  return "Data de Saída"
}

export type PromotionFormData = z.infer<typeof formSchema>

interface PromotionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: PromotionFormData | null
  onSaved?: () => void
}

const defaultForm: PromotionFormData = {
  type: "paquete",
  title: "",
  subtitle: "",
  destino: "",
  hotel: "",
  transporte: "",
  departure_date: "",
  price_single: "",
  price_double: "",
  price_triple: "",
  price_quad: "",
  price_quint: "",
  cta_label: "",
  cta_url: "",
  image_url: "",
  valid_until: "",
  auto_hide: false,
  is_active: true,
}

const priceToNumber = (value?: string | null) => {
  if (!value) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const normalizeTextValue = (value?: string | null) =>
  (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

const normalizeTransportKey = (value?: string | null) => {
  const normalized = normalizeTextValue(value).replace(/[^a-z]/g, '')
  if (!normalized) return ''
  if (normalized.includes('aer')) return 'aereo'
  if (normalized.includes('bus')) return 'bus'
  return normalized
}

const formatTransportLabel = (value?: string | null) => {
  const key = normalizeTransportKey(value)
  if (key === 'aereo') return 'Aéreo'
  if (key === 'bus') return 'Bús'
  return value || ''
}

export function PromotionForm({ open, onOpenChange, initialData, onSaved }: PromotionFormProps) {
  const defaults = initialData ? { ...defaultForm, ...initialData } : defaultForm
  const [submitting, setSubmitting] = useState(false)
  const [typeValue, setTypeValue] = useState<"paquete" | "hospedaje" | "paseo">(defaults.type ?? "paquete")
  const { toast } = useToast()
  const formRef = useRef<HTMLFormElement | null>(null)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [transportOptions, setTransportOptions] = useState<SingleSelectOption[]>([])
  const [transportValue, setTransportValue] = useState(defaults.transporte || '')
  const [destinationOptions, setDestinationOptions] = useState<SingleSelectOption[]>([])
  const [destinationValue, setDestinationValue] = useState(defaults.destino || '')
  const [hotelOptions, setHotelOptions] = useState<SingleSelectOption[]>([])
  const [hotelValue, setHotelValue] = useState(defaults.hotel || '')
  const [dialogContainer, setDialogContainer] = useState<HTMLDivElement | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState(defaults.image_url || '')

  const filteredDestinations = useMemo(() => {
    if (typeValue !== 'paquete') return destinationOptions
    const transportKey = normalizeTransportKey(transportValue)
    if (!transportKey) return destinationOptions
    return destinationOptions.filter((option) => {
      const keys = (option.meta?.transportKeys as string[] | undefined) || []
      if (keys.length === 0) return true
      return keys.includes(transportKey)
    })
  }, [destinationOptions, transportValue, typeValue])

  const filteredHotels = useMemo(() => {
    if (typeValue !== 'paquete') return hotelOptions
    const transportKey = normalizeTransportKey(transportValue)
    const destinoKey = normalizeTextValue(destinationValue)
    return hotelOptions.filter((option) => {
      const optionTransportKeys = (option.meta?.transportKeys as string[] | undefined) || []
      if (transportKey && optionTransportKeys.length && !optionTransportKeys.includes(transportKey)) {
        return false
      }
      if (destinoKey) {
        const optionDestinationKey =
          typeof option.meta?.destinationKey === 'string'
            ? option.meta.destinationKey
            : option.meta?.destination
              ? normalizeTextValue(option.meta.destination as string)
              : null
        if (optionDestinationKey && optionDestinationKey !== destinoKey) {
          return false
        }
      }
      return true
    })
  }, [hotelOptions, transportValue, destinationValue, typeValue])

  useEffect(() => {
    setTypeValue(initialData?.type ?? "paquete")
    setTransportValue(initialData?.transporte || '')
    setDestinationValue(initialData?.destino || '')
    setHotelValue(initialData?.hotel || '')
    setImagePreview(initialData?.image_url || '')
  }, [initialData])

  const handleTypeChange = (value: string) => {
    const next = (value as 'paquete' | 'hospedaje' | 'paseo')
    setTypeValue(next)
    setTransportValue('')
    setDestinationValue('')
    setHotelValue('')
  }

  useEffect(() => {
    if (!open) return
    let active = true
    const loadLookups = async () => {
      setLookupLoading(true)
      try {
        const response = await fetch('/api/admin/lookups')
        if (!response.ok) throw new Error('Não foi possível carregar referências')
        const data = await response.json()
        if (!active) return

        const destinationsData = Array.isArray(data.destinations) ? data.destinations : []
        const hotelsData = Array.isArray(data.hotels) ? data.hotels : []

        const transportMap = new Map<string, string>()
        const registerTransport = (raw?: string | null) => {
          const key = normalizeTransportKey(raw)
          if (!key) return
          if (!transportMap.has(key)) {
            transportMap.set(key, formatTransportLabel(raw))
          }
        }
        destinationsData.forEach((dest: any) => {
          if (Array.isArray(dest.transports)) dest.transports.forEach((t: string) => registerTransport(t))
        })
        if (defaults.transporte) registerTransport(defaults.transporte)

        const transportOptions = Array.from(transportMap.entries()).map(([, label]) => ({
          value: label,
          label,
        }))
        setTransportOptions(transportOptions)

        const mappedDestinations: SingleSelectOption[] = destinationsData
          .map((dest: any) => {
            const value = dest.value ?? dest.label ?? ''
            if (!value) return null
            const transportKeys = Array.isArray(dest.transportKeys)
              ? dest.transportKeys
              : Array.isArray(dest.transports)
                ? dest.transports.map((t: string) => normalizeTransportKey(t))
                : []
            return {
              value,
              label: dest.label ?? value,
              description: dest.description,
              meta: { transportKeys },
            } satisfies SingleSelectOption
          })
          .filter(Boolean) as SingleSelectOption[]
        if (defaults.destino && !mappedDestinations.some((opt) => normalizeTextValue(opt.value) === normalizeTextValue(defaults.destino))) {
          mappedDestinations.unshift({
            value: defaults.destino,
            label: defaults.destino,
            meta: { transportKeys: [] },
          })
        }
        setDestinationOptions(mappedDestinations)

        const mappedHotels: SingleSelectOption[] = hotelsData
          .map((hotel: any) => {
            const value = hotel.value ?? hotel.label ?? ''
            if (!value) return null
            const transportKeys = Array.isArray(hotel.transportKeys)
              ? hotel.transportKeys
              : Array.isArray(hotel.transports)
                ? hotel.transports.map((t: string) => normalizeTransportKey(t))
                : []
            return {
              value,
              label: hotel.label ?? value,
              description: hotel.description,
              meta: {
                destinationKey: hotel.destinationKey,
                transportKeys,
                destination: hotel.destination,
              },
            } satisfies SingleSelectOption
          })
          .filter(Boolean) as SingleSelectOption[]
        if (defaults.hotel && !mappedHotels.some((opt) => normalizeTextValue(opt.value) === normalizeTextValue(defaults.hotel))) {
          mappedHotels.unshift({
            value: defaults.hotel,
            label: defaults.hotel,
            meta: { destination: defaults.destino, destinationKey: normalizeTextValue(defaults.destino) },
          })
        }
        setHotelOptions(mappedHotels)
      } catch (error) {
        console.error('[promotion-form] lookups error', error)
        toast({
          variant: 'destructive',
          title: 'Falha ao carregar referências',
          description: 'Os selects de Transporte/Destino/Hotel podem ficar incompletos. Tente reabrir o modal.',
        })
      } finally {
        if (active) setLookupLoading(false)
      }
    }
    loadLookups()
    return () => {
      active = false
    }
  }, [open, defaults.destino, defaults.hotel, defaults.transporte, toast])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    console.log("Submitting form...")
    setSubmitting(true)
    try {
      const formData = new FormData(event.currentTarget)
      const payload = formSchema.parse({
        id: defaults.id,
        type: typeValue,
        title: formData.get("title"),
        subtitle: formData.get("subtitle"),
        destino: formData.get("destino"),
        hotel: formData.get("hotel"),
        transporte: formData.get("transporte"),
        departure_date: formData.get("departure_date"),
        price_single: formData.get("price_single"),
        price_double: formData.get("price_double"),
        price_triple: formData.get("price_triple"),
        price_quad: formData.get("price_quad"),
        price_quint: formData.get("price_quint"),
        cta_label: formData.get("cta_label"),
        cta_url: formData.get("cta_url"),
        image_url: formData.get("image_url"),
        valid_until: formData.get("valid_until"),
        auto_hide: formData.get("auto_hide") === "on",
        is_active: formData.get("is_active") === "on",
      })
      console.log("Payload parsed:", payload)

      const numericPayload = {
        ...payload,
        departure_date: payload.departure_date && typeof payload.departure_date === 'string' && payload.departure_date.trim().length > 0
          ? payload.departure_date
          : null,
        price_single: priceToNumber(payload.price_single),
        price_double: priceToNumber(payload.price_double),
        price_triple: priceToNumber(payload.price_triple),
        price_quad: priceToNumber(payload.price_quad),
        price_quint: priceToNumber(payload.price_quint),
        valid_until: payload.valid_until && payload.valid_until.trim().length > 0 ? payload.valid_until : null,
        image_url: payload.image_url && payload.image_url.trim().length > 0 ? payload.image_url : null,
        auto_hide: payload.auto_hide,
        slug_disponibilidad: null,
        slug_hospedagem: null,
        slug_paseo: null,
      }

      console.log("Sending payload...", numericPayload)
      const response = await fetch('/api/admin/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(numericPayload),
      })
      console.log("Fetch response:", response.status, response.statusText)

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Erro ao salvar promoção')
      }

      toast({
        title: initialData ? 'Promoção atualizada' : 'Promoção criada',
        description: 'As alterações foram aplicadas com sucesso.',
      })
      onOpenChange(false)
      onSaved?.()
    } catch (error) {
      console.error("Submission error:", error)
      toast({
        variant: 'destructive',
        title: 'Falha ao salvar',
        description: error instanceof Error ? error.message : 'Erro inesperado',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const setFieldValue = (name: string, value: string) => {
    const form = formRef.current
    if (!form) return
    const field = form.elements.namedItem(name) as (HTMLInputElement | HTMLTextAreaElement | null)
    if (field) {
      field.value = value ?? ''
    }
  }

  const handleTransportSelect = (value: string | null) => {
    const normalized = value || ''
    setTransportValue(normalized)
    setFieldValue('transporte', normalized)
    setDestinationValue('')
    setHotelValue('')
  }

  const handleDestinationSelect = (value: string | null) => {
    const normalized = value || ''
    setDestinationValue(normalized)
    setFieldValue('destino', normalized)
    setHotelValue('')
  }

  const handleHotelSelect = (value: string | null) => {
    const normalized = value || ''
    setHotelValue(normalized)
    setFieldValue('hotel', normalized)
  }

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch('/api/admin/promotions/upload', {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Falha no upload da imagem')
      }
      const data = await response.json()
      if (data.url) {
        setImagePreview(data.url)
        setFieldValue('image_url', data.url)
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Falha no upload',
        description: error instanceof Error ? error.message : 'Erro inesperado',
      })
    } finally {
      setUploadingImage(false)
      event.target.value = ''
    }
  }

  const currentPriceFields = getPriceLabels(typeValue)
  const dateLabel = getDateLabel(typeValue)

  return (
    <Dialog open={open} onOpenChange={(val) => !submitting && onOpenChange(val)}>
      <DialogContent
        ref={setDialogContainer}
        className="w-[min(94vw,800px)] max-w-3xl overflow-hidden rounded-xl border border-slate-200 bg-white p-0 shadow-2xl"
      >
        <form ref={formRef} onSubmit={handleSubmit} className="flex max-h-[82vh] flex-col">
          <DialogHeader className="space-y-1 border-b border-slate-100 bg-slate-50/50 px-8 py-5">
            <DialogTitle className="text-xl font-bold text-slate-900">
              {initialData ? 'Editar promoção' : 'Nova promoção'}
            </DialogTitle>
            <p className="text-sm text-slate-500">
              Configure o destaque que aparecerá na home para o tipo selecionado.
            </p>
          </DialogHeader>

          <div className="flex-1 space-y-6 overflow-y-auto px-8 py-6 bg-slate-50/30">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="type" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Categoria</Label>
                  <Select name="type" value={typeValue} onValueChange={handleTypeChange} disabled={!!initialData}>
                    <SelectTrigger className={adminSelectTriggerClass}>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paquete">Paquetes</SelectItem>
                      <SelectItem value="hospedaje">Hospedajes</SelectItem>
                      <SelectItem value="paseo">Passeios</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="title" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Título</Label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={defaults.title}
                    required
                    className={adminInputClass}
                    onChange={(event) => event.currentTarget.setAttribute('data-user-edited', 'true')}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subtitle" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Descrição / Subtítulo</Label>
                <Textarea id="subtitle" name="subtitle" defaultValue={defaults.subtitle || ''} className="min-h-[80px] bg-white border-slate-200" />
              </div>
            </div>

            <div className="space-y-4 border-t border-slate-200 pt-6">
              <h4 className="text-sm font-semibold text-slate-900">Origem & Destino</h4>
              <div className="grid gap-4 md:grid-cols-4">
                {typeValue === 'paquete' && (
                  <div className="grid gap-2">
                    <Label htmlFor="transporte" className="text-xs font-medium text-slate-500">Transporte</Label>
                    <SingleSelectCombobox
                      name="transporte"
                      value={transportValue || null}
                      onChange={handleTransportSelect}
                      options={transportOptions}
                      placeholder={lookupLoading ? 'Carregando...' : 'Selecione'}
                      allowCustomValue={false}
                      disabled={lookupLoading}
                      portalContainer={dialogContainer}
                    />
                  </div>
                )}
                <div className={typeValue === 'paquete' ? "grid gap-2" : "grid gap-2 md:col-span-2"}>
                  <Label htmlFor="destino" className="text-xs font-medium text-slate-500">Destino</Label>
                  {typeValue === 'paquete' ? (
                    <SingleSelectCombobox
                      name="destino"
                      value={destinationValue || null}
                      onChange={handleDestinationSelect}
                      options={filteredDestinations}
                      placeholder={transportValue ? 'Selecione' : 'Aguardando'}
                      allowCustomValue={false}
                      disabled={!transportValue || lookupLoading}
                      portalContainer={dialogContainer}
                    />
                  ) : (
                    <Input id="destino" name="destino" defaultValue={defaults.destino || ''} className={adminInputClass} />
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="hotel" className="text-xs font-medium text-slate-500">Hotel / Nome</Label>
                  {typeValue === 'paquete' ? (
                    <SingleSelectCombobox
                      name="hotel"
                      value={hotelValue || null}
                      onChange={handleHotelSelect}
                      options={filteredHotels}
                      placeholder={destinationValue ? 'Selecione' : 'Aguardando'}
                      allowCustomValue={false}
                      disabled={!destinationValue || lookupLoading}
                      portalContainer={dialogContainer}
                    />
                  ) : (
                    <Input id="hotel" name="hotel" defaultValue={defaults.hotel || ''} className={adminInputClass} />
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="departure_date" className="text-xs font-medium text-slate-500">{dateLabel}</Label>
                  <Input
                    id="departure_date"
                    name="departure_date"
                    type="date"
                    defaultValue={defaults.departure_date || ''}
                    className={adminInputClass}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="image_url" className="text-xs font-medium text-slate-500">Imagem destaque (URL)</Label>
                  <Input
                    id="image_url"
                    name="image_url"
                    type="url"
                    defaultValue={defaults.image_url || ''}
                    onChange={(event) => setImagePreview(event.target.value)}
                    className={adminInputClass}
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs font-medium text-slate-500">Ou envie uma imagem</Label>
                  <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded-full file:bg-slate-100 file:text-slate-700" />
                  {uploadingImage && <p className="text-xs text-slate-500">Enviando...</p>}
                  {imagePreview && (
                    <div className="overflow-hidden rounded-lg border border-slate-200 mt-2">
                      <img src={imagePreview} alt="Pré-visualização" className="h-32 w-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t border-slate-200 pt-6">
              <h4 className="text-sm font-semibold text-slate-900">Tabela de Preços</h4>
              <div className="grid gap-3 md:grid-cols-3">
                {currentPriceFields.map((field) => (
                  <div className="grid gap-1" key={field.id}>
                    <Label htmlFor={field.id} className="text-xs font-medium text-slate-500">
                      {field.label}
                    </Label>
                    <Input
                      id={field.id}
                      name={field.id}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      defaultValue={(defaults as any)[field.id]?.toString() || ''}
                      className={adminInputClass}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 border-t border-slate-200 pt-6">
              <h4 className="text-sm font-semibold text-slate-900">Automação & Status</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="valid_until" className="text-xs font-medium text-slate-500">Válido até</Label>
                        <Input
                            id="valid_until"
                            name="valid_until"
                            type="datetime-local"
                            defaultValue={defaults.valid_until || ''}
                            className={adminInputClass}
                        />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
                        <div>
                            <p className="text-sm font-medium text-slate-800">Ocultar ao expirar</p>
                            <p className="text-xs text-slate-500">Remove o card automaticamente.</p>
                        </div>
                        <Switch id="auto_hide" name="auto_hide" defaultChecked={defaults.auto_hide ?? false} />
                    </div>
                </div>
                
                <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 h-[74px]">
                        <div>
                            <p className="text-sm font-medium text-slate-800">Promoção ativa</p>
                            <p className="text-xs text-slate-500">Visível na home.</p>
                        </div>
                        <Switch id="is_active" name="is_active" defaultChecked={defaults.is_active ?? true} />
                    </div>
                    {/* Placeholder para alinhar grid se necessário */}
                </div>
              </div>
              
              <div className="grid gap-3 md:grid-cols-2 pt-2">
                <div className="grid gap-2">
                  <Label htmlFor="cta_label" className="text-xs font-medium text-slate-500">Texto do Botão</Label>
                  <Input id="cta_label" name="cta_label" defaultValue={defaults.cta_label || 'Ver detalhes'} className={adminInputClass} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cta_url" className="text-xs font-medium text-slate-500">URL de Destino</Label>
                  <Input
                    id="cta_url"
                    name="cta_url"
                    type="url"
                    placeholder="https://"
                    defaultValue={defaults.cta_url || ''}
                    className={adminInputClass}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/50 px-8 py-5 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting} className="h-10 px-6">
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting} className="h-10 px-6 bg-orange-600 hover:bg-orange-700 text-white shadow-sm">
              {submitting ? 'Salvando...' : 'Salvar Promoção'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

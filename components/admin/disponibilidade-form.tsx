"use client"

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { AdminSurface } from '@/components/admin/surface'
import { adminInputClass, adminSelectTriggerClass } from '@/components/admin/styles'
import { SingleSelectCombobox, type SingleSelectOption } from '@/components/admin/single-select-combobox'

const numeric = (value: FormDataEntryValue | null) => {
  if (value === null) return null
  const str = value.toString().trim()
  if (!str) return null
  const parsed = Number(str)
  return Number.isFinite(parsed) ? parsed : null
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

const normalizeTransport = (value: string) => slugify(value).replace(/-/g, '')

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

const normalizeTransportKeyClient = (value?: string | null) => normalizeText(value || '').replace(/[^a-z]/g, '')

const uniqueOptions = (options: SingleSelectOption[]) =>
  Array.from(new Map(options.map((item) => [item.value.toLowerCase(), item])).values())

const formSchema = z.object({
  id: z.number().int().positive().optional(),
  destino: z.string().min(2, 'Informe o destino'),
  data_saida: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data no formato YYYY-MM-DD'),
  data_volta: z.string().optional().nullable(),
  transporte: z.string().min(2, 'Informe o transporte'),
  hotel: z.string().min(2, 'Informe o hotel'),
  quarto_tipo: z.string().optional(),
  slug: z.string().optional().nullable(),
  slug_hospedagem: z.string().optional().nullable(),
  slug_pacote: z.string().optional().nullable(),
  slug_pacote_principal: z.string().optional().nullable(),
  capacidade: z.number().int().min(0).nullable().optional(),
  preco_adulto: z.number().min(0).nullable().optional(),
  preco_crianca_0_3: z.number().min(0).nullable().optional(),
  preco_crianca_4_5: z.number().min(0).nullable().optional(),
  preco_crianca_6_mais: z.number().min(0).nullable().optional(),
  preco_adulto_aereo: z.number().min(0).nullable().optional(),
  preco_crianca_0_2_aereo: z.number().min(0).nullable().optional(),
  preco_crianca_2_5_aereo: z.number().min(0).nullable().optional(),
  preco_crianca_6_mais_aereo: z.number().min(0).nullable().optional(),
  taxa_aereo_por_pessoa: z.number().min(0).nullable().optional(),
  noites_hotel: z.number().int().min(0).nullable().optional(),
  dias_viagem: z.number().int().min(0).nullable().optional(),
  dias_totais: z.number().int().min(0).nullable().optional(),
})

export interface DisponibilidadeFormData {
  id?: number
  destino?: string
  data_saida?: string
  transporte?: string
  hotel?: string
  quarto_tipo?: string | null
  slug?: string | null
  slug_hospedagem?: string | null
  slug_pacote?: string | null
  slug_pacote_principal?: string | null
  capacidade?: number | null
  preco_adulto?: number | null
  preco_crianca_0_3?: number | null
  preco_crianca_4_5?: number | null
  preco_crianca_6_mais?: number | null
  preco_adulto_aereo?: number | null
  preco_crianca_0_2_aereo?: number | null
  preco_crianca_2_5_aereo?: number | null
  preco_crianca_6_mais_aereo?: number | null
  taxa_aereo_por_pessoa?: number | null
  noites_hotel?: number | null
  dias_viagem?: number | null
  dias_totais?: number | null
}

type FormMode = 'create' | 'edit' | 'duplicate'

interface DisponibilidadeFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: DisponibilidadeFormData
  mode?: FormMode
}

const defaultTransporteOptions = ['Bús', 'Aéreo']

const canonicalTransportLabel = (value?: string | null) => {
  const normalized = normalizeTransport(value ?? '')
  if (normalized.includes('aereo')) return 'Aéreo'
  if (normalized.includes('bus')) return 'Bús'
  return value ?? 'Bús'
}

export function DisponibilidadeForm({
  open,
  onOpenChange,
  initialData,
  mode = 'create',
}: DisponibilidadeFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const defaultValues = useMemo(() => {
    const busFallback = {
      adulto: initialData?.preco_adulto ?? '',
      crianca03: initialData?.preco_crianca_0_3 ?? '',
      crianca45: initialData?.preco_crianca_4_5 ?? '',
      crianca6: initialData?.preco_crianca_6_mais ?? '',
    }

    const aereoFallback = {
      adulto: initialData?.preco_adulto_aereo ?? busFallback.adulto,
      crianca02: initialData?.preco_crianca_0_2_aereo ?? busFallback.crianca03,
      crianca25: initialData?.preco_crianca_2_5_aereo ?? busFallback.crianca45,
      crianca6:
        initialData?.preco_crianca_6_mais_aereo ?? (busFallback.crianca6 ?? busFallback.adulto ?? ''),
      taxa: initialData?.taxa_aereo_por_pessoa ?? '',
    }

    return {
      destino: initialData?.destino ?? '',
      data_saida: initialData?.data_saida ?? '',
      transporte: canonicalTransportLabel(initialData?.transporte ?? 'Bus'),
      hotel: initialData?.hotel ?? '',
      quarto_tipo: initialData?.quarto_tipo ?? '',
      slug: initialData?.slug ?? '',
      slug_hospedagem: initialData?.slug_hospedagem ?? '',
      slug_pacote: initialData?.slug_pacote ?? '',
      slug_pacote_principal: initialData?.slug_pacote_principal ?? '',
      capacidade: initialData?.capacidade ?? '',
      preco_adulto: busFallback.adulto,
      preco_crianca_0_3: busFallback.crianca03,
      preco_crianca_4_5: busFallback.crianca45,
      preco_crianca_6_mais: busFallback.crianca6,
      preco_adulto_aereo: aereoFallback.adulto ?? '',
      preco_crianca_0_2_aereo: aereoFallback.crianca02 ?? '',
      preco_crianca_2_5_aereo: aereoFallback.crianca25 ?? '',
      preco_crianca_6_mais_aereo: aereoFallback.crianca6 ?? '',
      taxa_aereo_por_pessoa: aereoFallback.taxa,
      noites_hotel: initialData?.noites_hotel ?? '',
      dias_viagem: initialData?.dias_viagem ?? '',
      dias_totais: initialData?.dias_totais ?? '',
    }
  }, [initialData])

  const [transporteSelecionado, setTransporteSelecionado] = useState(defaultValues.transporte)
  const [destinoValue, setDestinoValue] = useState(defaultValues.destino)
  const [hotelValue, setHotelValue] = useState(defaultValues.hotel)
  const [dataSaidaValue, setDataSaidaValue] = useState(defaultValues.data_saida)
  const [destinationOptions, setDestinationOptions] = useState<SingleSelectOption[]>([])
  const [hotelOptions, setHotelOptions] = useState<SingleSelectOption[]>([])
  const [roomTypeOptions, setRoomTypeOptions] = useState<SingleSelectOption[]>([])
  const [capacityOptions, setCapacityOptions] = useState<SingleSelectOption[]>([])
  const [lookupsLoading, setLookupsLoading] = useState(false)
  const [lookupsError, setLookupsError] = useState<string | null>(null)
  const [roomTypeValue, setRoomTypeValue] = useState(defaultValues.quarto_tipo ?? '')
  const [capacidadeValue, setCapacidadeValue] = useState(
    defaultValues.capacidade ? String(defaultValues.capacidade) : '',
  )
  const [dialogContainer, setDialogContainer] = useState<HTMLDivElement | null>(null)

  const isAereo = normalizeTransport(transporteSelecionado).includes('aereo')

  const filteredDestinationOptions = useMemo(() => {
    const transportKey = normalizeTransportKeyClient(transporteSelecionado)
    if (!transportKey) return destinationOptions
    return destinationOptions.filter((option) => {
      const transportKeys = (option.meta?.transportKeys as string[] | undefined) || []
      if (transportKeys.length === 0) return true
      return transportKeys.includes(transportKey)
    })
  }, [destinationOptions, transporteSelecionado])

  const filteredHotelOptions = useMemo(() => {
    const transportKey = normalizeTransportKeyClient(transporteSelecionado)
    const destinoKey = destinoValue ? normalizeText(destinoValue) : null

    return hotelOptions.filter((option) => {
      const optionTransportKeys = (option.meta?.transportKeys as string[] | undefined) || []
      if (transportKey && optionTransportKeys.length && !optionTransportKeys.includes(transportKey)) {
        return false
      }
      if (destinoKey) {
        const optionDestinationKey = (option.meta?.destinationKey as string | undefined) || null
        if (optionDestinationKey && optionDestinationKey !== destinoKey) {
          return false
        }
      }
      return true
    })
  }, [hotelOptions, destinoValue, transporteSelecionado])

  useEffect(() => {
    if (!open) return
    setTransporteSelecionado(defaultValues.transporte)
    setDestinoValue(defaultValues.destino)
    setHotelValue(defaultValues.hotel)
    setDataSaidaValue(defaultValues.data_saida)
    setRoomTypeValue(defaultValues.quarto_tipo ?? '')
    setCapacidadeValue(defaultValues.capacidade ? String(defaultValues.capacidade) : '')
  }, [defaultValues, open])

  useEffect(() => {
    if (!open) return
    let active = true
    const loadLookups = async () => {
      setLookupsLoading(true)
      setLookupsError(null)
      try {
        const response = await fetch('/api/admin/lookups')
        const payload = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error(payload.error || 'Não foi possível carregar as referências')
        }
        const destinationsData = Array.isArray(payload.destinations) ? payload.destinations : []
        const hotelsData = Array.isArray(payload.hotels) ? payload.hotels : []
        const roomTypesData = Array.isArray(payload.room_types) ? payload.room_types : []
        const capacitiesData = Array.isArray(payload.capacities) ? payload.capacities : []

        if (active) {
          const mappedDestinations = destinationsData
            .map((item: any) => {
              const value = String(item.value ?? item.label ?? '').trim()
              if (!value) return null
              const label = String(item.label ?? item.value ?? value).trim()
              const transports = Array.isArray(item.transports)
                ? item.transports.map((transport: any) => String(transport))
                : []
              const transportKeys =
                Array.isArray(item.transportKeys) && item.transportKeys.length > 0
                  ? item.transportKeys.map((key: any) => String(key))
                  : transports.map((transport) => normalizeTransportKeyClient(transport))
              return {
                value,
                label,
                description: item.description
                  ? String(item.description)
                  : transports.length
                    ? transports.join(' • ')
                    : undefined,
                meta: { transportKeys: transportKeys.filter(Boolean) },
              } satisfies SingleSelectOption
            })
            .filter((option): option is SingleSelectOption => Boolean(option))
          if (defaultValues.destino) {
            const normalizedDefault = defaultValues.destino.toLowerCase()
            if (!mappedDestinations.some((option) => option.value.toLowerCase() === normalizedDefault)) {
              mappedDestinations.unshift({
                value: defaultValues.destino,
                label: defaultValues.destino,
                meta: { transportKeys: [] },
              })
            }
          }
          setDestinationOptions(uniqueOptions(mappedDestinations))

          const normalizedHotels: SingleSelectOption[] = hotelsData
            .map((item: any) => {
              const value = String(item.value ?? item.label ?? '').trim()
              if (!value) return null
              const label = String(item.label ?? item.value ?? value).trim()
              const destinationValue = item.destination ?? item.description ?? null
              const transports = Array.isArray(item.transports)
                ? item.transports.map((transport: any) => String(transport))
                : []
              const transportKeys =
                Array.isArray(item.transportKeys) && item.transportKeys.length > 0
                  ? item.transportKeys.map((key: any) => String(key))
                  : transports.map((transport) => normalizeTransportKeyClient(transport))
              const destinationKey =
                typeof item.destinationKey === 'string' && item.destinationKey.length > 0
                  ? item.destinationKey
                  : destinationValue
                    ? normalizeText(String(destinationValue))
                    : undefined
              return {
                value,
                label,
                description: destinationValue ? String(destinationValue) : undefined,
                meta: {
                  destination: destinationValue ? String(destinationValue) : undefined,
                  destinationKey,
                  transportKeys: transportKeys.filter(Boolean),
                },
              } satisfies SingleSelectOption
            })
            .filter((item): item is SingleSelectOption => Boolean(item))
          if (defaultValues.hotel) {
            const normalizedDefault = defaultValues.hotel.toLowerCase()
            if (!normalizedHotels.some((option) => option.value.toLowerCase() === normalizedDefault)) {
              normalizedHotels.unshift({
                value: defaultValues.hotel,
                label: defaultValues.hotel,
                description: defaultValues.destino || undefined,
                meta: {
                  destination: defaultValues.destino,
                  destinationKey: defaultValues.destino ? normalizeText(defaultValues.destino) : undefined,
                  transportKeys: [],
                },
              })
            }
          }
          setHotelOptions(uniqueOptions(normalizedHotels))

          const normalizedRoomTypes: SingleSelectOption[] = roomTypesData
            .map((raw: any) => {
              const value = String(raw ?? '').trim()
              if (!value) return null
              return { value, label: value }
            })
            .filter((item): item is SingleSelectOption => Boolean(item))
          if (defaultValues.quarto_tipo) {
            const normalizedDefault = defaultValues.quarto_tipo.toLowerCase()
            if (!normalizedRoomTypes.some((option) => option.value.toLowerCase() === normalizedDefault)) {
              normalizedRoomTypes.unshift({
                value: defaultValues.quarto_tipo,
                label: defaultValues.quarto_tipo,
              })
            }
          }
          setRoomTypeOptions(uniqueOptions(normalizedRoomTypes))

          const normalizedCapacities: SingleSelectOption[] = capacitiesData
            .map((raw: any) => {
              const numeric = typeof raw === 'number' ? raw : Number(raw)
              if (!Number.isFinite(numeric)) return null
              return {
                value: String(numeric),
                label: `${numeric} hóspedes`,
              }
            })
            .filter((item): item is SingleSelectOption => Boolean(item))
          if (defaultValues.capacidade) {
            const normalizedDefault = String(defaultValues.capacidade)
            if (!normalizedCapacities.some((option) => option.value === normalizedDefault)) {
              normalizedCapacities.unshift({
                value: normalizedDefault,
                label: `${normalizedDefault} hóspedes`,
              })
            }
          }
          setCapacityOptions(uniqueOptions(normalizedCapacities))
        }
      } catch (error) {
        if (active) {
          const message =
            error instanceof Error ? error.message : 'Não foi possível carregar as referências'
          setLookupsError(message)
        }
      } finally {
        if (active) {
          setLookupsLoading(false)
        }
      }
    }
    loadLookups()
    return () => {
      active = false
    }
  }, [defaultValues, open])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const formData = new FormData(event.currentTarget)

      const stringValue = (name: string) => (formData.get(name) || '').toString().trim()

      const destino = stringValue('destino')
      const dataSaida = stringValue('data_saida')
      const dataVolta = stringValue('data_volta')
      const transporte = canonicalTransportLabel(stringValue('transporte'))
      const hotel = stringValue('hotel')
      const autoSlug = slugify([hotel, destino, dataSaida].filter(Boolean).join('-'))
      const autoHotelSlug = slugify(hotel)
      const autoSlugPrincipal = slugify([hotel, destino].filter(Boolean).join('-'))
      const slugAtual = initialData?.slug ?? autoSlug
      const slugHospedagemAtual = initialData?.slug_hospedagem ?? autoHotelSlug
      const slugPacoteAtual = initialData?.slug_pacote ?? autoSlug
      const slugPacotePrincipalAtual = initialData?.slug_pacote_principal ?? autoSlugPrincipal

      const payload = {
        id: mode === 'edit' ? initialData?.id : undefined,
        destino,
        data_saida: dataSaida,
        data_volta: dataVolta || null,
        transporte,
        hotel,
        quarto_tipo: formData.get('quarto_tipo'),
        slug: slugAtual,
        slug_hospedagem: slugHospedagemAtual,
        slug_pacote: slugPacoteAtual,
        slug_pacote_principal: slugPacotePrincipalAtual,
        capacidade: numeric(formData.get('capacidade')),
        preco_adulto: numeric(formData.get('preco_adulto')),
        preco_crianca_0_3: numeric(formData.get('preco_crianca_0_3')),
        preco_crianca_4_5: numeric(formData.get('preco_crianca_4_5')),
        preco_crianca_6_mais: numeric(formData.get('preco_crianca_6_mais')),
        preco_adulto_aereo: numeric(formData.get('preco_adulto_aereo')),
        preco_crianca_0_2_aereo: numeric(formData.get('preco_crianca_0_2_aereo')),
        preco_crianca_2_5_aereo: numeric(formData.get('preco_crianca_2_5_aereo')),
        preco_crianca_6_mais_aereo: numeric(formData.get('preco_crianca_6_mais_aereo')),
        taxa_aereo_por_pessoa: numeric(formData.get('taxa_aereo_por_pessoa')),
        noites_hotel: numeric(formData.get('noites_hotel')),
        dias_viagem: numeric(formData.get('dias_viagem')),
        dias_totais: numeric(formData.get('dias_totais')),
      }

      const parsed = formSchema.parse(payload)
      const finalPayload = { ...parsed }

      const normalizedTransportKey = normalizeTransport(transporte)
      if (normalizedTransportKey.includes('aereo')) {
        const pickNumber = (...values: Array<number | null | undefined>) => {
          for (const value of values) {
            if (typeof value === 'number' && !Number.isNaN(value)) {
              return value
            }
          }
          return null
        }

        const ensureBaseValue = (
          field: 'preco_adulto' | 'preco_crianca_0_3' | 'preco_crianca_4_5' | 'preco_crianca_6_mais',
          ...candidates: Array<number | null | undefined>
        ) => {
          if (finalPayload[field] == null) {
            const fallback = pickNumber(...candidates)
            if (fallback != null) {
              finalPayload[field] = fallback
            }
          }
        }

        ensureBaseValue(
          'preco_adulto',
          finalPayload.preco_adulto_aereo,
          initialData?.preco_adulto ?? null,
        )
        ensureBaseValue(
          'preco_crianca_0_3',
          finalPayload.preco_crianca_0_2_aereo,
          initialData?.preco_crianca_0_3 ?? null,
        )
        ensureBaseValue(
          'preco_crianca_4_5',
          finalPayload.preco_crianca_2_5_aereo,
          initialData?.preco_crianca_4_5 ?? null,
        )
        ensureBaseValue(
          'preco_crianca_6_mais',
          finalPayload.preco_crianca_6_mais_aereo,
          finalPayload.preco_adulto_aereo,
          initialData?.preco_crianca_6_mais ?? null,
        )
      }

      const response = await fetch('/api/admin/disponibilidades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPayload),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Erro ao salvar disponibilidade')
      }

      toast({
        title: mode === 'edit' ? 'Disponibilidade atualizada' : 'Disponibilidade criada',
        description:
          mode === 'edit'
            ? 'Os dados foram atualizados com sucesso.'
            : 'A nova disponibilidade já pode ser utilizada no site.',
      })
      onOpenChange(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
      toast({
        variant: 'destructive',
        title: 'Falha ao salvar disponibilidade',
        description: err instanceof Error ? err.message : 'Erro inesperado',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(value) => !saving && onOpenChange(value)}>
      <DialogContent
        key={initialData ? `form-${initialData.id ?? initialData.slug ?? initialData.hotel ?? 'copy'}` : 'form-new'}
        ref={setDialogContainer}
        className="w-[min(94vw,860px)] max-w-3xl overflow-hidden rounded-xl border border-slate-200 bg-white p-0 shadow-2xl"
      >
      <form className="flex max-h-[84vh] flex-col" onSubmit={handleSubmit}>
        <DialogHeader className="border-b border-slate-100 bg-slate-50/50 px-8 py-5">
          <DialogTitle className="text-xl font-bold text-slate-900">
            {mode === 'edit'
              ? 'Editar disponibilidade'
              : mode === 'duplicate'
                ? 'Duplicar disponibilidade'
                : 'Nova disponibilidade'}
          </DialogTitle>
          <p className="text-sm text-slate-500">
            Preencha os dados abaixo para cadastrar um novo pacote.
          </p>
        </DialogHeader>

        <div className="flex-1 space-y-5 overflow-y-auto px-8 py-6 bg-slate-50/30">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-2">
              <h4 className="text-sm font-semibold text-slate-900">Dados principais</h4>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="destino" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Destino</Label>
                <SingleSelectCombobox
                  name="destino"
                  value={destinoValue || null}
                  onChange={(next) => setDestinoValue(next ?? '')}
                  options={filteredDestinationOptions}
                  placeholder="Selecione o destino"
                  loading={lookupsLoading}
                  allowCustomValue={false}
                  clearable={false}
                  portalContainer={dialogContainer}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="data_saida" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Data de saída</Label>
                <Input
                  id="data_saida"
                  name="data_saida"
                  type="date"
                  defaultValue={defaultValues.data_saida}
                  onChange={(event) => setDataSaidaValue(event.target.value)}
                  required
                  className={adminInputClass}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="data_volta" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Data de volta <span className="text-slate-400 normal-case font-normal">(opcional)</span></Label>
                <Input
                  id="data_volta"
                  name="data_volta"
                  type="date"
                  defaultValue={defaultValues.data_volta || ''}
                  className={adminInputClass}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="transporte" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Transporte</Label>
                <Select
                  name="transporte"
                  value={transporteSelecionado}
                  onValueChange={(value) => setTransporteSelecionado(value)}
                >
                  <SelectTrigger className={adminSelectTriggerClass}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {defaultTransporteOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="capacidade" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Capacidade</Label>
                <SingleSelectCombobox
                  name="capacidade"
                  value={capacidadeValue || null}
                  onChange={(next) => setCapacidadeValue(next ?? '')}
                  options={capacityOptions}
                  placeholder="Selecione ou digite"
                  loading={lookupsLoading}
                  allowCustomValue
                  portalContainer={dialogContainer}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4">
             <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-2">
                <h4 className="text-sm font-semibold text-slate-900">Hospedagem</h4>
             </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="hotel" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Hotel</Label>
                <SingleSelectCombobox
                  name="hotel"
                  value={hotelValue || null}
                  onChange={(next) => setHotelValue(next ?? '')}
                  options={filteredHotelOptions}
                  placeholder="Selecione o hotel"
                  loading={lookupsLoading}
                  allowCustomValue={false}
                  clearable={false}
                  portalContainer={dialogContainer}
                />
                {lookupsError && <p className="text-xs text-red-500">{lookupsError}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quarto_tipo" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Tipo de quarto</Label>
                <SingleSelectCombobox
                  name="quarto_tipo"
                  value={roomTypeValue || null}
                  onChange={(next) => setRoomTypeValue(next ?? '')}
                  options={roomTypeOptions}
                  placeholder="Selecione ou digite"
                  loading={lookupsLoading}
                  allowCustomValue
                  portalContainer={dialogContainer}
                />
              </div>
            </div>
          </div>

          {!isAereo && (
            <div className="space-y-4 pt-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-2">
                <h4 className="text-sm font-semibold text-slate-900">Valores (Ônibus)</h4>
              </div>
              <div className="grid gap-3 md:grid-cols-4">
                {[
                  { id: 'preco_adulto', label: 'Adulto', value: defaultValues.preco_adulto },
                  { id: 'preco_crianca_0_3', label: 'Criança 0-3', value: defaultValues.preco_crianca_0_3 },
                  { id: 'preco_crianca_4_5', label: 'Criança 4-5', value: defaultValues.preco_crianca_4_5 },
                  { id: 'preco_crianca_6_mais', label: 'Criança 6+', value: defaultValues.preco_crianca_6_mais },
                ].map((field) => (
                  <div className="grid gap-1" key={field.id}>
                    <Label htmlFor={field.id} className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                      {field.label}
                    </Label>
                    <Input
                      id={field.id}
                      name={field.id}
                      type="number"
                      step="0.01"
                      min={0}
                      defaultValue={field.value?.toString()}
                      className={adminInputClass}
                      placeholder="0,00"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {isAereo && (
            <div className="space-y-4 pt-4">
               <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-2">
                  <h4 className="text-sm font-semibold text-slate-900">Valores (Aéreo)</h4>
               </div>
              <div className="grid gap-3 md:grid-cols-4">
                {[
                  { id: 'preco_adulto_aereo', label: 'Adulto', value: defaultValues.preco_adulto_aereo },
                  { id: 'preco_crianca_0_2_aereo', label: '0-2 Anos', value: defaultValues.preco_crianca_0_2_aereo },
                  { id: 'preco_crianca_2_5_aereo', label: '2-5 Anos', value: defaultValues.preco_crianca_2_5_aereo },
                  { id: 'preco_crianca_6_mais_aereo', label: '6+ Anos', value: defaultValues.preco_crianca_6_mais_aereo },
                ].map((field) => (
                  <div className="grid gap-1" key={field.id}>
                    <Label htmlFor={field.id} className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                      {field.label}
                    </Label>
                    <Input
                      id={field.id}
                      name={field.id}
                      type="number"
                      step="0.01"
                      min={0}
                      defaultValue={field.value?.toString()}
                      className={adminInputClass}
                      placeholder="0,00"
                    />
                  </div>
                ))}
              </div>
              <div className="grid gap-3 md:grid-cols-3 pt-2">
                <div className="grid gap-1">
                  <Label htmlFor="taxa_aereo_por_pessoa" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Taxa por pessoa
                  </Label>
                  <Input
                    id="taxa_aereo_por_pessoa"
                    name="taxa_aereo_por_pessoa"
                    type="number"
                    step="0.01"
                    min={0}
                    defaultValue={defaultValues.taxa_aereo_por_pessoa?.toString()}
                    className={adminInputClass}
                    placeholder="0,00"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4 pt-4">
             <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-2">
                <h4 className="text-sm font-semibold text-slate-900">Duração</h4>
             </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="noites_hotel" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Noites</Label>
                <Input
                  id="noites_hotel"
                  name="noites_hotel"
                  type="number"
                  min={0}
                  defaultValue={defaultValues.noites_hotel?.toString()}
                  className={adminInputClass}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dias_viagem" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Dias de viagem</Label>
                <Input
                  id="dias_viagem"
                  name="dias_viagem"
                  type="number"
                  min={0}
                  defaultValue={defaultValues.dias_viagem?.toString()}
                  className={adminInputClass}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dias_totais" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Dias totais</Label>
                <Input
                  id="dias_totais"
                  name="dias_totais"
                  type="number"
                  min={0}
                  defaultValue={defaultValues.dias_totais?.toString()}
                  className={adminInputClass}
                />
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-600 font-medium bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
        </div>

        <DialogFooter className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/50 px-8 py-5 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving} className="h-10 px-6">
            Cancelar
          </Button>
          <Button type="submit" disabled={saving} className="h-10 px-6 bg-orange-600 hover:bg-orange-700 text-white shadow-sm">
            {saving ? 'Salvando...' : 'Salvar Disponibilidade'}
          </Button>
        </DialogFooter>
      </form>
      </DialogContent>
    </Dialog>
  )
}

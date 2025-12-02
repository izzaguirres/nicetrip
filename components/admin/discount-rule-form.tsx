"use client"

import { useEffect, useMemo, useState } from "react"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { MultiSelectCombobox, type MultiSelectOption } from "@/components/admin/multi-select-combobox"
import { adminInputClass, adminSelectTriggerClass } from "@/components/admin/styles"
import {
  ALL_AGE_GROUP_ID,
  findAgeGroupByRange,
  formatAgeRangeLabel,
  getAgeGroupsForTransport,
  mapAgeGroupToRange,
  normalizeAgeGroupId,
  shouldShowCustomAgeOption,
} from "@/lib/discount-age-groups"

const formSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, "Informe um nome"),
  transport_type: z.string().nullable().optional(),
  destinations: z.array(z.string().min(1)).optional(),
  package_slugs: z.array(z.string().min(1)).optional(),
  hotel_names: z.array(z.string().min(1)).optional(),
  target_dates: z.array(z.string()).optional(),
  age_groups: z.array(z.string().min(1)).optional(),
  age_min: z.string().optional(),
  age_max: z.string().optional(),
  amount: z.string(),
  amount_currency: z.string().length(3).default("USD"),
  amount_type: z.enum(["fixed", "percent"]).default("fixed"),
  valid_from: z.string().optional(),
  valid_to: z.string().optional(),
  is_active: z.boolean().default(true),
})

export interface DiscountRuleFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Partial<z.infer<typeof formSchema>> & {
    destinations?: string[] | null
    package_slugs?: string[] | null
    hotel_names?: string[] | null
    target_dates?: string[] | null
  }
}

interface LookupOptions {
  destinations: MultiSelectOption[]
  hotels: MultiSelectOption[]
  packages: MultiSelectOption[]
}

const ANY_TRANSPORT_VALUE = "__any"

const sanitizeList = (values: string[]): string[] => {
  const trimmed = values
    .map((value) => value.trim())
    .filter(Boolean)
  return Array.from(new Set(trimmed))
}

const normalizeTransportKey = (value?: string | null) =>
  (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/g, "")

const normalizeText = (value?: string | null) =>
  (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()

export function DiscountRuleForm({ open, onOpenChange, initialData }: DiscountRuleFormProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lookupError, setLookupError] = useState<string | null>(null)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupOptions, setLookupOptions] = useState<LookupOptions>({
    destinations: [],
    hotels: [],
    packages: [],
  })
  const [dialogContainer, setDialogContainer] = useState<HTMLDivElement | null>(null)
  const initialAgeRange = useMemo(
    () => ({
      min: typeof initialData?.age_min === "number" ? initialData?.age_min : null,
      max: typeof initialData?.age_max === "number" ? initialData?.age_max : null,
    }),
    [initialData],
  )
  const hasCustomAgeRange = shouldShowCustomAgeOption(initialAgeRange.min, initialAgeRange.max)

  const defaultValues = useMemo(() => {
    const destinations = Array.isArray(initialData?.destinations)
      ? initialData?.destinations.filter(Boolean) ?? []
      : []
    const hotels = Array.isArray(initialData?.hotel_names)
      ? initialData?.hotel_names.filter(Boolean) ?? []
      : []
    const packages = Array.isArray(initialData?.package_slugs)
      ? initialData?.package_slugs.filter(Boolean) ?? []
      : []
    const targetDates = Array.isArray(initialData?.target_dates)
      ? initialData?.target_dates.filter(Boolean) ?? []
      : []

    return {
      id: initialData?.id,
      name: initialData?.name ?? "",
      transport_type: initialData?.transport_type ?? ANY_TRANSPORT_VALUE,
      destinations,
      package_slugs: packages,
      hotel_names: hotels,
      target_dates: targetDates,
      age_groups: Array.isArray(initialData?.age_groups)
        ? initialData?.age_groups.filter(Boolean) ?? []
        : [],
      age_min: initialData?.age_min ?? "",
      age_max: initialData?.age_max ?? "",
      amount: initialData?.amount?.toString() ?? "",
      amount_currency: initialData?.amount_currency ?? "USD",
      amount_type: initialData?.amount_type ?? "fixed",
      valid_from: initialData?.valid_from ?? "",
      valid_to: initialData?.valid_to ?? "",
      is_active: initialData?.is_active ?? true,
    }
  }, [initialData])

  const derivedAgeGroups = useMemo(() => {
    if (defaultValues.age_groups && defaultValues.age_groups.length > 0) {
      return defaultValues.age_groups
    }
    const match = findAgeGroupByRange(initialAgeRange.min, initialAgeRange.max)
    if (match && match.id !== ALL_AGE_GROUP_ID) {
      return [match.id]
    }
    return []
  }, [defaultValues.age_groups, initialAgeRange.min, initialAgeRange.max])

  const [destinationsValue, setDestinationsValue] = useState<string[]>(defaultValues.destinations)
  const [hotelsValue, setHotelsValue] = useState<string[]>(defaultValues.hotel_names)
  const [targetDatesValue, setTargetDatesValue] = useState<string[]>(defaultValues.target_dates)
  const [transportValue, setTransportValue] = useState(
    defaultValues.transport_type ?? ANY_TRANSPORT_VALUE,
  )
  const [autoPackageSlugs, setAutoPackageSlugs] = useState<string[]>(defaultValues.package_slugs ?? [])
  const [ageGroupsValue, setAgeGroupsValue] = useState<string[]>(derivedAgeGroups)

  const selectedTransport =
    transportValue && transportValue !== ANY_TRANSPORT_VALUE ? transportValue : null
  const ageGroupOptions = useMemo(() => {
    return getAgeGroupsForTransport(selectedTransport)
      .filter((option) => option.id !== ALL_AGE_GROUP_ID)
      .map((option) => ({ value: option.id, label: option.label }))
  }, [selectedTransport])

  const showCustomAgeOption = hasCustomAgeRange && ageGroupsValue.length === 0

  useEffect(() => {
    if (!open) return
    setDestinationsValue(defaultValues.destinations)
    setHotelsValue(defaultValues.hotel_names)
    setTargetDatesValue(defaultValues.target_dates)
    setTransportValue(defaultValues.transport_type ?? ANY_TRANSPORT_VALUE)
    setAutoPackageSlugs(defaultValues.package_slugs ?? [])
    setAgeGroupsValue(derivedAgeGroups)
  }, [defaultValues, derivedAgeGroups, open])

  useEffect(() => {
    setAgeGroupsValue((prev) => {
      if (prev.length === 0) return prev
      const allowed = new Set(ageGroupOptions.map((option) => normalizeAgeGroupId(option.value)))
      const next = prev.filter((id) => allowed.has(normalizeAgeGroupId(id)))
      return next.length === prev.length ? prev : next
    })
  }, [ageGroupOptions])

  useEffect(() => {
    let isMounted = true
    const loadLookupOptions = async () => {
      setLookupLoading(true)
      setLookupError(null)
      try {
        const response = await fetch("/api/admin/lookups")
        if (!response.ok) {
          throw new Error("Não foi possível carregar as referências")
        }
        const data = await response.json()
        if (isMounted) {
          const destinationOptions = Array.isArray(data.destinations)
            ? data.destinations.map((item: any) => ({
                value: item.value,
                label: item.label,
                description: item.description,
                meta: {
                  transportKeys: Array.isArray(item.transportKeys) ? item.transportKeys : [],
                },
              }))
            : []

          const hotelOptions = Array.isArray(data.hotels)
            ? data.hotels.map((item: any) => ({
                value: item.value,
                label: item.label,
                description: item.description,
                meta: {
                  destinationKey: item.destinationKey,
                  transportKeys: Array.isArray(item.transportKeys) ? item.transportKeys : [],
                },
              }))
            : []

          const packageOptions = Array.isArray(data.packages)
            ? data.packages.map((item: any) => {
                const pkgMeta =
                  item && typeof item.meta === "object" && item.meta !== null ? item.meta : {}
                return {
                  value: item.value,
                  label: item.label,
                  description: item.description,
                  meta: {
                    destino: pkgMeta.destino ?? item.destino ?? null,
                    hotel: pkgMeta.hotel ?? item.hotel ?? null,
                    transporte: pkgMeta.transporte ?? item.transporte ?? null,
                  },
                }
              })
            : []

          setLookupOptions({
            destinations: destinationOptions,
            hotels: hotelOptions,
            packages: packageOptions,
          })
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao carregar dados auxiliares"
        if (isMounted) {
          setLookupError(message)
        }
      } finally {
        if (isMounted) {
          setLookupLoading(false)
        }
      }
    }
    loadLookupOptions()
    return () => {
      isMounted = false
    }
  }, [])

  const destinationOptions = useMemo<MultiSelectOption[]>(() => {
    const transportKey =
      transportValue && transportValue !== ANY_TRANSPORT_VALUE
        ? normalizeTransportKey(transportValue)
        : null

    return (lookupOptions.destinations || []).filter((destination) => {
      const transportKeys = Array.isArray(destination.meta?.transportKeys)
        ? (destination.meta?.transportKeys as string[])
        : []
      if (transportKey && transportKeys.length > 0 && !transportKeys.includes(transportKey)) {
        return false
      }
      return true
    })
  }, [lookupOptions.destinations, transportValue])

  const filteredHotelOptions = useMemo<MultiSelectOption[]>(() => {
    const transportKey =
      transportValue && transportValue !== ANY_TRANSPORT_VALUE
        ? normalizeTransportKey(transportValue)
        : null
    const destinationKeys = new Set(destinationsValue.map((dest) => normalizeText(dest)))

    return (lookupOptions.hotels || []).filter((hotel) => {
      const hotelTransportKeys = Array.isArray(hotel.meta?.transportKeys)
        ? (hotel.meta?.transportKeys as string[])
        : []
      if (transportKey && hotelTransportKeys.length > 0 && !hotelTransportKeys.includes(transportKey)) {
        return false
      }

      if (destinationKeys.size > 0) {
        const hotelDestinationKey =
          (typeof hotel.meta?.destinationKey === "string" && hotel.meta?.destinationKey) ||
          (hotel.description ? normalizeText(hotel.description) : null)
        if (!hotelDestinationKey || !destinationKeys.has(hotelDestinationKey)) {
          return false
        }
      }

      return true
    })
  }, [lookupOptions.hotels, transportValue, destinationsValue])

  useEffect(() => {
    if (!open) return
    const transportKey =
      transportValue && transportValue !== ANY_TRANSPORT_VALUE
        ? normalizeTransportKey(transportValue)
        : null
    const destinationKeys = new Set(destinationsValue.map((dest) => normalizeText(dest)))
    const hotelKeys = new Set(hotelsValue.map((hotel) => normalizeText(hotel)))
    const hasFilters = transportKey !== null || destinationKeys.size > 0 || hotelKeys.size > 0

    if (!hasFilters) {
      setAutoPackageSlugs(defaultValues.package_slugs ?? [])
      return
    }

    const matchedSlugs = (lookupOptions.packages || [])
      .filter((pkg) => {
        const meta = (pkg.meta || {}) as { destino?: string; hotel?: string; transporte?: string }
        const pkgTransportKey = normalizeTransportKey(meta.transporte)
        if (transportKey && pkgTransportKey && pkgTransportKey !== transportKey) {
          return false
        }

        if (destinationKeys.size > 0) {
          const pkgDestinationKey = meta.destino ? normalizeText(meta.destino) : null
          if (!pkgDestinationKey || !destinationKeys.has(pkgDestinationKey)) {
            return false
          }
        }

        if (hotelKeys.size > 0) {
          const pkgHotelKey = meta.hotel ? normalizeText(meta.hotel) : null
          if (!pkgHotelKey || !hotelKeys.has(pkgHotelKey)) {
            return false
          }
        }

        return true
      })
      .map((pkg) => pkg.value)

    setAutoPackageSlugs(matchedSlugs)
  }, [
    open,
    transportValue,
    destinationsValue,
    hotelsValue,
    lookupOptions.packages,
    defaultValues.package_slugs,
  ])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData(event.currentTarget)
      const transportRaw = formData.get("transport_type") as string | null

      const sanitizedDestinations = sanitizeList(destinationsValue)
      const sanitizedPackages = sanitizeList(autoPackageSlugs)
      const sanitizedHotels = sanitizeList(hotelsValue)
      const sanitizedTargetDates = sanitizeList(targetDatesValue)
      const sanitizedAgeGroups = sanitizeList(ageGroupsValue)
      const normalizedTransport =
        transportRaw && transportRaw !== ANY_TRANSPORT_VALUE ? transportRaw : null

      let ageMinValue = ""
      let ageMaxValue = ""

      if (sanitizedAgeGroups.length === 1) {
        const mappedRange = mapAgeGroupToRange(sanitizedAgeGroups[0], normalizedTransport)
        ageMinValue = mappedRange.min != null ? String(mappedRange.min) : ""
        ageMaxValue = mappedRange.max != null ? String(mappedRange.max) : ""
      } else if (sanitizedAgeGroups.length === 0 && hasCustomAgeRange) {
        ageMinValue = initialAgeRange.min != null ? String(initialAgeRange.min) : ""
        ageMaxValue = initialAgeRange.max != null ? String(initialAgeRange.max) : ""
      }

      const parsed = formSchema.parse({
        id: defaultValues.id,
        name: formData.get("name"),
        transport_type:
          !transportRaw || transportRaw === ANY_TRANSPORT_VALUE ? null : (transportRaw as string),
        destinations: sanitizedDestinations,
        package_slugs: sanitizedPackages,
        hotel_names: sanitizedHotels,
        target_dates: sanitizedTargetDates,
        age_groups: sanitizedAgeGroups,
        age_min: ageMinValue,
        age_max: ageMaxValue,
        amount: formData.get("amount") as string,
        amount_currency: (formData.get("amount_currency") as string) || "USD",
        amount_type: formData.get("amount_type") as "fixed" | "percent",
        valid_from: formData.get("valid_from") as string,
        valid_to: formData.get("valid_to") as string,
        is_active: formData.get("is_active") === "on",
      })

      const payload = {
        ...parsed,
        destinations: parsed.destinations && parsed.destinations.length > 0 ? parsed.destinations : [],
        package_slugs: parsed.package_slugs && parsed.package_slugs.length > 0 ? parsed.package_slugs : [],
        hotel_names: parsed.hotel_names && parsed.hotel_names.length > 0 ? parsed.hotel_names : [],
        target_dates: parsed.target_dates && parsed.target_dates.length > 0 ? parsed.target_dates : null,
        age_groups: parsed.age_groups && parsed.age_groups.length > 0 ? parsed.age_groups : null,
        age_min: parsed.age_min ? Number(parsed.age_min) : null,
        age_max: parsed.age_max ? Number(parsed.age_max) : null,
        amount: Number(parsed.amount),
        valid_from: parsed.valid_from ? parsed.valid_from : null,
        valid_to: parsed.valid_to ? parsed.valid_to : null,
      }

      const response = await fetch("/api/admin/discount-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "Erro ao salvar regra")
      }

      toast({
        title: defaultValues.id ? "Regra atualizada" : "Regra criada",
        description: defaultValues.id
          ? "As alterações foram aplicadas com sucesso."
          : "A nova regra está ativa para os próximos cálculos.",
      })
      onOpenChange(false)
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro inesperado"
      setError(message)
      toast({
        variant: "destructive",
        title: "Falha ao salvar regra",
        description: message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={setDialogContainer}
        className="w-[min(94vw,760px)] max-w-3xl overflow-hidden rounded-xl border border-slate-200 bg-white p-0 shadow-2xl"
      >
      <form onSubmit={handleSubmit} className="flex max-h-[84vh] flex-col">
        <DialogHeader className="space-y-1 border-b border-slate-100 bg-slate-50/50 px-8 py-5 backdrop-blur-2xl">
          <DialogTitle className="text-xl font-bold text-slate-900">
            {defaultValues.id ? "Editar Regra" : "Nova Regra de Desconto"}
          </DialogTitle>
          <p className="text-sm text-slate-500">
            Configure campanhas automáticas baseadas em destino, hotel e idade.
          </p>
        </DialogHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-8 py-6 bg-slate-50/30">
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Nome da Campanha
              </Label>
              <Input
                id="name"
                name="name"
                defaultValue={defaultValues.name}
                placeholder="Ex: Verão 2025 - Crianças Grátis"
                required
                className={adminInputClass}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="transport_type" className="text-xs font-semibold uppercase tracking-wide text-slate-500">Transporte Alvo</Label>
                <Select
                  name="transport_type"
                  value={transportValue}
                  onValueChange={setTransportValue}
                >
                  <SelectTrigger className={adminSelectTriggerClass}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ANY_TRANSPORT_VALUE}>Qualquer</SelectItem>
                    <SelectItem value="Bus">Bus</SelectItem>
                    <SelectItem value="Aéreo">Aéreo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Faixas Etárias</Label>
                <MultiSelectCombobox
                  name="age_groups"
                  placeholder="Selecione..."
                  options={ageGroupOptions}
                  value={ageGroupsValue}
                  onChange={setAgeGroupsValue}
                  loading={false}
                  allowCustomValue={false}
                  disabled={!selectedTransport}
                  portalContainer={dialogContainer}
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  {selectedTransport
                    ? ageGroupsValue.length > 0
                      ? `${ageGroupsValue.length} faixa(s) selecionada(s).`
                      : "Sem seleção = todas as idades."
                    : "Escolha um transporte primeiro."}
                </p>
                {showCustomAgeOption && (
                  <p className="text-xs text-orange-600 font-medium">
                    Regra com faixa personalizada detectada.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t border-slate-200 pt-6">
            <h4 className="text-sm font-semibold text-slate-900">Segmentação</h4>
            
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label className="text-xs font-medium text-slate-500">Destinos</Label>
                <MultiSelectCombobox
                  name="destinations"
                  placeholder="Selecione destinos..."
                  options={destinationOptions}
                  value={destinationsValue}
                  onChange={setDestinationsValue}
                  loading={lookupLoading}
                  portalContainer={dialogContainer}
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs font-medium text-slate-500">Hotéis Específicos</Label>
                <MultiSelectCombobox
                  name="hotel_names"
                  placeholder="Selecione hotéis..."
                  options={filteredHotelOptions}
                  value={hotelsValue}
                  onChange={setHotelsValue}
                  loading={lookupLoading}
                  portalContainer={dialogContainer}
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs font-medium text-slate-500">Datas de Saída (Opcional)</Label>
                <MultiSelectCombobox
                  name="target_dates"
                  placeholder="Digite datas YYYY-MM-DD..."
                  options={[]}
                  value={targetDatesValue}
                  onChange={setTargetDatesValue}
                  loading={false}
                  allowCustomValue={true}
                  portalContainer={dialogContainer}
                />
              </div>
              
              <div className="rounded-lg bg-blue-50/50 border border-blue-100 px-4 py-3">
                 <div className="flex gap-2 text-sm text-blue-700">
                    <span className="font-semibold">Alcance:</span>
                    {autoPackageSlugs.length > 0 ? (
                        <span>{autoPackageSlugs.length} pacote(s) encontrado(s) para os filtros acima.</span>
                    ) : (
                        <span>A regra será aplicada a todos os pacotes compatíveis no momento da busca.</span>
                    )}
                 </div>
              </div>
            </div>

            {lookupError && <p className="text-sm text-red-500">{lookupError}</p>}
          </div>

          <div className="space-y-4 border-t border-slate-200 pt-6">
            <h4 className="text-sm font-semibold text-slate-900">Benefício & Validade</h4>

            <div className="grid gap-4 md:grid-cols-[1fr_auto_auto]">
              <div className="grid gap-2">
                 <Label htmlFor="amount" className="text-xs font-medium text-slate-500">Valor do Desconto</Label>
                 <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    required
                    defaultValue={defaultValues.amount}
                    className={adminInputClass}
                    placeholder="0.00"
                 />
              </div>
              <div className="grid gap-2 w-[100px]">
                 <Label className="text-xs font-medium text-slate-500">Moeda</Label>
                 <Select name="amount_currency" defaultValue={defaultValues.amount_currency ?? "USD"}>
                    <SelectTrigger className={adminSelectTriggerClass}>
                    <SelectValue placeholder="Moeda" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="BRL">BRL</SelectItem>
                    <SelectItem value="ARS">ARS</SelectItem>
                    </SelectContent>
                 </Select>
              </div>
              <div className="grid gap-2 w-[120px]">
                 <Label className="text-xs font-medium text-slate-500">Tipo</Label>
                 <Select name="amount_type" defaultValue={defaultValues.amount_type ?? "fixed"}>
                    <SelectTrigger className={adminSelectTriggerClass}>
                    <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="fixed">Valor Fixo</SelectItem>
                    <SelectItem value="percent">Porcentagem</SelectItem>
                    </SelectContent>
                 </Select>
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 pt-2">
              <div className="grid gap-2">
                <Label htmlFor="valid_from" className="text-xs font-medium text-slate-500">Válido a partir de</Label>
                <Input
                  id="valid_from"
                  name="valid_from"
                  type="date"
                  defaultValue={defaultValues.valid_from}
                  className={adminInputClass}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="valid_to" className="text-xs font-medium text-slate-500">Válido até</Label>
                <Input
                  id="valid_to"
                  name="valid_to"
                  type="date"
                  defaultValue={defaultValues.valid_to}
                  className={adminInputClass}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 mt-4">
              <div>
                <p className="text-sm font-medium text-slate-800">Regra Ativa</p>
                <p className="text-xs text-slate-500">Desative para pausar a aplicação deste desconto.</p>
              </div>
              <Switch id="is_active" name="is_active" defaultChecked={defaultValues.is_active ?? true} />
            </div>
          </div>

          {error && <p className="text-sm text-red-600 font-medium bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
        </div>

        <DialogFooter className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/50 px-8 py-5 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading} className="h-10 px-6">
            Cancelar
          </Button>
          <Button type="submit" disabled={loading} className="h-10 px-6 bg-orange-600 hover:bg-orange-700 text-white shadow-sm">
            {loading ? "Salvando..." : "Salvar Regra"}
          </Button>
        </DialogFooter>
      </form>
      </DialogContent>
    </Dialog>
  )
}
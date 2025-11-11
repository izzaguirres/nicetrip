"use client"

import { useMemo, useState } from "react"
import { Check, ChevronsUpDown, Loader2, Plus, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandList,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { adminFieldClass } from "@/components/admin/styles"

export interface MultiSelectOption {
  value: string
  label?: string
  description?: string | null
  meta?: Record<string, unknown>
}

interface MultiSelectComboboxProps {
  name: string
  placeholder?: string
  emptyMessage?: string
  options: MultiSelectOption[]
  value?: string[]
  onChange?: (values: string[]) => void
  loading?: boolean
  disabled?: boolean
  allowCustomValue?: boolean
  portalContainer?: HTMLElement | null
}

function normalizeCandidate(candidate: string) {
  return candidate.trim().replace(/\s+/g, " ")
}

export function MultiSelectCombobox({
  name,
  placeholder = "Selecionar...",
  emptyMessage = "Nenhum item encontrado",
  options,
  value = [],
  onChange,
  loading = false,
  disabled = false,
  allowCustomValue = true,
  portalContainer = null,
}: MultiSelectComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const selected = useMemo(() => new Set(value), [value])
  const MAX_BADGES = 3
  const visibleValues = value.slice(0, MAX_BADGES)
  const hiddenCount = Math.max(0, value.length - visibleValues.length)

  const toggleValue = (optionValue: string) => {
    const next = new Set(selected)
    if (next.has(optionValue)) {
      next.delete(optionValue)
    } else {
      next.add(optionValue)
    }
    const nextArray = Array.from(next)
    onChange?.(nextArray)
  }

  const removeValue = (optionValue: string) => {
    if (!selected.has(optionValue)) return
    const next = value.filter((item) => item !== optionValue)
    onChange?.(next)
  }

  const handleAddCustom = () => {
    const candidate = normalizeCandidate(search)
    if (!candidate) return
    if (selected.has(candidate)) {
      setSearch("")
      return
    }
    const next = [...value, candidate]
    onChange?.(next)
    setSearch("")
  }

  const visibleOptions = useMemo(() => {
    if (!search.trim()) return options
    const normalized = search.toLowerCase()
    return options.filter((option) => {
      const label = option.label ?? option.value
      return label.toLowerCase().includes(normalized)
    })
  }, [options, search])

  const normalizedSearch = normalizeCandidate(search)
  const canCreateCustom = allowCustomValue && Boolean(normalizedSearch) && !selected.has(normalizedSearch)

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between py-5 text-left",
              adminFieldClass,
              disabled && "opacity-70",
            )}
          >
            <span className="flex flex-1 flex-wrap items-center gap-2 overflow-hidden">
              {value.length === 0 ? (
                <span className="text-sm text-muted-foreground">{placeholder}</span>
              ) : (
                <>
                  {visibleValues.map((item) => {
                    const option = options.find((candidate) => candidate.value === item)
                    const label = option?.label ?? item
                    return (
                      <Badge
                        key={item}
                      variant="secondary"
                      className="rounded-full bg-white/80 text-xs font-medium text-slate-600 shadow-sm"
                      >
                        {label}
                      </Badge>
                    )
                  })}
                  {hiddenCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="rounded-full bg-white/70 text-xs font-medium text-slate-500"
                    >
                      +{hiddenCount}
                    </Badge>
                  )}
                </>
              )}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 text-slate-400" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          container={portalContainer ?? undefined}
          className="w-[min(420px,90vw)] rounded-3xl border border-white/60 bg-white/90 p-0 shadow-[0_30px_70px_rgba(15,23,42,0.18)] backdrop-blur-2xl"
        >
          <Command shouldFilter={false}>
            <div className="px-3 pt-3">
              <CommandInput
                placeholder="Buscar..."
                value={search}
                disabled={loading}
                onValueChange={setSearch}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && canCreateCustom) {
                    event.preventDefault()
                    handleAddCustom()
                  }
                }}
              />
            </div>
            <CommandList>
              <CommandEmpty className="flex flex-col items-center gap-2 px-4 py-6 text-sm text-muted-foreground">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                    <span>Carregando opções...</span>
                  </>
                ) : (
                  <span>{emptyMessage}</span>
                )}
              </CommandEmpty>
              <CommandGroup className="max-h-72 overflow-y-auto overscroll-contain pr-1">
                {visibleOptions.map((option) => {
                  const isSelected = selected.has(option.value)
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => toggleValue(option.value)}
                      className="flex cursor-pointer items-center justify-between gap-2 rounded-2xl px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "flex h-5 w-5 items-center justify-center rounded-full border text-xs",
                            isSelected ? "border-orange-400 bg-orange-100 text-orange-600" : "border-slate-200",
                          )}
                        >
                          {isSelected && <Check className="h-3 w-3" />}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-900">{option.label ?? option.value}</span>
                          {option.description && (
                            <span className="text-xs text-muted-foreground">{option.description}</span>
                          )}
                        </div>
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>

            {canCreateCustom && (
              <div className="border-t border-slate-100 bg-white/70 px-4 py-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center gap-2 rounded-full text-slate-600 hover:text-orange-500"
                  onClick={handleAddCustom}
                >
                  <Plus className="h-4 w-4" />
                  Adicionar <span className="font-medium text-slate-700">&quot;{normalizedSearch}&quot;</span>
                </Button>
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((item) => {
            const option = options.find((candidate) => candidate.value === item)
            const label = option?.label ?? item
            return (
              <span
                key={item}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900/5 px-3 py-1 text-xs font-medium text-slate-600"
              >
                {label}
                <button
                  type="button"
                  onClick={() => removeValue(item)}
                  className="text-slate-400 transition hover:text-orange-500"
                >
                  <X className="h-3.5 w-3.5" />
                  <span className="sr-only">Remover {label}</span>
                </button>
              </span>
            )
          })}
        </div>
      )}

      {value.map((item) => (
        <input key={item} type="hidden" name={name} value={item} />
      ))}
    </div>
  )
}

"use client"

import { useMemo, useState } from "react"
import { Check, ChevronsUpDown, Plus, X } from "lucide-react"

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

export interface SingleSelectOption {
  value: string
  label?: string
  description?: string | null
  meta?: Record<string, unknown>
}

interface SingleSelectComboboxProps {
  name: string
  value?: string | null
  onChange?: (value: string | null) => void
  options: SingleSelectOption[]
  placeholder?: string
  emptyMessage?: string
  disabled?: boolean
  allowCustomValue?: boolean
  loading?: boolean
  clearable?: boolean
  portalContainer?: HTMLElement | null
}

const normalize = (value: string) => value.toLowerCase()

export function SingleSelectCombobox({
  name,
  value = null,
  onChange,
  options,
  placeholder = "Selecione...",
  emptyMessage = "Nenhum item encontrado",
  disabled = false,
  allowCustomValue = true,
  loading = false,
  clearable = true,
  portalContainer = null,
}: SingleSelectComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const optionsMap = useMemo(() => {
    const map = new Map<string, SingleSelectOption>()
    options.forEach((option) => {
      if (!option.value) return
      map.set(normalize(option.value), option)
    })
    return map
  }, [options])

  const current = value ? optionsMap.get(normalize(value)) : undefined
  const displayLabel = current?.label ?? current?.value ?? value ?? placeholder

  const filtered = useMemo(() => {
    if (!search.trim()) return options
    const term = search.toLowerCase()
    return options.filter((option) => {
      const label = option.label ?? option.value
      return label.toLowerCase().includes(term)
    })
  }, [options, search])

  const handleSelect = (nextValue: string) => {
    if (value !== nextValue) {
      onChange?.(nextValue)
    }
    setOpen(false)
  }

  const handleCreate = () => {
    const trimmed = search.trim()
    if (!trimmed) return
    onChange?.(trimmed)
    setOpen(false)
    setSearch("")
  }

  const handleClear = () => {
    onChange?.(null)
    setSearch("")
  }

  const canCreate = allowCustomValue && Boolean(search.trim()) && !optionsMap.has(normalize(search))

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between py-5 text-left min-h-[48px]",
              adminFieldClass,
              disabled && "opacity-70",
            )}
          >
            <span className="flex min-w-0 flex-1 items-center gap-2">
              <span className={cn("truncate text-sm", value ? "text-slate-700" : "text-muted-foreground")}> 
                {displayLabel}
              </span>
            </span>
            <div className="flex items-center gap-1">
              {clearable && value && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    handleClear()
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      handleClear()
                    }
                  }}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Limpar seleção"
                >
                  <X className="h-3.5 w-3.5" />
                </span>
              )}
              <ChevronsUpDown className="h-4 w-4 text-slate-400" />
            </div>
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
              />
            </div>
            <CommandList>
              <CommandEmpty className="flex flex-col items-center gap-2 px-4 py-6 text-sm text-muted-foreground">
                {loading ? "Carregando opções..." : emptyMessage}
              </CommandEmpty>
              <CommandGroup className="max-h-72 overflow-y-auto overscroll-contain pr-1">
                {filtered.map((option) => {
                  const isSelected = value != null && normalize(option.value) === normalize(value)
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => handleSelect(option.value)}
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

            {canCreate && (
              <div className="border-t border-slate-100 bg-white/70 px-4 py-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center gap-2 rounded-full text-slate-600 hover:text-orange-500"
                  onClick={handleCreate}
                >
                  <Plus className="h-4 w-4" />
                  Usar “{search.trim()}”
                </Button>
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>
      <input type="hidden" name={name} value={value ?? ""} />
    </>
  )
}

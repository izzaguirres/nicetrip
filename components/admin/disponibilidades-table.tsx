"use client"

import { useMemo, useState } from 'react'
import type { Disponibilidade } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DisponibilidadeForm, type DisponibilidadeFormData } from './disponibilidade-form'
import { useRouter, useSearchParams } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { AdminSurface } from '@/components/admin/surface'
import { adminInputClass, adminSelectTriggerClass } from '@/components/admin/styles'

interface DisponibilidadesTableProps {
  records: Disponibilidade[]
  total: number
  page: number
  limit: number
  filters: {
    destino?: string
    transporte?: string
    data_saida?: string
    hotel?: string
  }
  lookupDestinos: string[]
  lookupHoteis: string[]
}

const TRANSPORT_OPTIONS = [
  { value: 'bus', label: 'Bús' },
  { value: 'aereo', label: 'Aéreo' },
]

const normalizeTransportFilter = (value?: string) => {
  if (!value) return ''
  const normalized = value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z]/g, '')
  if (normalized.includes('aer')) return 'aereo'
  if (normalized.includes('bus')) return 'bus'
  return value
}

const formatDate = (value?: string | null) => {
  if (!value) return '—'
  try {
    return format(new Date(value), 'dd MMM yyyy', { locale: ptBR })
  } catch {
    return value
  }
}

const toCurrency = (value?: number | null) => {
  if (value == null || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD' }).format(value)
}

type FormMode = 'create' | 'edit' | 'duplicate'

export function DisponibilidadesTable({
  records,
  total,
  page,
  limit,
  filters,
  lookupDestinos,
  lookupHoteis,
}: DisponibilidadesTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<FormMode>('create')
  const [selected, setSelected] = useState<DisponibilidadeFormData | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const [filterDestino, setFilterDestino] = useState(filters.destino ?? '')
  const [filterHotel, setFilterHotel] = useState(filters.hotel ?? '')
  const [filterTransporte, setFilterTransporte] = useState(normalizeTransportFilter(filters.transporte))
  const [filterData, setFilterData] = useState(filters.data_saida ?? '')

  const totalPages = Math.max(1, Math.ceil(total / Math.max(limit, 1)))

  const openForm = (formMode: FormMode, data?: DisponibilidadeFormData) => {
    setMode(formMode)
    setSelected(
      formMode === 'duplicate' && data
        ? { ...data, id: undefined, slug: `${data.slug ?? ''}-copy`.replace(/--+/g, '-').replace(/-$/, '') }
        : data,
    )
    setOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja remover esta disponibilidade?')) return
    setDeletingId(id)
    setError(null)
    try {
      const response = await fetch(`/api/admin/disponibilidades?id=${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Erro ao remover disponibilidade')
      }
      router.refresh()
      toast({
        title: 'Disponibilidade removida',
        description: 'O registro foi excluído do catálogo.',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
      toast({
        variant: 'destructive',
        title: 'Falha ao remover disponibilidade',
        description: err instanceof Error ? err.message : 'Erro inesperado',
      })
    } finally {
      setDeletingId(null)
    }
  }

  const handleFilterSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const params = new URLSearchParams(searchParams?.toString() ?? '')
    filterDestino ? params.set('destino', filterDestino) : params.delete('destino')
    filterHotel ? params.set('hotel', filterHotel) : params.delete('hotel')
    filterTransporte ? params.set('transporte', filterTransporte) : params.delete('transporte')
    filterData ? params.set('data_saida', filterData) : params.delete('data_saida')
    params.delete('page')
    router.replace(`/admin/disponibilidades?${params.toString()}`)
  }

  const goToPage = (target: number) => {
    const next = Math.min(Math.max(1, target), totalPages)
    const params = new URLSearchParams(searchParams?.toString() ?? '')
    params.set('page', String(next))
    params.set('limit', String(limit))
    router.replace(`/admin/disponibilidades?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Disponibilidades cadastradas</h2>
          <p className="text-sm text-slate-500">
            Atualize pacotes, datas e preços aprovados para o Smart Filter em um só lugar.
          </p>
        </div>
        <Button
          onClick={() => openForm('create')}
          className="rounded-full bg-gradient-to-br from-orange-400 to-orange-500 px-5 text-white shadow-lg hover:from-orange-500 hover:to-orange-600"
        >
          Nova disponibilidade
        </Button>
      </div>

      <AdminSurface className="p-5">
        <form
          className="grid gap-3 md:grid-cols-[2fr_2fr_1fr_1fr_auto]"
          onSubmit={handleFilterSubmit}
        >
        <div className="grid gap-2">
          <LabelSmall>Destino</LabelSmall>
          {lookupDestinos.length > 0 ? (
            <Select
              value={filterDestino ? filterDestino : 'all'}
              onValueChange={(value) => setFilterDestino(value === 'all' ? '' : value)}
            >
              <SelectTrigger className={adminSelectTriggerClass}>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {lookupDestinos.map((destino) => (
                  <SelectItem key={destino} value={destino}>
                    {destino}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              placeholder="Ex.: Florianópolis"
              value={filterDestino}
              onChange={(event) => setFilterDestino(event.target.value)}
              className={adminInputClass}
            />
          )}
        </div>
        <div className="grid gap-2">
          <LabelSmall>Hotel</LabelSmall>
          {lookupHoteis.length > 0 ? (
            <Select
              value={filterHotel ? filterHotel : 'all'}
              onValueChange={(value) => setFilterHotel(value === 'all' ? '' : value)}
            >
              <SelectTrigger className={adminSelectTriggerClass}>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {lookupHoteis.map((hotel) => (
                  <SelectItem key={hotel} value={hotel}>
                    {hotel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              placeholder="Hotel ou pousada"
              value={filterHotel}
              onChange={(event) => setFilterHotel(event.target.value)}
              className={adminInputClass}
            />
          )}
        </div>
        <div className="grid gap-2">
          <LabelSmall>Transporte</LabelSmall>
          <Select
            value={filterTransporte ? filterTransporte : 'all'}
            onValueChange={(value) => setFilterTransporte(value === 'all' ? '' : value)}
          >
            <SelectTrigger className={adminSelectTriggerClass}>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {TRANSPORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <LabelSmall>Data</LabelSmall>
          <Input
            type="date"
            value={filterData}
            onChange={(event) => setFilterData(event.target.value)}
            className={adminInputClass}
          />
        </div>
        <div className="flex items-end gap-2">
          <Button type="submit" className="w-full md:w-auto">
            Filtrar
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFilterDestino('')
              setFilterHotel('')
              setFilterTransporte('')
              setFilterData('')
              router.replace('/admin/disponibilidades')
            }}
          >
            Limpar
          </Button>
        </div>
        </form>
      </AdminSurface>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <AdminSurface className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Destino</TableHead>
              <TableHead>Transporte</TableHead>
              <TableHead>Hotel</TableHead>
              <TableHead>Quarto</TableHead>
              <TableHead>Cap.</TableHead>
              <TableHead>Adulto</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id} className="transition hover:bg-white/70">
                <TableCell>{formatDate(record.data_saida)}</TableCell>
                <TableCell>
                  <span className="font-medium text-gray-900">{record.destino}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{record.transporte}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{record.hotel}</span>
                  </div>
                </TableCell>
                <TableCell>{record.quarto_tipo || '—'}</TableCell>
                <TableCell className="text-center">{record.capacidade ?? '—'}</TableCell>
                <TableCell>{toCurrency(record.preco_adulto)}</TableCell>
                <TableCell className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full border-slate-200 text-slate-600 hover:text-slate-900"
                    onClick={() => openForm('edit', record)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full border-slate-200 text-slate-600 hover:text-slate-900"
                    onClick={() => openForm('duplicate', record)}
                  >
                    Duplicar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full hover:bg-red-50"
                    disabled={deletingId === Number(record.id)}
                    onClick={() => handleDelete(Number(record.id))}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {records.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  Nenhuma disponibilidade encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </AdminSurface>

      <div className="flex flex-col gap-2 rounded-3xl border border-white/70 bg-white/80 p-4 text-sm text-slate-500 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur-xl md:flex-row md:items-center md:justify-between">
        <p>
          {total} resultado{total === 1 ? '' : 's'} • Página {page} de {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-slate-200 text-slate-600 hover:text-slate-900"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-slate-200 text-slate-600 hover:text-slate-900"
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages}
          >
            Próxima
          </Button>
        </div>
      </div>

      <DisponibilidadeForm open={open} onOpenChange={setOpen} initialData={selected} mode={mode} />
    </div>
  )
}

function LabelSmall({ children }: { children: React.ReactNode }) {
  return <span className="text-xs font-medium text-muted-foreground uppercase">{children}</span>
}

"use client"

import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { DiscountRule } from '@/lib/supabase'
import { formatSelectedAgeGroups } from '@/lib/discount-age-groups'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { DiscountRuleForm } from './discount-rule-form'
import { Trash2, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { AdminSurface } from '@/components/admin/surface'

interface DiscountRulesTableProps {
  rules: DiscountRule[]
}

const formatDate = (date: string | null) => {
  if (!date) return '—'
  return format(new Date(date), 'dd MMM yyyy', { locale: ptBR })
}

export function DiscountRulesTable({ rules }: DiscountRulesTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [selectedRule, setSelectedRule] = useState<DiscountRule | undefined>(undefined)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleNew = () => {
    setSelectedRule(undefined)
    setOpen(true)
  }

  const handleEdit = (rule: DiscountRule) => {
    setSelectedRule(rule)
    setOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover esta regra?')) return
    setDeletingId(id)
    setError(null)
    try {
      const response = await fetch(`/api/admin/discount-rules?id=${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao remover regra')
      }
      router.refresh()
      toast({
        title: 'Regra removida',
        description: 'A regra de desconto foi excluída.',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
      toast({
        variant: 'destructive',
        title: 'Falha ao remover regra',
        description: err instanceof Error ? err.message : 'Erro inesperado',
      })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Regras cadastradas</h2>
          <p className="text-sm text-slate-500">
            Selecione destinos, hotéis ou pacotes para aplicar descontos com total transparência.
          </p>
        </div>
        <Button
          onClick={handleNew}
          className="rounded-full bg-gradient-to-br from-orange-400 to-orange-500 px-6 text-white shadow-lg hover:from-orange-500 hover:to-orange-600"
        >
          <Plus className="h-4 w-4" /> Nova regra
        </Button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <AdminSurface className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Transporte</TableHead>
              <TableHead>Destinos</TableHead>
              <TableHead>Pacotes / Hotéis</TableHead>
              <TableHead>Faixa etária</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Validade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[120px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.map((rule) => (
              <TableRow key={rule.id} className="transition hover:bg-white/70">
                <TableCell>{rule.name}</TableCell>
                <TableCell>{rule.transport_type || 'Todos'}</TableCell>
                <TableCell>
                  {rule.destinations && rule.destinations.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {rule.destinations.map((dest) => (
                        <Badge variant="secondary" key={dest}>
                          {dest}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    'Qualquer'
                  )}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex flex-wrap gap-1">
                      {rule.hotel_names && rule.hotel_names.length > 0 ? (
                        rule.hotel_names.map((hotel) => (
                          <Badge key={hotel} variant="outline">
                            {hotel}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">Hotéis: Todos</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {rule.package_slugs && rule.package_slugs.length > 0
                        ? `${rule.package_slugs.length} pacote${rule.package_slugs.length > 1 ? 's' : ''} vinculados automaticamente`
                        : 'Pacotes: automático'}
                    </p>
                  </div>
                </TableCell>
                <TableCell>{formatSelectedAgeGroups(rule.age_groups, rule.age_min, rule.age_max)}</TableCell>
                <TableCell>
                  {rule.amount_type === 'percent'
                    ? `${rule.amount}%`
                    : `${rule.amount_currency} ${rule.amount.toFixed(2)}`}
                </TableCell>
                <TableCell>
                  {formatDate(rule.valid_from)} → {formatDate(rule.valid_to)}
                </TableCell>
                <TableCell>
                  <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                    {rule.is_active ? 'Ativa' : 'Inativa'}
                  </Badge>
                </TableCell>
                <TableCell className="space-x-2 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full border-slate-200 text-slate-600 hover:text-slate-900"
                    onClick={() => handleEdit(rule)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full hover:bg-red-50"
                    disabled={deletingId === rule.id}
                    onClick={() => handleDelete(rule.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {rules.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  Nenhuma regra cadastrada ainda.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </AdminSurface>

      <DiscountRuleForm
        open={open}
        onOpenChange={setOpen}
        initialData={selectedRule}
      />
    </div>
  )
}

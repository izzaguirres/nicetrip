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
import { Trash2, Plus, Pencil, Calendar } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { AdminSurface } from '@/components/admin/surface'

interface DiscountRulesTableProps {
  rules: DiscountRule[]
}

const formatDate = (date: string | null) => {
  if (!date) return '—'
  return format(new Date(date), 'dd MMM', { locale: ptBR })
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Regras de Desconto</h2>
          <p className="text-sm text-slate-500 mt-1">
            Configure campanhas e descontos automáticos.
          </p>
        </div>
        <Button
          onClick={handleNew}
          className="bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" /> Nova Regra
        </Button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <AdminSurface className="overflow-hidden p-0 shadow-sm border border-slate-200">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="border-b border-slate-100 hover:bg-transparent">
              <TableHead className="w-[180px]">Nome</TableHead>
              <TableHead>Transporte</TableHead>
              <TableHead>Segmentação</TableHead>
              <TableHead>Público / Idade</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Validade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.map((rule) => (
              <TableRow key={rule.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                <TableCell className="font-medium text-slate-900">{rule.name}</TableCell>
                <TableCell>
                   <Badge variant="outline" className="rounded-md font-normal text-slate-600 bg-white border-slate-200">
                      {rule.transport_type || 'Todos'}
                   </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1.5 max-w-[200px]">
                    {rule.destinations && rule.destinations.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {rule.destinations.slice(0, 2).map((dest) => (
                                <span key={dest} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700">
                                {dest}
                                </span>
                            ))}
                            {rule.destinations.length > 2 && <span className="text-[10px] text-slate-400">+{rule.destinations.length - 2}</span>}
                        </div>
                    )}
                    {rule.hotel_names && rule.hotel_names.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {rule.hotel_names.slice(0, 1).map((hotel) => (
                                <span key={hotel} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-700 truncate max-w-full">
                                {hotel}
                                </span>
                            ))}
                            {rule.hotel_names.length > 1 && <span className="text-[10px] text-slate-400">+{rule.hotel_names.length - 1}</span>}
                        </div>
                    )}
                    {!rule.destinations?.length && !rule.hotel_names?.length && (
                        <span className="text-xs text-slate-400 italic">Global</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                   <span className="text-xs text-slate-600">{formatSelectedAgeGroups(rule.age_groups, rule.age_min, rule.age_max)}</span>
                </TableCell>
                <TableCell>
                  <span className="font-mono font-medium text-slate-900 bg-slate-50 px-2 py-1 rounded">
                    {rule.amount_type === 'percent'
                        ? `${rule.amount}% OFF`
                        : `- ${rule.amount_currency} ${rule.amount.toFixed(2)}`}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                     <Calendar className="w-3 h-3" />
                     {formatDate(rule.valid_from)} → {formatDate(rule.valid_to)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                     <span className={`h-2 w-2 rounded-full ${rule.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                     <span className="text-xs text-slate-500">{rule.is_active ? 'Ativa' : 'Inativa'}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-600"
                        onClick={() => handleEdit(rule)}
                    >
                        <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-slate-500 hover:text-red-600"
                        disabled={deletingId === rule.id}
                        onClick={() => handleDelete(rule.id)}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {rules.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center text-slate-500">
                  Nenhuma regra de desconto encontrada.
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

import Link from 'next/link'
import { AdminSurface } from '@/components/admin/surface'
import type { AuditLogEntry } from '@/lib/admin-audit'
import { Clock, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

const interestingFields = ['slug', 'hotel', 'destino', 'capacidade', 'data_saida']

const summarizePayload = (payload: Record<string, unknown> | null) => {
  if (!payload) return null
  const summary = payload.summary as Record<string, unknown> | undefined
  const changes = payload.changes as Record<string, { before: unknown; after: unknown }> | undefined

  const summaryParts = summary
    ? interestingFields
        .filter((field) => summary[field] !== undefined)
        .map((field) => `${field}: ${formatValue(summary[field])}`)
    : []

  const changeParts = changes
    ? Object.entries(changes).map(([field, diff]) =>
        `${field}: ${formatValue(diff.before)} → ${formatValue(diff.after)}`,
      )
    : []

  const combined = [...changeParts, ...summaryParts]
  if (combined.length) {
    return combined.slice(0, 4).join(' · ')
  }
  return null
}

const formatValue = (value: unknown) => {
  if (value == null || value === '') return '—'
  if (typeof value === 'number') return value
  return String(value)
}

interface DisponibilidadeActivityProps {
  entries: AuditLogEntry[]
}

export function DisponibilidadeActivity({ entries }: DisponibilidadeActivityProps) {
  if (!entries.length) return null

  return (
    <AdminSurface className="p-0 overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-slate-100">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Atividade Recente</h3>
          <p className="text-sm text-slate-500">Histórico de alterações em disponibilidades</p>
        </div>
        <Link href="/admin/audit-log?entity=disponibilidade">
           <Button variant="outline" size="sm" className="h-8 text-xs">
              Ver log completo
           </Button>
        </Link>
      </div>

      <div className="divide-y divide-slate-50">
        {entries.map((entry) => {
          const summary = summarizePayload(entry.payload)
          const isInsert = entry.action === 'insert'
          const isUpdate = entry.action === 'update'
          
          return (
            <div key={entry.id} className="flex flex-col gap-1 p-4 hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                       isInsert ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20' : 
                       isUpdate ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20' : 
                       'bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-500/10'
                    }`}>
                       {isInsert ? 'Nova' : isUpdate ? 'Edição' : 'Ação'}
                    </span>
                    <span className="text-sm font-medium text-slate-900">
                       ID: {entry.entity_id || 'N/A'}
                    </span>
                 </div>
                 <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    {formatDateTime(entry.created_at)}
                 </div>
              </div>
              
              <div className="mt-1 flex items-start gap-2">
                 <User className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                 <span className="text-xs text-slate-600">
                    <span className="font-medium text-slate-700">{entry.performed_by ?? 'Sistema'}</span>
                 </span>
              </div>
              
              {summary && (
                 <div className="mt-2 text-xs text-slate-500 bg-slate-50 p-2 rounded-md font-mono">
                    {summary}
                 </div>
              )}
            </div>
          )
        })}
      </div>
    </AdminSurface>
  )
}

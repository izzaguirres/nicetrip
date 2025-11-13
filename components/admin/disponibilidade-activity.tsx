import Link from 'next/link'
import { AdminSurface } from '@/components/admin/surface'
import type { AuditLogEntry } from '@/lib/admin-audit'

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
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
    <AdminSurface className="space-y-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Atividade recente</p>
          <h3 className="text-lg font-semibold text-slate-900">Mudanças nas disponibilidades</h3>
        </div>
        <Link
          href="/admin/audit-log?entity=disponibilidade"
          className="text-sm font-semibold text-orange-600 hover:text-orange-500"
        >
          Ver log completo
        </Link>
      </div>

      <ul className="space-y-3">
        {entries.map((entry) => {
          const summary = summarizePayload(entry.payload)
          return (
            <li key={entry.id} className="flex flex-col gap-1 rounded-2xl border border-slate-100 bg-white/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-medium text-slate-900">
                {entry.action === 'update' ? 'Atualização' : entry.action === 'insert' ? 'Nova disponibilidade' : 'Ação' }
                {entry.entity_id && ` · ${entry.entity_id}`}
              </div>
              <span className="text-xs text-muted-foreground">{formatDateTime(entry.created_at)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              por <span className="font-medium text-slate-900">{entry.performed_by ?? 'Sistema'}</span>
            </p>
            {summary && (
              <p className="text-xs text-slate-600">
                {summary}
              </p>
            )}
            </li>
          )
        })}
      </ul>
    </AdminSurface>
  )
}

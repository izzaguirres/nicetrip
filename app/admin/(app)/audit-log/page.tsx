import { listAuditLogs } from '@/lib/admin-audit'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AuditLogFilters } from '@/components/admin/audit-log-filters'

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
})

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const normalizeParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value ?? ''

const parseDays = (value: string): number => {
  const parsed = Number(value || '30')
  if (!Number.isFinite(parsed)) return 30
  if (parsed <= 7) return 7
  if (parsed >= 90) return 90
  return 30
}

export default async function AuditLogPage({ searchParams }: PageProps) {
  const params = await searchParams
  const entity = normalizeParam(params.entity)
  const action = normalizeParam(params.action)
  const performedBy = normalizeParam(params.performedBy)
  const days = parseDays(normalizeParam(params.days))

  const entries = await listAuditLogs({
    limit: 200,
    entity: entity || undefined,
    action: action || undefined,
    performedBy: performedBy || undefined,
    days,
  })

  const entityOptions = Array.from(
    new Set([...entries.map((entry) => entry.entity), ...(entity ? [entity] : [])]),
  ).sort((a, b) => a.localeCompare(b))
  const actionOptions = Array.from(
    new Set([...entries.map((entry) => entry.action), ...(action ? [action] : [])]),
  ).sort((a, b) => a.localeCompare(b))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Log de mudanças</h1>
        <p className="text-muted-foreground">
          Histórico das ações administrativas realizadas no painel.
        </p>
      </div>

      <AuditLogFilters
        entities={entityOptions}
        actions={actionOptions}
        initial={{ entity, action, performedBy, days }}
      />

      <p className="text-sm text-muted-foreground">
        {entries.length} registro{entries.length === 1 ? '' : 's'} exibido{entries.length === 1 ? '' : 's'}.
      </p>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Entidade</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Detalhes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="whitespace-nowrap">
                  {formatDateTime(entry.created_at)}
                </TableCell>
                <TableCell className="font-medium uppercase text-xs text-orange-600">
                  {entry.action}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{entry.entity}</span>
                    {entry.entity_id && (
                      <span className="text-xs text-muted-foreground">{entry.entity_id}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {entry.performed_by ?? '—'}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {entry.payload ? (
                    <code className="block max-w-md overflow-hidden text-ellipsis whitespace-pre-wrap">
                      {JSON.stringify(entry.payload, null, 2)}
                    </code>
                  ) : (
                    '—'
                  )}
                </TableCell>
              </TableRow>
            ))}
            {entries.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

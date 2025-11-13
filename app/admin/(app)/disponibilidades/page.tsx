import { listAdminDisponibilidades, listDisponibilidadeLookups } from '@/lib/admin-disponibilidades'
import { DisponibilidadesTable } from '@/components/admin/disponibilidades-table'
import { DisponibilidadeImport } from '@/components/admin/disponibilidade-import'
import { listAuditLogs } from '@/lib/admin-audit'
import { DisponibilidadeActivity } from '@/components/admin/disponibilidade-activity'

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const parseParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value

export default async function AdminDisponibilidadesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const destino = parseParam(params.destino)
  const transporte = parseParam(params.transporte)
  const data_saida = parseParam(params.data_saida)
  const hotel = parseParam(params.hotel)
  const limit = Number(parseParam(params.limit) ?? '50')
  const page = Number(parseParam(params.page) ?? '1')
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 200) : 50
  const safePage = Number.isFinite(page) && page > 0 ? page : 1
  const offset = (safePage - 1) * safeLimit

  const [{ records, total }, lookups, recentActivity] = await Promise.all([
    listAdminDisponibilidades({
      destino: destino || undefined,
      transporte: transporte || undefined,
      data_saida: data_saida || undefined,
      hotel: hotel || undefined,
      limit: safeLimit,
      offset,
    }),
    listDisponibilidadeLookups(),
    listAuditLogs({ entity: 'disponibilidade', limit: 10, days: 14 }),
  ])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Disponibilidades</h1>
        <p className="text-muted-foreground">
          Gerencie saídas, preços e quartos disponíveis para os pacotes e hospedagens.
        </p>
      </div>
      <DisponibilidadeImport />
      <DisponibilidadesTable
        records={records}
        total={total}
        page={safePage}
        limit={safeLimit}
        filters={{
          destino: destino || undefined,
          transporte: transporte || undefined,
          data_saida: data_saida || undefined,
          hotel: hotel || undefined,
        }}
        lookupDestinos={lookups.destinos}
        lookupHoteis={lookups.hoteis}
      />
      <DisponibilidadeActivity entries={recentActivity} />
    </div>
  )
}

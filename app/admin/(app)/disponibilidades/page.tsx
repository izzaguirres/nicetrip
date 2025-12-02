import { getDashboardHotels } from '@/lib/admin-disponibilidades'
import { DisponibilidadesTable } from '@/components/admin/disponibilidades-table'
import { DisponibilidadeImport } from '@/components/admin/disponibilidade-import'
import { listAuditLogs } from '@/lib/admin-audit'
import { DisponibilidadeActivity } from '@/components/admin/disponibilidade-activity'

export default async function AdminDisponibilidadesPage() {
  // Buscar dados otimizados para o dashboard (todos os hotéis únicos)
  const hotels = await getDashboardHotels()
  const recentActivity = await listAuditLogs({ entity: 'disponibilidade', limit: 10, days: 14 })

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Importação em Massa (Collapsible) */}
      <DisponibilidadeImport />

      {/* Grid Principal de Hotéis */}
      <DisponibilidadesTable hotels={hotels} />

      {/* Seção de Atividade */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <DisponibilidadeActivity entries={recentActivity} />
        </div>
        {/* Espaço para widget futuro ou stats rápidos */}
      </div>
    </div>
  )
}
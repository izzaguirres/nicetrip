import { listPromotions } from '@/lib/admin-promotions'
import { PromotionList } from '@/components/admin/promotions-list'

export default async function PromotionsPage() {
  const promotions = await listPromotions()
  const grouped = {
    paquete: promotions.filter((item) => item.type === 'paquete'),
    hospedaje: promotions.filter((item) => item.type === 'hospedaje'),
    paseo: promotions.filter((item) => item.type === 'paseo'),
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/70 bg-white/90 p-8 shadow-[0_32px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Landing pública</p>
        <h1 className="text-3xl font-semibold text-slate-900">Promociones listas para salir al aire</h1>
        <p className="mt-2 text-sm text-slate-500">
          Actualizá las cards que aparecen en la home y asegurate de que el equipo comercial tenga ofertas frescas, con precios validados y CTA directo al WhatsApp.
        </p>
      </div>

      <PromotionList type="paquete" label="Paquetes" items={grouped.paquete} />
      <PromotionList type="hospedaje" label="Hospedajes" items={grouped.hospedaje} />
      <PromotionList type="paseo" label="Passeios" items={grouped.paseo} />
    </div>
  )
}

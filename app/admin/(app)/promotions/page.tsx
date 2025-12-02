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
    <div className="space-y-8">
      <PromotionList type="paquete" label="Paquetes" items={grouped.paquete} />
      <PromotionList type="hospedaje" label="Hospedajes" items={grouped.hospedaje} />
      <PromotionList type="paseo" label="Passeios" items={grouped.paseo} />
    </div>
  )
}

import { listDiscountRules } from '@/lib/admin-discounts'
import { DiscountRulesTable } from '@/components/admin/discount-rules-table'

export default async function DiscountRulesPage() {
  const rules = await listDiscountRules()
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Regras de desconto</h1>
        <p className="text-muted-foreground">
          Configure valores promocionais por transporte, destino e faixa etária. As regras são aplicadas automaticamente nos pacotes.
        </p>
      </div>
      <DiscountRulesTable rules={rules} />
    </div>
  )
}


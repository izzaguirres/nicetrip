import { listDiscountRules } from '@/lib/admin-discounts'
import { DiscountRulesTable } from '@/components/admin/discount-rules-table'

export default async function DiscountRulesPage() {
  const rules = await listDiscountRules()
  return (
    <div>
      <DiscountRulesTable rules={rules} />
    </div>
  )
}


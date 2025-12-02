import { listAddons } from "@/lib/admin-addons"
import { AddonsManager } from "@/components/admin/addons-manager"

export default async function AddonsPage() {
  const addons = await listAddons()

  return (
    <div className="space-y-6">
      <AddonsManager initialData={addons} />
    </div>
  )
}

"use client"

import { useState } from "react"
import { PaseosList } from "@/components/admin/paseos-list"
import { PaseosForm } from "@/components/admin/paseos-form"
import { type Paseo } from "@/lib/passeios-service"
import { Button } from "@/components/ui/button"
import { Plus, Sun } from "lucide-react"

export default function AdminPasseiosPage() {
  const [editingItem, setEditingItem] = useState<Paseo | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleEdit = (item: Paseo) => {
    setEditingItem(item)
    setIsFormOpen(true)
  }

  const handleSuccess = () => {
    setIsFormOpen(false)
    setEditingItem(null)
    setRefreshTrigger(prev => prev + 1)
  }

  const handleNew = () => {
    setEditingItem(null)
    setIsFormOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-lg text-orange-700">
              <Sun className="w-8 h-8" />
            </div>
            Gestão de Passeios
          </h1>
          <p className="text-muted-foreground mt-1 ml-14">
            Gerencie tarifas, informações e disponibilidade dos passeios turísticos.
          </p>
        </div>
        <Button onClick={handleNew} className="bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-200">
          <Plus className="mr-2 h-4 w-4" /> Novo Passeio
        </Button>
      </div>

      <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">
         <div className={isFormOpen ? "xl:col-span-2" : "xl:col-span-3"}>
            <PaseosList 
               onEdit={handleEdit} 
               refreshTrigger={refreshTrigger}
            />
         </div>

         {isFormOpen && (
            <div className="xl:col-span-1 animate-in slide-in-from-right duration-500">
               <PaseosForm 
                  initialData={editingItem}
                  onSuccess={handleSuccess}
                  onCancel={() => {
                     setIsFormOpen(false)
                     setEditingItem(null)
                  }}
               />
            </div>
         )}
      </div>
    </div>
  )
}

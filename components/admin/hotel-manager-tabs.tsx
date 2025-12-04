"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PackageAvailabilityList } from "@/components/admin/package-availability-list"
import { HotelDetailsForm } from "@/components/admin/hotel-details-form"

interface HotelManagerTabsProps {
  hotelSlug: string
  hotelData: any // Metadados completos
  isNew: boolean
}

export function HotelManagerTabs({ hotelSlug, hotelData, isNew }: HotelManagerTabsProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("disponibilidade")

  return (
    <div className="space-y-6">
      {/* Header de Navegação */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isNew ? "Novo Hotel" : `Gerenciar: ${hotelData.nome}`}
            </h1>
            <p className="text-sm text-muted-foreground">
              {hotelData.destino || "Sem destino definido"}
            </p>
          </div>
        </div>
      </div>

      {/* Abas Principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="disponibilidade">Disponibilidade & Tarifas</TabsTrigger>
          <TabsTrigger value="detalhes">Detalhes do Pacote</TabsTrigger>
        </TabsList>

        <TabsContent value="disponibilidade" className="space-y-4">
           {/* Lista rica de pacotes (tabela disponibilidades) */}
           <PackageAvailabilityList hotelName={hotelData.nome} />
        </TabsContent>

        <TabsContent value="detalhes">
           {/* Aqui entra o formulário de edição de metadados */}
           <HotelDetailsForm initialData={hotelData} isNew={isNew} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Loader2, Bus, Plane, AlertCircle } from "lucide-react"
import { upsertDisponibilidade } from "@/lib/admin-disponibilidades-client"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface PackageDateEditorProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  date: string
  transporte: string
  hotelName: string
  items: any[] // Lista de disponibilidades (Doble, Triple, etc) desta data
}

export function PackageDateEditor({ 
  isOpen, onClose, onSuccess, date, transporte, hotelName, items 
}: PackageDateEditorProps) {
  
  const [records, setRecords] = useState(
    items
      .map(i => ({
        ...i,
        ativo: i.ativo === false ? false : true
      }))
      .sort((a, b) => (a.capacidade || 0) - (b.capacidade || 0))
  )
  const [saving, setSaving] = useState(false)
  const [errorSummary, setErrorSummary] = useState<string | null>(null)
  const { toast } = useToast()

  const handleChange = (index: number, field: string, value: any) => {
    const newRecords = [...records]
    newRecords[index] = { ...newRecords[index], [field]: value }
    setRecords(newRecords)
    setErrorSummary(null) // Limpa erro ao editar
  }

  const handleSave = async () => {
    setSaving(true)
    setErrorSummary(null)
    
    try {
      const promises = records.map(record => 
        upsertDisponibilidade({
           ...record,
           hotel: record.hotel || hotelName,
           preco_adulto: Number(record.preco_adulto),
           preco_crianca_0_3: Number(record.preco_crianca_0_3),
           preco_crianca_4_5: Number(record.preco_crianca_4_5),
           preco_crianca_6_mais: Number(record.preco_crianca_6_mais)
        })
      )
      
      const results = await Promise.allSettled(promises)
      
      const rejected = results.filter(r => r.status === 'rejected') as PromiseRejectedResult[]
      
      if (rejected.length > 0) {
         // Caso parcial ou total de erro
         console.error("Erros ao salvar:", rejected)
         
         // Tenta extrair a primeira mensagem de erro real
         const firstError = rejected[0].reason?.message || "Erro desconhecido"
         const isRlsError = firstError.includes("row-level security") || firstError.includes("permission denied")
         
         let errorMsg = `Falha ao salvar ${rejected.length} de ${records.length} registros.`
         if (isRlsError) {
            errorMsg += " Permissão negada (RLS). Verifique se seu usuário é Admin."
         } else {
            errorMsg += ` Detalhe: ${firstError}`
         }
         
         setErrorSummary(errorMsg)
         toast({ variant: "destructive", title: "Erro ao salvar", description: errorMsg })
      } else {
         toast({ title: "Tarifas atualizadas com sucesso!" })
         onSuccess()
         onClose()
      }

    } catch (error: any) {
      console.error(error)
      setErrorSummary(error.message || "Erro desconhecido ao processar.")
      toast({ variant: "destructive", title: "Erro crítico", description: error.message })
    } finally {
      setSaving(false)
    }
  }

  const dateObj = new Date(date + "T12:00:00")

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center gap-3 mb-2">
             <Badge variant={transporte.toLowerCase().includes('aer') ? 'secondary' : 'default'} className="text-sm px-3 py-1">
                {transporte.toLowerCase().includes('aer') ? <Plane className="w-4 h-4 mr-2" /> : <Bus className="w-4 h-4 mr-2" />}
                {transporte}
             </Badge>
             <DialogTitle className="text-2xl capitalize font-normal text-slate-700">
                {format(dateObj, "dd 'de' MMMM, yyyy", { locale: es })}
             </DialogTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Gerenciamento de tarifas para <strong>{hotelName}</strong>.
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {errorSummary && (
             <Alert variant="destructive">
               <AlertCircle className="h-4 w-4" />
               <AlertTitle>Erro</AlertTitle>
               <AlertDescription>{errorSummary}</AlertDescription>
             </Alert>
          )}

          <div className="grid gap-4">
             {records.map((record, idx) => (
               <div key={record.id || idx} className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-all hover:border-orange-200">
                  <div className="flex items-center justify-between mb-4 border-b pb-2 border-slate-100">
                     <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-slate-50 font-bold text-sm px-3 py-1 text-slate-800">
                           {record.tipo_quarto || `Opção ${idx + 1}`}
                        </Badge>
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                           Capacidade: {record.capacidade}
                        </span>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                     <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-600">Preço Adulto</Label>
                        <div className="relative">
                           <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">USD</span>
                           <Input 
                              type="number" 
                              step="0.01"
                              className="pl-10 font-bold text-green-700 bg-green-50/50 border-green-100 focus-visible:ring-green-500"
                              value={record.preco_adulto}
                              onChange={(e) => handleChange(idx, 'preco_adulto', e.target.value)}
                           />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <Label className="text-xs font-medium text-slate-500">Criança 0-3 anos</Label>
                        <div className="relative">
                           <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">USD</span>
                           <Input 
                              type="number" 
                              step="0.01"
                              className="pl-10"
                              value={record.preco_crianca_0_3}
                              onChange={(e) => handleChange(idx, 'preco_crianca_0_3', e.target.value)}
                           />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <Label className="text-xs font-medium text-slate-500">Criança 4-5 anos</Label>
                         <div className="relative">
                           <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">USD</span>
                           <Input 
                              type="number" 
                              step="0.01"
                              className="pl-10"
                              value={record.preco_crianca_4_5}
                              onChange={(e) => handleChange(idx, 'preco_crianca_4_5', e.target.value)}
                           />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <Label className="text-xs font-medium text-slate-500">Criança 6+ anos</Label>
                         <div className="relative">
                           <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">USD</span>
                           <Input 
                              type="number" 
                              step="0.01"
                              className="pl-10"
                              value={record.preco_crianca_6_mais}
                              onChange={(e) => handleChange(idx, 'preco_crianca_6_mais', e.target.value)}
                           />
                        </div>
                     </div>
                  </div>
               </div>
             ))}
          </div>
        </div>

        <div className="flex justify-between items-center border-t pt-6 mt-2">
           <div className="text-xs text-slate-400">
              Todas as alterações são salvas imediatamente no banco de dados.
           </div>
           <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[150px]">
                 {saving ? (
                    <>
                       <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                       Salvando...
                    </>
                 ) : (
                    <>
                       Salvar Todas
                    </>
                 )}
              </Button>
           </div>
        </div>

      </DialogContent>
    </Dialog>
  )
}

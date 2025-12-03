"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { upsertHospedagemDiarias, type CreateHospedagemDiariaDTO } from "@/lib/admin-hoteis"
import { Loader2, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { hotelDataMap } from "@/lib/hotel-data"
import { HOSPEDAGENS_PERMITIDAS } from "@/lib/constants-hoteis"

interface DisponibilidadeImportProps {
  onSuccess: () => void
}

export function DisponibilidadeImport({ onSuccess }: DisponibilidadeImportProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [previewData, setPreviewData] = useState<CreateHospedagemDiariaDTO[]>([])
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError(null)
    setPreviewData([])

    try {
      const text = await file.text()
      const rows = text.split('\n').map(row => row.trim()).filter(Boolean)
      
      // Assumindo formato CSV: DATA;HOTEL_SLUG;TIPO_QUARTO;CAPACIDADE;VALOR;ATIVO
      // Ignorar header se existir
      const parsedData: CreateHospedagemDiariaDTO[] = []
      let errors: string[] = []

      // Detectar separador (; ou ,)
      const firstLine = rows[0]
      const separator = firstLine.includes(';') ? ';' : ','
      
      // Começa do indice 1 se tiver cabeçalho (verificação simples)
      const startIndex = (firstLine.toLowerCase().includes('data') || firstLine.toLowerCase().includes('date')) ? 1 : 0

      for (let i = startIndex; i < rows.length; i++) {
        const cols = rows[i].split(separator).map(c => c.trim().replace(/"/g, ''))
        
        // Validação básica de colunas (espera 6 colunas)
        if (cols.length < 5) continue

        // Estrutura: data;slug_hospedagem;tipo_quarto;capacidade;valor_diaria;descricao
        const [dataRaw, hotelSlug, tipoQuarto, capacidade, valor, descricao] = cols

        // Normalizar data (aceita YYYY-MM-DD ou DD/MM/YYYY)
        let dataFormatada = dataRaw
        if (dataRaw.includes('/')) {
          const [d, m, y] = dataRaw.split('/')
          dataFormatada = `${y}-${m}-${d}`
        }

        // Validar Hotel
        const normalizedSlug = hotelSlug.toLowerCase().replace(/\s+/g, '-')
        // Tenta achar match exato ou parcial nos permitidos
        let finalSlug = HOSPEDAGENS_PERMITIDAS.find(h => h === normalizedSlug || h.includes(normalizedSlug))
        
        if (!finalSlug) {
           // Tenta buscar pelo nome no map
           const foundEntry = Object.entries(hotelDataMap).find(([k, v]) => v.displayName.toLowerCase() === hotelSlug.toLowerCase())
           if (foundEntry && HOSPEDAGENS_PERMITIDAS.includes(foundEntry[0])) {
              finalSlug = foundEntry[0]
           }
        }

        // Se ainda não achou, tenta usar o slug direto se for um dos permitidos exatos
        if (!finalSlug && HOSPEDAGENS_PERMITIDAS.includes(hotelSlug)) {
           finalSlug = hotelSlug
        }

        if (!finalSlug) {
          errors.push(`Linha ${i+1}: Hotel '${hotelSlug}' inválido ou não permitido.`) 
          continue
        }

        const valorNum = parseFloat(valor.replace('R$', '').replace('USD', '').trim())
        const capNum = parseInt(capacidade)

        if (isNaN(valorNum) || isNaN(capNum)) {
           errors.push(`Linha ${i+1}: Valor ou Capacidade inválidos.`) 
           continue
        }

        parsedData.push({
          data: dataFormatada,
          slug_hospedagem: finalSlug,
          tipo_quarto: tipoQuarto,
          capacidade: capNum,
          valor_diaria: valorNum,
          ativo: true, // Default true
          descricao: descricao || null
        })
      }

      if (errors.length > 0 && parsedData.length === 0) {
        throw new Error(`Falha ao ler CSV:\n${errors.slice(0, 3).join('\n')}...`)
      }

      setPreviewData(parsedData)
      if (errors.length > 0) {
         toast({
            variant: "warning",
            title: "Aviso de Importação",
            description: `${errors.length} linhas foram ignoradas por erros. ${parsedData.length} linhas válidas.`
         })
      }

    } catch (err: any) {
      setError(err.message)
      setPreviewData([])
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadTemplate = () => {
    // Colunas exatas solicitadas: data;slug_hospedagem;tipo_quarto;capacidade;valor_diaria;descricao
    const headers = ["data", "slug_hospedagem", "tipo_quarto", "capacidade", "valor_diaria", "descricao"]
    const exampleRow = ["2026-01-01", "hotel-fenix", "Double", "2", "450.00", "Tarifa padrão"]
    const csvContent = [headers.join(";"), exampleRow.join(";")].join("\n")
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'modelo_tarifario_supa.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleImport = async () => {
    if (previewData.length === 0) return
    setLoading(true)
    try {
      await upsertHospedagemDiarias(previewData, "admin-importer")
      toast({
        title: "Importação Concluída",
        description: `${previewData.length} diárias foram atualizadas/criadas.`
      })
      setIsOpen(false)
      onSuccess()
    } catch (err: any) {
      setError("Erro ao salvar no banco de dados: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileSpreadsheet className="w-4 h-4 text-green-600" />
          Importar CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Importar Tarifário CSV</DialogTitle>
          <DialogDescription>
            Atualize valores em massa usando um arquivo Excel/CSV.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {!previewData.length ? (
            <div className="grid w-full max-w-sm items-center gap-4">
              <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="w-full border-dashed text-slate-600">
                <FileSpreadsheet className="w-4 h-4 mr-2" /> Baixar Modelo de Planilha
              </Button>

              <div className="grid gap-1.5">
                <Label htmlFor="csv-upload">Selecione o arquivo preenchido</Label>
              <div className="flex items-center gap-2">
                 <Input id="csv-upload" type="file" accept=".csv,.txt" onChange={handleFileUpload} disabled={loading} />
                 {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-md text-xs text-muted-foreground mt-2 border border-dashed border-slate-300">
                <strong>Formato esperado (CSV):</strong><br/>
                data; slug_hospedagem; tipo_quarto; capacidade; valor_diaria; descricao<br/>
                <span className="font-mono mt-1 block text-slate-600">2026-01-01; hotel-fenix; Double; 2; 450.00; Tarifa Padrão</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
               <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-md border border-green-100">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">{previewData.length} registros encontrados.</span>
               </div>
               <div className="max-h-[200px] overflow-y-auto border rounded-md text-xs">
                  <table className="w-full text-left p-2">
                     <thead className="bg-slate-100 sticky top-0">
                        <tr>
                           <th className="p-2">Data</th>
                           <th className="p-2">Hotel</th>
                           <th className="p-2">Quarto</th>
                           <th className="p-2">Valor</th>
                        </tr>
                     </thead>
                     <tbody>
                        {previewData.slice(0, 20).map((row, i) => (
                           <tr key={i} className="border-b">
                              <td className="p-2">{row.data}</td>
                              <td className="p-2 truncate max-w-[80px]">{row.slug_hospedagem}</td>
                              <td className="p-2">{row.tipo_quarto}</td>
                              <td className="p-2 font-bold">USD {row.valor_diaria}</td>
                           </tr>
                        ))}
                        {previewData.length > 20 && (
                           <tr><td colSpan={4} className="p-2 text-center text-slate-400 italic">...e mais {previewData.length - 20} linhas</td></tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="sm:justify-between items-center">
          <Button variant="ghost" onClick={() => {
             setIsOpen(false)
             setPreviewData([])
             setError(null)
          }}>Cancelar</Button>
          
          {previewData.length > 0 && (
             <Button onClick={handleImport} disabled={loading} className="bg-green-600 hover:bg-green-700">
               {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
               <Upload className="w-4 h-4 mr-2" /> Confirmar Importação
             </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
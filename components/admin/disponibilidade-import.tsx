"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { AdminSurface } from '@/components/admin/surface'
import { adminFieldClass, adminInputClass } from '@/components/admin/styles'
import { UploadCloud, FileText, AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export function DisponibilidadeImport() {
  const [isOpen, setIsOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [csvPreview, setCsvPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0]
    setFile(nextFile ?? null)
    setResult(null)
    setError(null)
    if (nextFile) {
      const text = await nextFile.text()
      setCsvPreview(text.slice(0, 800))
    } else {
      setCsvPreview('')
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!file) {
      setError('Selecione um arquivo CSV primeiro.')
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const csv = await file.text()
      const response = await fetch('/api/admin/disponibilidades/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Erro ao importar CSV')
      }

      const data = await response.json()
      const { imported, errors } = data as { imported: number; errors?: Array<{ index: number; error: string }> }
      if (errors && errors.length > 0) {
        setResult(`Importados ${imported} registros com ${errors.length} erro(s). Consulte a lista abaixo.`)
        setError(errors.map((e) => `Linha ${e.index}: ${e.error}`).join('\n'))
        toast({
          variant: 'destructive',
          title: 'Importação concluída com avisos',
          description: `Arquivos importados: ${imported}. Verifique os ${errors.length} erros listados.`,
        })
      } else {
        setResult(`Importados ${imported} registros com sucesso.`)
        toast({
          title: 'Importação concluída',
          description: `Arquivos importados: ${imported}.`,
        })
        // Reset after success
        setTimeout(() => {
             setFile(null)
             setCsvPreview('')
             setResult(null)
             setIsOpen(false)
        }, 2000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
      toast({
        variant: 'destructive',
        title: 'Falha na importação',
        description: err instanceof Error ? err.message : 'Erro inesperado',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminSurface className="overflow-hidden p-0">
      <div 
        className={cn(
            "flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-slate-50 transition-colors",
            isOpen && "border-b border-slate-100 bg-slate-50/50"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <UploadCloud className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Importação em Massa</h2>
            <p className="text-xs text-slate-500">
              Carregue novas disponibilidades via CSV
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-slate-400">
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {isOpen && (
        <div className="p-6 bg-slate-50/30 animate-in slide-in-from-top-2 duration-200">
            <div className="mb-4 rounded-md bg-blue-50 p-4 border border-blue-100">
                <div className="flex gap-3">
                    <FileText className="h-5 w-5 text-blue-600 shrink-0" />
                    <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Requisitos do Arquivo</p>
                        <p className="opacity-90 leading-relaxed">
                            O arquivo deve estar no formato <code>.csv</code>. Colunas obrigatórias: 
                            <strong> destino, data_saida, transporte, hotel</strong>.
                        </p>
                    </div>
                </div>
            </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="csv-file" className="text-xs font-medium uppercase tracking-wide text-slate-500">Selecione o arquivo</Label>
              <Input
                id="csv-file"
                name="csv-file"
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className={cn(adminInputClass, "file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100")}
              />
            </div>

            {csvPreview && (
              <div className="grid gap-2">
                <Label className="text-xs font-medium uppercase tracking-wide text-slate-500">Pré-visualização (Primeiras linhas)</Label>
                <Textarea
                  value={csvPreview}
                  readOnly
                  rows={5}
                  className={`${adminFieldClass} font-mono text-[10px] leading-relaxed resize-none bg-slate-900 text-slate-50 border-slate-800`}
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
               {result && (
                 <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium mr-auto">
                    <CheckCircle className="h-4 w-4" />
                    {result}
                 </div>
               )}
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || !file} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {loading ? 'Processando...' : 'Iniciar Importação'}
              </Button>
            </div>
            
            {error && (
              <div className="rounded-lg bg-red-50 p-4 border border-red-200 flex gap-3 items-start">
                <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <p className="text-sm font-semibold text-red-800">Falha na importação</p>
                    <pre className="whitespace-pre-wrap text-xs text-red-600 font-mono">
                        {error}
                    </pre>
                </div>
              </div>
            )}
          </form>
        </div>
      )}
    </AdminSurface>
  )}

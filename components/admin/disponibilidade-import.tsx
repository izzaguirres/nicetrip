"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { adminFieldClass, adminInputClass } from '@/components/admin/styles'

export function DisponibilidadeImport() {
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
    <div className="rounded-lg border bg-white p-4 space-y-4">
      <div>
        <h2 className="text-base font-semibold">Importar CSV de disponibilidades</h2>
        <p className="text-sm text-muted-foreground">
          Faça upload de um arquivo CSV seguindo o modelo. Os campos obrigatórios são <code>destino</code>, <code>data_saida</code>, <code>transporte</code> e <code>hotel</code>.
          Para exemplo, consulte <code>docs/disponibilidades_template.csv</code> no repositório.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <Label htmlFor="csv-file">Arquivo CSV</Label>
          <Input
            id="csv-file"
            name="csv-file"
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className={adminInputClass}
          />
        </div>

        {csvPreview && (
          <div className="grid gap-2">
            <Label className="text-xs text-muted-foreground">Pré-visualização</Label>
            <Textarea
              value={csvPreview}
              readOnly
              rows={5}
              className={`${adminFieldClass} min-h-[140px] px-4 py-3 text-xs`}
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? 'Importando...' : 'Importar CSV'}
          </Button>
          {result && <span className="text-sm text-green-600">{result}</span>}
        </div>
        {error && (
          <pre className="whitespace-pre-wrap rounded-md bg-red-50 p-2 text-xs text-red-600 border border-red-200">
            {error}
          </pre>
        )}
      </form>
    </div>
  )}

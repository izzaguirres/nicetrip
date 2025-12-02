"use client"

import { useState, useEffect } from "react"
import { supabaseBrowser } from "@/lib/supabase-browser"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save, Bus, Plane, Scale } from "lucide-react"

interface TemplateData {
  id: number
  titulo: string
  condicoes_cancelacao: string
  condicoes_equipaje: string
  condicoes_documentos: string
  // Suporte para campos legados ou novos
  condicoes_cancelacao_completa?: string
  condicoes_equipaje_completa?: string
  condicoes_documentos_completa?: string
}

export default function CondicoesAdminPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("bus")
  const { toast } = useToast()
  const supabase = supabaseBrowser()

  // State separado para cada tipo
  const [busData, setBusData] = useState<TemplateData | null>(null)
  const [aereoData, setAereoData] = useState<TemplateData | null>(null)
  const [geralData, setGeralData] = useState<TemplateData | null>(null)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('package_content_templates')
        .select('*')
        .eq('ativo', true)

      if (error) throw error

      // Lógica de filtro igual ao Frontend público para garantir consistência
      const norm = (s: string) => (s || '').toLowerCase().trim()

      const bus = data.find((item: any) => (norm(item.transporte) === 'bus' || norm(item.transporte) === 'bús') && item.prioridade === 1)
      const aereo = data.find((item: any) => norm(item.transporte) === 'aéreo' && item.prioridade === 1)
      const geral = data.find((item: any) => item.id === 9 || norm(item.titulo).includes('generales'))

      if (bus) setBusData(normalizeData(bus))
      if (aereo) setAereoData(normalizeData(aereo))
      if (geral) setGeralData(normalizeData(geral))

    } catch (error) {
      console.error('Erro ao carregar templates:', error)
      toast({
        variant: "destructive",
        title: "Erro ao carregar",
        description: "Não foi possível carregar as condições atuais."
      })
    } finally {
      setLoading(false)
    }
  }

  // Helper para normalizar dados (preferir _completa se existir, senão normal)
  const normalizeData = (data: any): TemplateData => ({
    id: data.id,
    titulo: data.titulo,
    condicoes_cancelacao: data.condicoes_cancelacao_completa || data.condicoes_cancelacao || '',
    condicoes_equipaje: data.condicoes_equipaje_completa || data.condicoes_equipaje || '',
    condicoes_documentos: data.condicoes_documentos_completa || data.condicoes_documentos || ''
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      const updates = []

      // Prepara updates baseados nas colunas "curtas" que são as oficiais do banco
      // (O front lê as duas, então salvando na curta garante que aparece)
      
      if (busData) {
        updates.push(
          supabase.from('package_content_templates').update({
            condicoes_cancelacao: busData.condicoes_cancelacao,
            condicoes_equipaje: busData.condicoes_equipaje,
            condicoes_documentos: busData.condicoes_documentos,
            // Limpar as _completa para evitar confusão futura ou duplicar se preferir
            condicoes_cancelacao_completa: busData.condicoes_cancelacao,
            condicoes_equipaje_completa: busData.condicoes_equipaje,
            condicoes_documentos_completa: busData.condicoes_documentos
          }).eq('id', busData.id)
        )
      }

      if (aereoData) {
        updates.push(
          supabase.from('package_content_templates').update({
            condicoes_cancelacao: aereoData.condicoes_cancelacao,
            condicoes_equipaje: aereoData.condicoes_equipaje,
            condicoes_documentos: aereoData.condicoes_documentos,
            condicoes_cancelacao_completa: aereoData.condicoes_cancelacao,
            condicoes_equipaje_completa: aereoData.condicoes_equipaje,
            condicoes_documentos_completa: aereoData.condicoes_documentos
          }).eq('id', aereoData.id)
        )
      }

      if (geralData) {
        updates.push(
          supabase.from('package_content_templates').update({
            condicoes_cancelacao: geralData.condicoes_cancelacao,
            condicoes_cancelacao_completa: geralData.condicoes_cancelacao
          }).eq('id', geralData.id)
        )
      }

      await Promise.all(updates)

      toast({
        title: "Sucesso!",
        description: "Todas as condições foram atualizadas."
      })

    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as alterações."
      })
    } finally {
      setSaving(false)
    }
  }

  // Componente de Campos
  const Fields = ({ data, setData, isGeral = false }: { data: TemplateData | null, setData: (d: TemplateData) => void, isGeral?: boolean }) => {
    if (!data) return <div className="p-8 text-center text-muted-foreground">Template não encontrado no banco de dados.</div>

    const handleChange = (field: keyof TemplateData, value: string) => {
      setData({ ...data, [field]: value })
    }

    if (isGeral) {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Conteúdo Geral (Contrato Completo)</Label>
            <Textarea 
              className="min-h-[400px] font-mono text-sm" 
              value={data.condicoes_cancelacao} 
              onChange={(e) => handleChange('condicoes_cancelacao', e.target.value)}
              placeholder="Cole aqui o texto completo dos termos gerais..."
            />
            <p className="text-xs text-muted-foreground">
              Dica: Use **texto** para negrito, - para listas e ## Título para seções.
            </p>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-base font-semibold flex items-center gap-2">
            🛡️ Política de Cancelación
          </Label>
          <Textarea 
            className="min-h-[150px]" 
            value={data.condicoes_cancelacao} 
            onChange={(e) => handleChange('condicoes_cancelacao', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-base font-semibold flex items-center gap-2">
            🧳 Equipaje Permitido
          </Label>
          <Textarea 
            className="min-h-[150px]" 
            value={data.condicoes_equipaje} 
            onChange={(e) => handleChange('condicoes_equipaje', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-base font-semibold flex items-center gap-2">
            📄 Documentación Requerida
          </Label>
          <Textarea 
            className="min-h-[150px]" 
            value={data.condicoes_documentos} 
            onChange={(e) => handleChange('condicoes_documentos', e.target.value)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Condiciones y Términos</h1>
          <p className="text-muted-foreground">Gerencie os textos legais e informativos exibidos no site.</p>
        </div>
        <Button onClick={handleSave} disabled={saving || loading} className="bg-orange-600 hover:bg-orange-700 text-white">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Salvar Alterações
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-0">
          {/* Abas integradas no Header do Card */}
        </CardHeader>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 h-12 bg-slate-100/50 p-1">
              <TabsTrigger value="bus" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all text-sm">
                <Bus className="mr-2 h-4 w-4" />
                Paquetes Bus
              </TabsTrigger>
              <TabsTrigger value="aereo" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all text-sm">
                <Plane className="mr-2 h-4 w-4" />
                Paquetes Aéreo
              </TabsTrigger>
              <TabsTrigger value="generales" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all text-sm">
                <Scale className="mr-2 h-4 w-4" />
                Términos Generales
              </TabsTrigger>
            </TabsList>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            ) : (
              <>
                <TabsContent value="bus" className="mt-0 focus-visible:outline-none">
                  <Fields data={busData} setData={setBusData} />
                </TabsContent>
                
                <TabsContent value="aereo" className="mt-0 focus-visible:outline-none">
                  <Fields data={aereoData} setData={setAereoData} />
                </TabsContent>

                <TabsContent value="generales" className="mt-0 focus-visible:outline-none">
                  <Fields data={geralData} setData={setGeralData} isGeral />
                </TabsContent>
              </>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { upsertPasseio } from "@/lib/admin-passeios"
import { type Paseo } from "@/lib/passeios-service"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save, X, Info, DollarSign, MapPin } from "lucide-react"

interface PaseosFormProps {
  initialData?: Paseo | null
  onSuccess: () => void
  onCancel: () => void
}

export function PaseosForm({ initialData, onSuccess, onCancel }: PaseosFormProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  
  // Estado base
  const [formData, setFormData] = useState<Partial<Paseo>>({
    ativo: true,
    nome: "",
    subtitulo: "",
    duracion: "",
    imagem_url: "",
    sob_consulta: false,
    // Preços
    preco_adulto: 0,
    preco_crianca_0_3: 0,
    preco_crianca_4_5: 0,
    preco_crianca_6_10: 0,
    // Info Cards
    info_1_titulo: "Premium", info_1_texto: "",
    info_2_titulo: "Horario", info_2_texto: "",
    info_3_titulo: "Incluye", info_3_texto: "",
    info_4_titulo: "Guía", info_4_texto: "",
    // Detalhes
    descricao_longa: "",
    observacoes: "",
    local_saida: "",
    horario_saida: ""
  })

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    }
  }, [initialData])

  const handleChange = (field: keyof Paseo, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nome) {
      toast({ variant: "destructive", title: "Nome é obrigatório" })
      return
    }

    setLoading(true)
    try {
      // Sanitização básica
      const payload = {
        ...formData,
        preco_adulto: Number(formData.preco_adulto || 0),
        preco_crianca_0_3: Number(formData.preco_crianca_0_3 || 0),
        preco_crianca_4_5: Number(formData.preco_crianca_4_5 || 0),
        preco_crianca_6_10: Number(formData.preco_crianca_6_10 || 0),
      }
      
      await upsertPasseio(payload, "admin-user")
      toast({ title: "Passeio salvo com sucesso" })
      onSuccess()
    } catch (error: any) {
      console.error("Erro ao salvar passeio:", error)
      toast({ variant: "destructive", title: "Erro ao salvar", description: error.message || "Verifique o console" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="h-full border-l-4 border-l-orange-500">
      <CardHeader>
        <CardTitle>{initialData ? "Editar Passeio" : "Novo Passeio"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Básico */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-slate-500 uppercase tracking-wider border-b pb-1 mb-3">Informações Básicas</h3>
            <div className="space-y-2">
              <Label>Nome do Passeio</Label>
              <Input value={formData.nome || ""} onChange={e => handleChange("nome", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label>Local (Cidade/Praia)</Label>
                 <div className="relative">
                    <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-8" value={formData.subtitulo || ""} onChange={e => handleChange("subtitulo", e.target.value)} />
                 </div>
               </div>
               <div className="space-y-2">
                 <Label>Duração</Label>
                 <Input placeholder="Ex: 8 horas" value={formData.duracion || ""} onChange={e => handleChange("duracion", e.target.value)} />
               </div>
            </div>
            <div className="space-y-2">
              <Label>URL da Imagem Principal</Label>
              <Input value={formData.imagem_url || ""} onChange={e => handleChange("imagem_url", e.target.value)} />
            </div>
          </div>

          {/* Preços */}
          <div className="space-y-4 bg-green-50 p-4 rounded-xl border border-green-100">
            <div className="flex items-center justify-between border-b border-green-200 pb-2 mb-2">
               <h3 className="font-semibold text-sm text-green-700 uppercase tracking-wider flex items-center gap-2">
                  <DollarSign className="w-4 h-4" /> Tarifário (USD)
               </h3>
               <div className="flex items-center gap-2">
                  <Switch 
                     id="sob_consulta" 
                     checked={formData.sob_consulta} 
                     onCheckedChange={v => handleChange("sob_consulta", v)} 
                  />
                  <Label htmlFor="sob_consulta" className="text-xs font-medium text-green-800 cursor-pointer">
                     Preço Sob Consulta (Ocultar valores)
                  </Label>
               </div>
            </div>
            
            <div className={`grid grid-cols-2 gap-4 transition-opacity ${formData.sob_consulta ? 'opacity-50 pointer-events-none' : ''}`}>
               <div className="space-y-2">
                 <Label>Adulto</Label>
                 <Input type="number" className="font-bold" value={formData.preco_adulto || 0} onChange={e => handleChange("preco_adulto", Number(e.target.value))} />
               </div>
               <div className="space-y-2">
                 <Label>Criança (6+ anos)</Label>
                 <Input type="number" value={formData.preco_crianca_6_10 || 0} onChange={e => handleChange("preco_crianca_6_10", Number(e.target.value))} />
               </div>
               <div className="space-y-2">
                 <Label>Criança (4-5 anos)</Label>
                 <Input type="number" value={formData.preco_crianca_4_5 || 0} onChange={e => handleChange("preco_crianca_4_5", Number(e.target.value))} />
               </div>
               <div className="space-y-2">
                 <Label>Criança (0-3 anos)</Label>
                 <Input type="number" value={formData.preco_crianca_0_3 || 0} onChange={e => handleChange("preco_crianca_0_3", Number(e.target.value))} />
               </div>
            </div>
          </div>

          {/* Info Cards (Detalles de la experiencia) */}
          <div className="space-y-4 bg-orange-50 p-4 rounded-xl border border-orange-100">
            <h3 className="font-semibold text-sm text-orange-700 uppercase tracking-wider flex items-center gap-2">
               <Info className="w-4 h-4" /> Info Cards (Destaques)
            </h3>
            <p className="text-xs text-orange-600/80 mb-2">Estes são os 4 cards que aparecem na seção "Detalles de la experiencia". Deixe o texto em branco para ocultar o card.</p>
            
            {[1, 2, 3, 4].map(num => (
               <div key={num} className="grid grid-cols-3 gap-2 items-start pb-2 border-b border-orange-200/50 last:border-0 last:pb-0">
                  <div className="col-span-1">
                     <Label className="text-xs">Título Card {num}</Label>
                     <Input 
                        className="h-8 text-sm" 
                        value={formData[`info_${num}_titulo` as keyof Paseo] as string || ""} 
                        onChange={e => handleChange(`info_${num}_titulo` as keyof Paseo, e.target.value)} 
                     />
                  </div>
                  <div className="col-span-2">
                     <Label className="text-xs">Texto Card {num} (suporta **negrito**)</Label>
                     <Textarea 
                        className="min-h-[60px] text-sm resize-none" 
                        value={formData[`info_${num}_texto` as keyof Paseo] as string || ""} 
                        onChange={e => handleChange(`info_${num}_texto` as keyof Paseo, e.target.value)} 
                     />
                  </div>
               </div>
            ))}
          </div>

          {/* Detalhes */}
          <div className="space-y-4">
             <div className="space-y-2">
               <Label>Descrição Completa</Label>
               <Textarea className="min-h-[100px]" value={formData.descricao_longa || ""} onChange={e => handleChange("descricao_longa", e.target.value)} />
             </div>
             <div className="space-y-2">
               <Label>Observações (Rodapé)</Label>
               <Textarea value={formData.observacoes || ""} onChange={e => handleChange("observacoes", e.target.value)} />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Local de Saída</Label>
                  <Input value={formData.local_saida || ""} onChange={e => handleChange("local_saida", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Horário de Saída</Label>
                  <Input value={formData.horario_saida || ""} onChange={e => handleChange("horario_saida", e.target.value)} />
                </div>
             </div>
          </div>

          <div className="flex items-center space-x-2 pt-4 border-t">
            <Switch id="ativo" checked={formData.ativo} onCheckedChange={v => handleChange("ativo", v)} />
            <Label htmlFor="ativo">Passeio Ativo no Site</Label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
            <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

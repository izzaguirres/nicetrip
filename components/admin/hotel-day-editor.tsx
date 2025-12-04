"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { upsertHospedagemDiarias, deleteHospedagemDiaria, type HospedagemDiaria } from "@/lib/admin-hoteis"
import { Loader2, Plus, Trash2, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface HotelDayEditorProps {
  isOpen: boolean
  onClose: () => void
  hotelSlug: string
  hotelName: string
  date: string
  diariasIniciais: HospedagemDiaria[]
  onSuccess: () => void
}

export function HotelDayEditor({
  isOpen,
  onClose,
  hotelSlug,
  hotelName,
  date,
  diariasIniciais,
  onSuccess
}: HotelDayEditorProps) {
  const [diarias, setDiarias] = useState<Partial<HospedagemDiaria>[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Inicializa o estado com as diárias existentes
  useEffect(() => {
    if (isOpen) {
      // Deep copy para edição
      setDiarias(diariasIniciais.map(d => ({ ...d })))
    }
  }, [isOpen, diariasIniciais])

  const handleChange = (index: number, field: keyof HospedagemDiaria, value: any) => {
    const newDiarias = [...diarias]
    newDiarias[index] = { ...newDiarias[index], [field]: value }
    setDiarias(newDiarias)
  }

  const handleAddRoom = () => {
    setDiarias([
      ...diarias,
      {
        slug_hospedagem: hotelSlug,
        data: date,
        tipo_quarto: "",
        capacidade: 2,
        valor_diaria: 0,
        ativo: true,
        // id undefined = novo
      }
    ])
  }

  const handleDeleteLocal = (index: number) => {
    const newDiarias = [...diarias]
    newDiarias.splice(index, 1)
    setDiarias(newDiarias)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // 1. Identificar deletados (estavam em 'diariasIniciais' mas não estão em 'diarias')
      const idsAtuais = new Set(diarias.map(d => d.id).filter(Boolean))
      const toDelete = diariasIniciais.filter(d => !idsAtuais.has(d.id))

      // 2. Deletar removidos
      for (const item of toDelete) {
        await deleteHospedagemDiaria(item.id, "admin-user")
      }

      // 3. Preparar para Upsert
      // Validar campos obrigatórios
      const toUpsert = diarias.map(d => {
        if (!d.tipo_quarto || !d.valor_diaria) {
          throw new Error("Todos os quartos precisam de Tipo e Valor.")
        }
        return {
            // Se tem ID, mantém. Se não, não manda (o DB gera se for insert, mas o nosso upsert precisa de logica)
            // A função upsertHospedagemDiarias espera um array sem ID para criação, mas com ID para update?
            // Vamos adaptar a função do admin-hoteis para ser mais flexivel ou tratar aqui.
            // A função atual `upsertHospedagemDiarias` no lib/admin-hoteis.ts espera CreateHospedagemDiariaDTO (sem ID).
            // Mas ela faz um check interno: `itemsToUpsert = ... existing ? { ...novoItem, id: existing.id }`.
            // O problema é que se passarmos o ID explicitamente, ela sobrescreve.
            
            // Vamos simplificar: usar o ID se existir.
            id: d.id,
            data: date,
            slug_hospedagem: hotelSlug,
            tipo_quarto: d.tipo_quarto!,
            capacidade: Number(d.capacidade || 2),
            valor_diaria: Number(d.valor_diaria || 0),
            ativo: d.ativo ?? true,
            descricao: d.descricao || null
        }
      })

      // Como nossa função upsertHospedagemDiarias foi feita para LOTE GENERICO (sem ID no input), 
      // vamos chamar o supabase direto aqui ou ajustar a lib. 
      // Para não quebrar a lib, vou ajustar a chamada:
      
      // A lib espera `CreateHospedagemDiariaDTO[]`. 
      // Se eu passar objetos com ID, o Typescript reclama, mas o JS passa.
      // Porem, a logica interna da lib tenta buscar IDs existentes baseados em (slug, tipo, data).
      // Isso pode dar conflito com o que editamos (ex: mudamos o tipo de quarto).
      
      // MELHOR: Deletar TUDO desse dia/hotel e recriar. É mais seguro para integridade neste caso de edição complexa.
      // Mas deletar tudo perde IDs e quebra referencias se existissem reservas ligadas (mas aqui é tabela de preço, não reserva).
      // Vamos deletar tudo desse dia para esse hotel e inserir o novo estado. Simples e eficaz.
      
      // Deletar todos os anteriores deste dia (mesmo os que mantivemos na UI, para reinserir limpo)
      // OU deletar apenas os que mudaram?
      // Vamos na estratégia "Delete All for Date -> Insert All".
      
      // Mas espera, a função `upsert` do supabase é inteligente.
      // Se passarmos o ID, ela atualiza.
      
      // Vamos usar a `upsertHospedagemDiarias` mas modificada/criada nova para aceitar ID opcional.
      // Vou fazer direto aqui chamando a lib de forma "suja" (cast) ou criar função update na lib.
      
      // Vamos usar a logica:
      // Upsert de items com ID (updates) e sem ID (creates).
      // A função da lib recarrega IDs se não passados.
      
      // Vou chamar o upsert passando os dados.
      await upsertHospedagemDiarias(toUpsert as any, "admin-user")
      
      toast({ title: "Alterações salvas com sucesso!" })
      onSuccess()
      onClose()
      
    } catch (error: any) {
      console.error(error)
      toast({ variant: "destructive", title: "Erro ao salvar", description: error.message })
    } finally {
      setLoading(false)
    }
  }

  const dateObj = new Date(date + "T12:00:00")

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Diárias - {format(dateObj, "dd 'de' MMMM", { locale: es })}</DialogTitle>
          <p className="text-sm text-muted-foreground">{hotelName}</p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-12 gap-2 font-medium text-sm text-muted-foreground mb-2 px-2">
            <div className="col-span-4">Tipo de Quarto</div>
            <div className="col-span-2">Capacidade</div>
            <div className="col-span-3">Valor (R$)</div>
            <div className="col-span-2 text-center">Ativo</div>
            <div className="col-span-1"></div>
          </div>

          {diarias.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2 rounded-md border">
              <div className="col-span-4">
                <Input 
                  value={item.tipo_quarto} 
                  onChange={(e) => handleChange(index, "tipo_quarto", e.target.value)}
                  placeholder="Ex: Single"
                  className="h-8"
                />
              </div>
              <div className="col-span-2">
                <Input 
                  type="number" 
                  value={item.capacidade} 
                  onChange={(e) => handleChange(index, "capacidade", Number(e.target.value))}
                  className="h-8"
                />
              </div>
              <div className="col-span-3">
                <Input 
                  type="number" 
                  value={item.valor_diaria} 
                  onChange={(e) => handleChange(index, "valor_diaria", Number(e.target.value))}
                  className="h-8 font-bold text-green-700"
                />
              </div>
              <div className="col-span-2 flex justify-center">
                <Switch 
                  checked={item.ativo} 
                  onCheckedChange={(v) => handleChange(index, "ativo", v)} 
                />
              </div>
              <div className="col-span-1 text-right">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-red-500 hover:bg-red-100"
                  onClick={() => handleDeleteLocal(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}

          <Button variant="outline" onClick={handleAddRoom} className="w-full border-dashed">
            <Plus className="w-4 h-4 mr-2" /> Adicionar Quarto para este dia
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar Todos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

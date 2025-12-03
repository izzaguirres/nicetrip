"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { upsertHospedagemDiarias, type CreateHospedagemDiariaDTO, type HospedagemDiaria } from "@/lib/admin-hoteis"
import { hotelDataMap } from "@/lib/hotel-data"
import { HOSPEDAGENS_PERMITIDAS } from "@/lib/constants-hoteis"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save, X } from "lucide-react"
import { format, addDays, differenceInDays } from "date-fns"

interface HotelFormProps {
  initialData?: HospedagemDiaria | null
  onSuccess: () => void
  onCancel: () => void
}

export function HotelForm({ initialData, onSuccess, onCancel }: HotelFormProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  
  // Form states
  const [slugHospedagem, setSlugHospedagem] = useState("")
  const [tipoQuarto, setTipoQuarto] = useState("")
  const [capacidade, setCapacidade] = useState(2)
  const [valorDiaria, setValorDiaria] = useState(0)
  const [ativo, setAtivo] = useState(true)
  
  // Bulk specific states
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const isEditing = !!initialData

  // Carregar dados iniciais se estiver editando
  useEffect(() => {
    if (initialData) {
      setSlugHospedagem(initialData.slug_hospedagem)
      setTipoQuarto(initialData.tipo_quarto)
      setCapacidade(initialData.capacidade)
      setValorDiaria(initialData.valor_diaria)
      setAtivo(initialData.ativo)
      
      // Em edição, as datas são fixas na verdade, mas vamos preencher
      // O usuário poderia teoricamente mudar a data de um registro único?
      // Melhor bloquear a data na edição para evitar confusão, ou permitir mudar apenas 1 dia.
      const dataIso = initialData.data.split('T')[0]
      setStartDate(dataIso)
      setEndDate(dataIso)
    }
  }, [initialData])

  // Lista de hotéis
  const hoteis = hotelDataMap 
    ? Object.entries(hotelDataMap)
        .map(([key, h]) => ({ slug: key, name: h.displayName }))
        .filter(h => HOSPEDAGENS_PERMITIDAS.includes(h.slug))
    : []

  // Tipos de quartos comuns para sugestão
  const tiposQuartosComuns = [
    "Single", "Doble", "Triple", "Quadruple", "Quintuple", "Sextuple",
    "Doble (Kitnet)", "Doble (Suíte)", "Single (Suíte)"
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!slugHospedagem || !tipoQuarto || !startDate || !endDate) {
      toast({ variant: "destructive", title: "Preencha todos os campos obrigatórios" })
      return
    }

    setLoading(true)
    try {
      const diariasToSave: CreateHospedagemDiariaDTO[] = []
      
      const start = new Date(startDate + "T12:00:00")
      const end = new Date(endDate + "T12:00:00")
      const diffDays = differenceInDays(end, start)

      if (diffDays < 0) {
        throw new Error("Data final deve ser maior ou igual a data inicial")
      }

      for (let i = 0; i <= diffDays; i++) {
        const currentDate = addDays(start, i)
        diariasToSave.push({
          data: format(currentDate, "yyyy-MM-dd"), // Formato DATE do Postgres
          slug_hospedagem: slugHospedagem,
          tipo_quarto: tipoQuarto,
          capacidade: Number(capacidade),
          valor_diaria: Number(valorDiaria),
          ativo: ativo,
          descricao: null
        })
      }

      // Se estiver editando um único registro e as datas não mudaram, é um update simples.
      // Mas a função upsert lida com isso se passarmos o ID.
      // Como nossa função upsert é generica para batch e não aceita ID explicito na interface DTO (Omit id),
      // ela vai tentar fazer match por constraint se não tiver ID.
      // No nosso caso, se for edição, vamos apenas recriar/atualizar aquele dia.
      
      // TODO: Melhorar a lógica de update vs create no service. 
      // Por enquanto, o upsert vai funcionar bem se a tabela tiver constraint (slug, tipo, data).
      // Se não tiver, ele pode duplicar. O ideal seria deletar o anterior se for edição e data mudar.
      // Mas vamos simplificar: Bulk Update sobrescreve.
      
      await upsertHospedagemDiarias(diariasToSave, "admin-user")
      
      toast({
        title: isEditing ? "Diária atualizada" : "Diárias criadas com sucesso",
        description: `${diariasToSave.length} registro(s) processado(s).`
      })
      onSuccess()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro inesperado."
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{isEditing ? "Editar Diária" : "Lançamento em Massa"}</CardTitle>
        <CardDescription>
          {isEditing 
            ? "Altere os valores para esta data específica."
            : "Defina um período para criar ou atualizar diárias de uma vez só."
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Hotel</Label>
            <Select 
              value={slugHospedagem} 
              onValueChange={setSlugHospedagem}
              disabled={isEditing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o hotel" />
              </SelectTrigger>
              <SelectContent>
                {hoteis.map(hotel => (
                  <SelectItem key={hotel.slug} value={hotel.slug}>
                    {hotel.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Quarto</Label>
              <div className="relative">
                 <Input 
                    list="tipos-quartos"
                    value={tipoQuarto}
                    onChange={(e) => setTipoQuarto(e.target.value)}
                    placeholder="Ex: Double, Triple..."
                  />
                  <datalist id="tipos-quartos">
                    {tiposQuartosComuns.map(t => <option key={t} value={t} />)}
                  </datalist>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Capacidade (Pessoas)</Label>
              <Input 
                type="number" 
                min={1} 
                max={10}
                value={capacidade}
                onChange={(e) => setCapacidade(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data Início</Label>
              <Input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label>Data Fim</Label>
              <Input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isEditing}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 items-center">
             <div className="space-y-2">
              <Label>Valor da Diária (USD)</Label>
              <Input 
                type="number" 
                step="0.01"
                min={0}
                value={valorDiaria}
                onChange={(e) => setValorDiaria(Number(e.target.value))}
                className="font-bold text-green-700"
              />
            </div>
            
            <div className="flex items-center space-x-2 pt-6">
              <Switch 
                id="ativo" 
                checked={ativo} 
                onCheckedChange={setAtivo} 
              />
              <Label htmlFor="ativo">Diária Ativa</Label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Salvar Alterações" : "Lançar Diárias"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

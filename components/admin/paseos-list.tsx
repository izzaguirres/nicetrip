"use client"

import { useState, useEffect } from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAdminPasseios, deletePasseio } from "@/lib/admin-passeios"
import { type Paseo } from "@/lib/passeios-service"
import { Edit, Trash2, Loader2, MapPin, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PaseosListProps {
  onEdit: (paseo: Paseo) => void
  refreshTrigger: number
}

export function PaseosList({ onEdit, refreshTrigger }: PaseosListProps) {
  const [passeios, setPasseios] = useState<Paseo[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await getAdminPasseios()
      setPasseios(data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar",
        description: "Não foi possível carregar os passeios."
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [refreshTrigger])

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este passeio?")) return
    
    try {
      await deletePasseio(id, "admin-user")
      toast({ title: "Passeio excluído com sucesso" })
      loadData()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: "Não foi possível excluir o registro."
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Passeios Cadastrados</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Preço Adulto</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : passeios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Nenhum passeio encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                passeios.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.nome}</TableCell>
                    <TableCell className="text-muted-foreground flex items-center gap-1">
                       <MapPin className="w-3 h-3" /> {item.subtitulo || '-'}
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-1 text-xs bg-slate-100 w-fit px-2 py-1 rounded-full">
                          <Clock className="w-3 h-3" /> {item.duracion || '-'}
                       </div>
                    </TableCell>
                    <TableCell className="font-bold text-green-700">
                      {item.sob_consulta 
                        ? <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">Sob Consulta</Badge>
                        : (item.preco_adulto ? `USD ${item.preco_adulto}` : 'A consultar')
                      }
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.ativo ? "default" : "secondary"}>
                        {item.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

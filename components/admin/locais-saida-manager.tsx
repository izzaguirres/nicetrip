"use client"

import { useState, useEffect } from "react"
import { getCidadesSaidaAdmin, upsertCidadeSaida, deleteCidadeSaida, toggleCidadeSaidaStatus, type CidadeSaida } from "@/lib/admin-cidades-saida"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus, Pencil, Trash2, MapPin, Bus, Plane } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function LocaisSaidaManager() {
  const [cidades, setCidades] = useState<CidadeSaida[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CidadeSaida | null>(null)
  const { toast } = useToast()

  // Estado do Formulário
  const [formData, setFormData] = useState<CidadeSaida>({
    cidade: "",
    provincia: "",
    pais: "Argentina",
    transporte: "Bus",
    ativo: true
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const data = await getCidadesSaidaAdmin()
      setCidades(data)
    } catch (error) {
      console.error(error)
      toast({ variant: "destructive", title: "Erro ao carregar locais" })
    } finally {
      setLoading(false)
    }
  }

  function handleEdit(item: CidadeSaida) {
    setEditingItem(item)
    setFormData(item)
    setIsDialogOpen(true)
  }

  function handleNew() {
    setEditingItem(null)
    setFormData({
      cidade: "",
      provincia: "Buenos Aires",
      pais: "Argentina",
      transporte: "Bus",
      ativo: true
    })
    setIsDialogOpen(true)
  }

  async function handleSave() {
    try {
      await upsertCidadeSaida(formData)
      toast({ title: "Local salvo com sucesso!" })
      setIsDialogOpen(false)
      loadData()
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Erro ao salvar", 
        description: error.message || "Verifique os dados e tente novamente." 
      })
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Tem certeza que deseja excluir este local?")) return
    try {
      await deleteCidadeSaida(id)
      toast({ title: "Local removido" })
      loadData()
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao remover" })
    }
  }

  async function handleToggle(id: number, currentStatus: boolean) {
    try {
      await toggleCidadeSaidaStatus(id, currentStatus)
      // Atualização otimista
      setCidades(prev => prev.map(c => c.id === id ? { ...c, ativo: !currentStatus } : c))
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao atualizar status" })
      loadData() // Revert on error
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Locais de Saída</h2>
          <p className="text-muted-foreground">Gerencie as cidades de embarque disponíveis no filtro de busca.</p>
        </div>
        <Button onClick={handleNew} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> Novo Local
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cidade / Província</TableHead>
                <TableHead>Transporte</TableHead>
                <TableHead>País</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                  </TableCell>
                </TableRow>
              ) : cidades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Nenhum local cadastrado.
                  </TableCell>
                </TableRow>
              ) : (
                cidades.map((city) => (
                  <TableRow key={city.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="text-base">{city.cidade}</span>
                        <span className="text-xs text-muted-foreground">{city.provincia}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex w-fit items-center gap-1">
                         {city.transporte.toLowerCase().includes('bus') || city.transporte.toLowerCase().includes('bús') 
                            ? <Bus className="w-3 h-3 text-orange-500" /> 
                            : <Plane className="w-3 h-3 text-blue-500" />
                         }
                         {city.transporte}
                      </Badge>
                    </TableCell>
                    <TableCell>{city.pais}</TableCell>
                    <TableCell className="text-center">
                      <Switch 
                        checked={city.ativo} 
                        onCheckedChange={() => city.id && handleToggle(city.id, city.ativo)} 
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(city)}>
                          <Pencil className="w-4 h-4 text-slate-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => city.id && handleDelete(city.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Editar Local" : "Novo Local de Saída"}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cidade</label>
              <Input 
                value={formData.cidade} 
                onChange={(e) => setFormData(prev => ({ ...prev, cidade: e.target.value }))}
                placeholder="Ex: Buenos Aires"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Província/Estado</label>
                <Input 
                  value={formData.provincia} 
                  onChange={(e) => setFormData(prev => ({ ...prev, provincia: e.target.value }))}
                  placeholder="Ex: Buenos Aires"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">País</label>
                <Input 
                  value={formData.pais} 
                  onChange={(e) => setFormData(prev => ({ ...prev, pais: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Transporte</label>
              <Select 
                value={formData.transporte} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, transporte: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bus">Bus</SelectItem>
                  <SelectItem value="Aéreo">Aéreo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch 
                id="active-mode"
                checked={formData.ativo}
                onCheckedChange={(c) => setFormData(prev => ({ ...prev, ativo: c }))}
              />
              <label htmlFor="active-mode" className="text-sm font-medium">
                Ativo para buscas no site
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

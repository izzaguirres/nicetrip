"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PackageAddon, PackageAddonInput } from "@/lib/admin-addons"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Plus, Pencil, Bed, Coffee, Utensils, Waves, Sparkles, Bus, Plane } from "lucide-react"
import { AdminSurface } from "@/components/admin/surface"
import { adminInputClass, adminSelectTriggerClass } from "@/components/admin/styles"
import { cn } from "@/lib/utils"

// Ícones disponíveis para seleção
const AVAILABLE_ICONS = [
  { value: "Bed", label: "Cama", icon: Bed },
  { value: "Coffee", label: "Café", icon: Coffee },
  { value: "Utensils", label: "Restaurante", icon: Utensils },
  { value: "Waves", label: "Praia/Mar", icon: Waves },
  { value: "Sparkles", label: "Destaque", icon: Sparkles },
  { value: "Bus", label: "Ônibus", icon: Bus },
  { value: "Plane", label: "Avião", icon: Plane },
]

interface AddonsManagerProps {
  initialData: PackageAddon[]
}

export function AddonsManager({ initialData }: AddonsManagerProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [addons, setAddons] = useState(initialData)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAddon, setEditingAddon] = useState<PackageAddon | null>(null)
  const [loading, setLoading] = useState(false)

  // Form states
  const [formData, setFormData] = useState<PackageAddonInput>({
    title: "",
    description: "",
    price: 0,
    currency: "USD",
    transport_type: "__any",
    icon: "Sparkles",
    is_active: true,
  })

  const openDialog = (addon?: PackageAddon) => {
    if (addon) {
      setEditingAddon(addon)
      setFormData({
        title: addon.title,
        description: addon.description || "",
        price: addon.price,
        currency: addon.currency,
        transport_type: addon.transport_type || "__any",
        icon: addon.icon || "Sparkles",
        is_active: addon.is_active,
      })
    } else {
      setEditingAddon(null)
      setFormData({
        title: "",
        description: "",
        price: 0,
        currency: "USD",
        transport_type: "__any",
        icon: "Sparkles",
        is_active: true,
      })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        ...formData,
        id: editingAddon?.id,
        price: Number(formData.price),
      }

      const response = await fetch("/api/admin/addons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error("Falha ao salvar")

      const savedAddon = await response.json()
      
      if (editingAddon) {
        setAddons(addons.map(a => a.id === savedAddon.id ? savedAddon : a))
        toast({ title: "Serviço atualizado com sucesso" })
      } else {
        setAddons([savedAddon, ...addons])
        toast({ title: "Serviço criado com sucesso" })
      }
      
      setIsDialogOpen(false)
      router.refresh()
    } catch (error) {
      toast({ 
        variant: "destructive",
        title: "Erro", 
        description: "Não foi possível salvar o serviço." 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este serviço?")) return

    try {
      const response = await fetch(`/api/admin/addons?id=${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Falha ao deletar")

      setAddons(addons.filter(a => a.id !== id))
      toast({ title: "Serviço removido" })
      router.refresh()
    } catch (error) {
      toast({ 
        variant: "destructive",
        title: "Erro", 
        description: "Não foi possível remover o serviço." 
      })
    }
  }

  const getIconComponent = (iconName?: string | null) => {
    const found = AVAILABLE_ICONS.find(i => i.value === iconName)
    return found ? found.icon : Sparkles
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Serviços Adicionais</h2>
          <p className="text-sm text-slate-500 mt-1">
            Configure upgrades e opcionais que podem ser anexados aos pacotes.
          </p>
        </div>
        <Button onClick={() => openDialog()} className="bg-orange-600 hover:bg-orange-700 text-white shadow-sm gap-2">
          <Plus className="w-4 h-4" /> Novo Serviço
        </Button>
      </div>

      <AdminSurface className="overflow-hidden p-0 shadow-sm border border-slate-200">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="border-b border-slate-100 hover:bg-transparent">
              <TableHead className="w-[80px] text-center">Ícone</TableHead>
              <TableHead className="w-[30%]">Título</TableHead>
              <TableHead>Transporte</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {addons.map((addon) => {
              const Icon = getIconComponent(addon.icon)
              return (
                <TableRow key={addon.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <TableCell className="text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                      <Icon className="w-5 h-5" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-slate-900">{addon.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5 max-w-[200px] truncate" title={addon.description || ''}>
                       {addon.description || 'Sem descrição'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {addon.transport_type && addon.transport_type !== '__any' ? (
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        addon.transport_type.toLowerCase().includes('bus') ? "bg-amber-50 text-amber-700" : "bg-sky-50 text-sky-700"
                      )}>
                        {addon.transport_type === 'Bus' && <Bus className="w-3 h-3 mr-1" />}
                        {addon.transport_type === 'Aéreo' && <Plane className="w-3 h-3 mr-1" />}
                        {addon.transport_type}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        Global
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-slate-700 font-mono">
                    {addon.currency} {addon.price.toFixed(2)}
                  </TableCell>
                  <TableCell>
                     <div className="flex items-center gap-2">
                        <span className={cn("h-2 w-2 rounded-full", addon.is_active ? "bg-emerald-500" : "bg-slate-300")} />
                        <span className="text-xs text-slate-500">{addon.is_active ? "Ativo" : "Inativo"}</span>
                     </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-600" onClick={() => openDialog(addon)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-red-600" onClick={() => handleDelete(addon.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
            {addons.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                     <Sparkles className="w-8 h-8 text-slate-300" />
                     <p>Nenhum serviço adicional cadastrado.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </AdminSurface>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px] overflow-hidden rounded-xl border border-slate-200 bg-white p-0 shadow-2xl">
          <DialogHeader className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
            <DialogTitle className="text-lg font-bold text-slate-900">
                {editingAddon ? "Editar Serviço" : "Novo Serviço Adicional"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="space-y-4 px-6 py-6">
                <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                    <div className="grid gap-2">
                    <Label htmlFor="title" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Título</Label>
                    <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Ex: Assento Leito"
                        required
                        className={adminInputClass}
                    />
                    </div>
                    <div className="grid gap-2 w-[140px]">
                        <Label htmlFor="icon" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Ícone Visual</Label>
                        <Select
                        value={formData.icon || "Sparkles"}
                        onValueChange={(val) => setFormData({ ...formData, icon: val })}
                        >
                        <SelectTrigger className={adminSelectTriggerClass}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {AVAILABLE_ICONS.map((icon) => (
                            <SelectItem key={icon.value} value={icon.value}>
                                <div className="flex items-center gap-2">
                                <icon.icon className="w-4 h-4 text-slate-500" />
                                <span>{icon.label}</span>
                                </div>
                            </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                    </div>
                </div>
            
                <div className="grid gap-2">
                <Label htmlFor="description" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Descrição (Interna)</Label>
                <Input
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detalhes sobre o serviço..."
                    className={adminInputClass}
                />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="grid gap-2">
                    <Label htmlFor="price" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Preço Unitário</Label>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400 text-sm">{formData.currency}</span>
                        <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                        required
                        className={cn(adminInputClass, "pl-12")}
                        />
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="currency" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Moeda</Label>
                    <Select
                    value={formData.currency}
                    onValueChange={(val) => setFormData({ ...formData, currency: val })}
                    >
                    <SelectTrigger className={adminSelectTriggerClass}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="USD">Dólar (USD)</SelectItem>
                        <SelectItem value="BRL">Real (BRL)</SelectItem>
                        <SelectItem value="ARS">Peso (ARS)</SelectItem>
                    </SelectContent>
                    </Select>
                </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="grid gap-2">
                        <Label htmlFor="transport" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Restrição de Transporte</Label>
                        <Select
                        value={formData.transport_type || "__any"}
                        onValueChange={(val) => setFormData({ ...formData, transport_type: val })}
                        >
                        <SelectTrigger className={adminSelectTriggerClass}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__any">Qualquer Transporte</SelectItem>
                            <SelectItem value="Bus">Apenas Ônibus</SelectItem>
                            <SelectItem value="Aéreo">Apenas Aéreo</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-3 pt-6">
                         <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                             <Label htmlFor="active" className="cursor-pointer text-sm font-medium text-slate-700">Ativo no sistema</Label>
                            <Switch
                                id="active"
                                checked={formData.is_active}
                                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                            />
                         </div>
                    </div>
                </div>
            </div>

            <DialogFooter className="bg-slate-50/50 border-t border-slate-100 px-6 py-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="h-10">
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="h-10 bg-orange-600 hover:bg-orange-700 text-white">
                {loading ? "Salvando..." : editingAddon ? "Salvar Alterações" : "Criar Serviço"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

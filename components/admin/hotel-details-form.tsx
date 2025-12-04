"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save, Plus, Trash2, X, Image as ImageIcon, Link as LinkIcon, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { upsertHotelMetadata } from "@/lib/admin-hoteis"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface HotelData {
  id?: string
  slug: string
  nome: string
  destino: string
  descricao_completa: string
  images: string[]
  amenities: Array<{ nome: string; icone: string }>
}

interface HotelDetailsFormProps {
  initialData: HotelData
  isNew: boolean
}

// Lista de ícones comuns para facilitar
const COMMON_ICONS = [
  { value: "wifi", label: "Wi-Fi" },
  { value: "aire", label: "Ar Condicionado" },
  { value: "tv", label: "TV" },
  { value: "hot_tub", label: "Banheira/Hidro" },
  { value: "check", label: "Padrão (Check)" },
  { value: "pool", label: "Piscina" },
  { value: "restaurant", label: "Restaurante" },
  { value: "gym", label: "Academia" },
  { value: "parking", label: "Estacionamento" },
]

export function HotelDetailsForm({ initialData, isNew }: HotelDetailsFormProps) {
  const [formData, setFormData] = useState<HotelData>(initialData)
  const [loading, setLoading] = useState(false)
  const [newImageUrl, setNewImageUrl] = useState("")
  const [newAmenityName, setNewAmenityName] = useState("")
  const [newAmenityIcon, setNewAmenityIcon] = useState("check")
  
  const router = useRouter()
  const { toast } = useToast()

  const handleChange = (field: keyof HotelData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handlers para Imagens
  const addImage = () => {
    if (!newImageUrl.trim()) return
    
    if (formData.images.includes(newImageUrl)) {
      toast({ title: "Imagem já adicionada", variant: "destructive" })
      return
    }

    setFormData(prev => ({ ...prev, images: [...prev.images, newImageUrl.trim()] }))
    setNewImageUrl("")
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const newImages = [...formData.images]
    if (direction === 'left') {
      if (index === 0) return // Já é o primeiro
      const temp = newImages[index - 1]
      newImages[index - 1] = newImages[index]
      newImages[index] = temp
    } else {
      if (index === newImages.length - 1) return // Já é o último
      const temp = newImages[index + 1]
      newImages[index + 1] = newImages[index]
      newImages[index] = temp
    }
    setFormData(prev => ({ ...prev, images: newImages }))
  }

  // Handlers para Amenities
  const addAmenity = () => {
    if (!newAmenityName.trim()) return

    setFormData(prev => ({
      ...prev,
      amenities: [...prev.amenities, { nome: newAmenityName, icone: newAmenityIcon }]
    }))
    setNewAmenityName("")
    setNewAmenityIcon("check")
  }

  const removeAmenity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await upsertHotelMetadata(formData)
      toast({ title: "Hotel salvo com sucesso!" })
      router.refresh()
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro ao salvar", description: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border shadow-sm sticky top-4 z-10">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Edição de Metadados</h2>
          <p className="text-sm text-slate-500">Informações visuais e descritivas do hotel.</p>
        </div>
        <Button onClick={handleSubmit} disabled={loading} className="bg-orange-600 hover:bg-orange-700 text-white shadow-sm">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Salvar Alterações
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Coluna Esquerda: Informações Básicas */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Principais</CardTitle>
              <CardDescription>Dados fundamentais para identificação.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do Hotel</Label>
                <Input 
                  value={formData.nome} 
                  onChange={(e) => handleChange("nome", e.target.value)} 
                  placeholder="Ex: Hotel Canasvieiras Palace"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Slug (URL)</Label>
                  <Input 
                    value={formData.slug} 
                    disabled={!isNew} 
                    onChange={(e) => handleChange("slug", e.target.value)} 
                    className="bg-slate-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Destino</Label>
                  <Input 
                    value={formData.destino} 
                    onChange={(e) => handleChange("destino", e.target.value)} 
                    placeholder="Ex: Florianópolis"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descrição Completa</Label>
                <Textarea 
                  value={formData.descricao_completa} 
                  onChange={(e) => handleChange("descricao_completa", e.target.value)} 
                  className="min-h-[200px] resize-y"
                  placeholder="Descreva o hotel, seus pontos fortes e localização..."
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.descricao_completa?.length || 0} caracteres
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
               <CardTitle>Comodidades (Amenities)</CardTitle>
               <CardDescription>Itens que aparecem em destaque no card.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex gap-2">
                  <Input 
                    placeholder="Nome (ex: Piscina Térmica)" 
                    value={newAmenityName}
                    onChange={(e) => setNewAmenityName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addAmenity()}
                  />
                  <Select value={newAmenityIcon} onValueChange={setNewAmenityIcon}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Ícone" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_ICONS.map(icon => (
                        <SelectItem key={icon.value} value={icon.value}>
                          {icon.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={addAmenity} variant="secondary">
                    <Plus className="w-4 h-4" />
                  </Button>
               </div>

               <div className="flex flex-wrap gap-2 pt-2">
                  {formData.amenities.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">Nenhuma comodidade adicionada.</p>
                  )}
                  {formData.amenities.map((item, idx) => (
                     <div key={idx} className="flex items-center gap-2 bg-slate-100 pl-3 pr-1.5 py-1.5 rounded-md border text-sm group">
                        <span className="font-medium text-slate-700">{item.nome}</span>
                        <span className="text-xs text-slate-400">({item.icone})</span>
                        <button 
                          onClick={() => removeAmenity(idx)}
                          className="ml-1 p-0.5 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                     </div>
                  ))}
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita: Mídia */}
        <div className="space-y-6">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Galeria de Fotos</CardTitle>
              <CardDescription>Adicione URLs de imagens para o carrossel.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="https://..." 
                    className="pl-9"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addImage()}
                  />
                </div>
                <Button onClick={addImage} variant="secondary">
                  <Plus className="w-4 h-4 mr-2" /> Adicionar
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-2">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="group relative aspect-video bg-slate-100 rounded-lg overflow-hidden border hover:border-orange-300 transition-all">
                    <Image 
                      src={img} 
                      alt={`Foto ${idx + 1}`} 
                      fill 
                      className="object-cover" 
                      unoptimized 
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    
                    {/* Botões de Ação */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                       {idx > 0 && (
                          <button 
                            onClick={() => moveImage(idx, 'left')} 
                            className="p-1.5 bg-black/50 text-white rounded-md hover:bg-black/70"
                            title="Mover para esquerda/cima"
                          >
                            <ChevronLeft className="w-3 h-3" />
                          </button>
                       )}
                       {idx < formData.images.length - 1 && (
                          <button 
                            onClick={() => moveImage(idx, 'right')} 
                            className="p-1.5 bg-black/50 text-white rounded-md hover:bg-black/70"
                            title="Mover para direita/baixo"
                          >
                            <ChevronRight className="w-3 h-3" />
                          </button>
                       )}
                       <button 
                         onClick={() => removeImage(idx)} 
                         className="p-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 shadow-sm"
                         title="Remover imagem"
                       >
                         <Trash2 className="w-3 h-3" />
                       </button>
                    </div>
                  </div>
                ))}
                
                {formData.images.length === 0 && (
                   <div className="col-span-2 flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-lg bg-slate-50 text-slate-400">
                      <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-sm">Nenhuma imagem na galeria</p>
                   </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

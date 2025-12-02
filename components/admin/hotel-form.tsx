"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload, X, Save, ArrowLeft, Wifi, AirVent, Tv, Refrigerator, Waves, Utensils, Shield, Sparkles, Clock, Car, ChefHat, Bath, Flame, Gamepad2, Coffee, MapPin, Globe, Plus } from "lucide-react"
import { AdminSurface } from "@/components/admin/surface"
import { adminInputClass } from "@/components/admin/styles"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HotelAvailabilityList } from "./hotel-availability-list"
import { Disponibilidade } from "@/lib/supabase"
import { cn } from "@/lib/utils"

const AVAILABLE_AMENITIES = [
  { value: "wifi", label: "Wi-Fi", icon: Wifi },
  { value: "aire", label: "Ar Condicionado", icon: AirVent },
  { value: "tv", label: "TV", icon: Tv },
  { value: "fridge", label: "Frigobar", icon: Refrigerator },
  { value: "pool", label: "Piscina", icon: Waves },
  { value: "restaurant", label: "Restaurante", icon: Utensils },
  { value: "safe", label: "Cofre", icon: Shield },
  { value: "cleaning", label: "Limpeza", icon: Sparkles },
  { value: "reception", label: "Recepção 24h", icon: Clock },
  { value: "parking", label: "Estacionamento", icon: Car },
  { value: "kitchen", label: "Cozinha", icon: ChefHat },
  { value: "hot_tub", label: "Banheira/Hidro", icon: Bath },
  { value: "bbq", label: "Churrasqueira", icon: Flame },
  { value: "gamepad", label: "Jogos", icon: Gamepad2 },
  { value: "coffee", label: "Café da Manhã", icon: Coffee },
]

interface HotelData {
  id?: string
  slug: string
  nome: string
  destino: string
  descricao_completa?: string
  images: string[]
  amenities?: any[]
  highlights?: string[]
}

interface HotelFormProps {
  initialData: HotelData
  isNew?: boolean
  disponibilidades?: Disponibilidade[]
}

export function HotelForm({ initialData, isNew = false, disponibilidades = [] }: HotelFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [data, setData] = useState(initialData)

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/hoteis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Erro ao salvar")

      toast({ title: "Hotel salvo com sucesso!" })
      if (isNew) router.push("/admin/disponibilidades")
      else router.refresh()
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível salvar." })
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    console.log('Iniciando upload de', files.length, 'arquivos...')

    try {
      const newImages = [...data.images]
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        console.log(`Enviando arquivo ${i + 1}/${files.length}:`, file.name)

        const formData = new FormData()
        formData.append("file", file)
        formData.append("bucket", "hotel-images")
        formData.append("folder", data.slug)

        const res = await fetch("/api/admin/upload-generic", {
          method: "POST",
          body: formData,
        })

        console.log('Status resposta:', res.status)

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}))
            console.error('Erro no upload:', errData)
            throw new Error(errData.error || `Falha no arquivo ${file.name} (${res.status})`)
        }
        
        const json = await res.json()
        console.log('Sucesso:', json)
        
        if (json.url) {
            newImages.push(json.url)
        } else {
            console.warn('Resposta sem URL:', json)
        }
      }

      setData({ ...data, images: newImages })
      toast({ title: "Imagens enviadas com sucesso!" })
    } catch (error) {
      console.error('Erro fatal no upload:', error)
      toast({ 
        variant: "destructive", 
        title: "Erro no upload", 
        description: error instanceof Error ? error.message : "Falha desconhecida ao enviar imagem"
      })
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  const removeImage = (index: number) => {
    const newImages = [...data.images]
    newImages.splice(index, 1)
    setData({ ...data, images: newImages })
  }

  const addHighlight = () => {
    setData({ ...data, highlights: [...(data.highlights || []), ""] })
  }

  const removeHighlight = (index: number) => {
    const newHighlights = [...(data.highlights || [])]
    newHighlights.splice(index, 1)
    setData({ ...data, highlights: newHighlights })
  }

  const updateHighlight = (index: number, value: string) => {
    const newHighlights = [...(data.highlights || [])]
    newHighlights[index] = value
    setData({ ...data, highlights: newHighlights })
  }

  const toggleAmenity = (value: string, label: string) => {
    const current = data.amenities || []
    const exists = current.some((a: any) => a.icone === value)
    
    let next
    if (exists) {
      next = current.filter((a: any) => a.icone !== value)
    } else {
      next = [...current, { nome: label, icone: value }]
    }
    
    setData({ ...data, amenities: next })
  }

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between sticky top-0 z-30 bg-[#f8f9fc]/80 backdrop-blur-md py-4 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/admin/disponibilidades')} className="rounded-full hover:bg-white hover:shadow-sm">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
               <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{data.nome || "Novo Hotel"}</h1>
               {isNew && <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">Novo</span>}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
               <MapPin className="w-3.5 h-3.5" />
               {data.destino || "Sem destino definido"}
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={loading} className="bg-orange-600 hover:bg-orange-700 text-white shadow-sm gap-2 rounded-full px-6">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar Alterações
          </Button>
        </div>
      </div>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="w-full max-w-md bg-white p-1 rounded-xl shadow-sm border border-slate-200">
          <TabsTrigger value="calendar" className="rounded-lg data-[state=active]:bg-slate-900 data-[state=active]:text-white">Calendário & Preços</TabsTrigger>
          <TabsTrigger value="content" className="rounded-lg data-[state=active]:bg-slate-900 data-[state=active]:text-white">Conteúdo & Fotos</TabsTrigger>
        </TabsList>

        {/* Aba Calendário */}
        <TabsContent value="calendar" className="mt-6 focus-visible:outline-none">
          <AdminSurface className="p-0 overflow-hidden border border-slate-200 shadow-sm">
             <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">Gerenciamento de Saídas</h3>
                <p className="text-sm text-slate-500">Visualize todas as datas disponíveis para este pacote.</p>
             </div>
             <div className="p-6">
                <HotelAvailabilityList hotelName={data.nome} initialData={disponibilidades} />
             </div>
          </AdminSurface>
        </TabsContent>

        {/* Aba Conteúdo */}
        <TabsContent value="content" className="mt-6 focus-visible:outline-none">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8">
            
            {/* Coluna Principal: Info */}
            <div className="space-y-6">
              <AdminSurface className="p-8 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                   <Globe className="w-5 h-5 text-slate-400" />
                   <h3 className="font-semibold text-lg text-slate-900">Informações Básicas</h3>
                </div>
                
                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <Label className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Nome do Pacote / Hotel</Label>
                    <Input 
                      value={data.nome} 
                      onChange={(e) => setData({...data, nome: e.target.value})}
                      className={cn(adminInputClass, "text-lg font-medium")}
                      placeholder="Ex: Hotel Mar del Plata"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="grid gap-2">
                      <Label className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Destino</Label>
                      <Input 
                        value={data.destino} 
                        onChange={(e) => setData({...data, destino: e.target.value})}
                        className={adminInputClass}
                        placeholder="Ex: Florianópolis"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Slug (URL)</Label>
                      <Input 
                        value={data.slug} 
                        onChange={(e) => setData({...data, slug: e.target.value})}
                        className={cn(adminInputClass, "bg-slate-50 font-mono text-sm")}
                        disabled={!isNew}
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Descrição Comercial</Label>
                    <Textarea 
                      value={data.descricao_completa || ""} 
                      onChange={(e) => setData({...data, descricao_completa: e.target.value})}
                      className="min-h-[180px] bg-slate-50 border-slate-200 focus:border-orange-500 focus:ring-orange-500 rounded-xl resize-none p-4 leading-relaxed"
                      placeholder="Descreva os diferenciais deste pacote..."
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <Label className="text-sm font-semibold text-slate-900">Destaques (Highlights)</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addHighlight} className="h-8 text-xs rounded-lg">
                        <Plus className="w-3 h-3 mr-1" /> Adicionar Item
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {(data.highlights || []).map((highlight, index) => (
                        <div key={index} className="flex gap-3 items-center group">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                          <Input 
                            value={highlight} 
                            onChange={(e) => updateHighlight(index, e.target.value)}
                            placeholder="Ex: Café da manhã incluso"
                            className={cn(adminInputClass, "bg-white border-transparent hover:border-slate-200 focus:bg-white transition-all")}
                          />
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeHighlight(index)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all">
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      {(!data.highlights || data.highlights.length === 0) && (
                        <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-xl">
                           <p className="text-sm text-slate-400">Nenhum destaque adicionado.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </AdminSurface>
            </div>

            {/* Coluna Lateral: Mídia & Amenities */}
            <div className="space-y-6">
              <AdminSurface className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">Galeria de Fotos</h3>
                  <div className="relative">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      disabled={uploading}
                    />
                    <Button variant="secondary" size="sm" disabled={uploading} className="gap-2 h-8 rounded-lg text-xs font-medium">
                      {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                      Upload
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {data.images.map((url, index) => (
                    <div key={index} className="relative group aspect-square rounded-xl overflow-hidden bg-slate-100 shadow-sm transition-all hover:shadow-md">
                      <Image src={url} alt={`Foto ${index}`} fill className="object-cover transition-transform group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-white/90 text-slate-700 hover:text-red-600 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Capa
                        </span>
                      )}
                    </div>
                  ))}
                  <div className="col-span-2 relative flex flex-col items-center justify-center h-32 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl hover:border-orange-200 hover:bg-orange-50/30 transition-colors cursor-pointer">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploading}
                      />
                      <Upload className="w-6 h-6 mb-2 opacity-50" />
                      <span className="text-xs font-medium">Arraste ou clique para adicionar</span>
                  </div>
                </div>
              </AdminSurface>

              <AdminSurface className="p-6 space-y-4">
                <h3 className="font-semibold text-slate-900">Comodidades</h3>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_AMENITIES.map((item) => {
                    const isSelected = (data.amenities || []).some((a: any) => a.icone === item.value)
                    return (
                      <button
                        key={item.value}
                        onClick={() => toggleAmenity(item.value, item.label)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all border",
                          isSelected 
                            ? "bg-orange-50 text-orange-700 border-orange-200 shadow-sm" 
                            : "bg-white text-slate-500 border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                        )}
                      >
                        <item.icon className={cn("w-3.5 h-3.5", isSelected ? "text-orange-500" : "text-slate-400")} />
                        {item.label}
                      </button>
                    )
                  })}
                </div>
              </AdminSurface>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
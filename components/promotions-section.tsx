"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { Bus, Plane, MapPin, Calendar, Clock, ArrowRight, Bed, Camera } from "lucide-react"
import { fetchPromotions } from "@/lib/supabase-service"
import type { Promotion } from "@/lib/supabase"
import { openWhatsapp, logWhatsappConversion } from "@/lib/whatsapp"
import { cn } from "@/lib/utils"
import { FadeIn } from "@/components/ui/fade-in"

type PromotionGroups = {
  paquetes: Promotion[]
  hospedajes: Promotion[]
  paseos: Promotion[]
}

type PromoCardProps = {
  tipo: string
  titulo: string
  subtitulo?: string | null
  destino?: string | null
  hotel?: string | null
  imagen?: string | null
  precios: Array<{ label: string; valor: number }>
  ctaLabel?: string | null
  onWhatsappClick?: () => void
  whatsappLabel?: string | null
  departureDate?: string | null
  validUntil?: string | null
}

const sectionCopy = {
  paquetes: {
    title: "Paquetes Destacados",
    description: "Salidas confirmadas con transporte y alojamiento.",
  },
  hospedajes: {
    title: "Alojamientos Exclusivos",
    description: "Hoteles y posadas seleccionadas con tarifas especiales.",
  },
  paseos: {
    title: "Experiencias Únicas",
    description: "Actividades y excursiones para completar tu viaje.",
  },
}

const isExpired = (promo: Promotion) => {
  if (!promo || !promo.valid_until || !promo.auto_hide) return false
  return new Date(promo.valid_until) < new Date()
}

const formatPrice = (valor: number) => {
  const number = Number(valor)
  if (Number.isNaN(number)) return "USD 0"
  return `USD ${number.toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`
}

const mapTipo = (promotion: Promotion) => {
  if (promotion.type === "hospedaje") return "Hotel"
  if (promotion.type === "paseo") return "Paseo"
  return promotion.transporte || "Paquete"
}

const extractPrecios = (promotion: Promotion) => {
  let labels = [
    { key: "price_single", label: "Single" },
    { key: "price_double", label: "Doble" },
    { key: "price_triple", label: "Triple" },
    { key: "price_quad", label: "Quadruple" },
    { key: "price_quint", label: "Quintuple" },
  ]

  if (promotion.type === 'hospedaje') {
    labels = [
      { key: "price_single", label: "Diária" },
      { key: "price_double", label: "Pct 7 Noites" },
      { key: "price_triple", label: "Total" },
      { key: "price_quad", label: "Extra" },
      { key: "price_quint", label: "Extra" },
    ]
  } else if (promotion.type === 'paseo') {
    labels = [
      { key: "price_single", label: "Adulto" },
      { key: "price_double", label: "Niño (4-5)" },
      { key: "price_triple", label: "Niño (6+)" },
      { key: "price_quad", label: "Grupo" },
      { key: "price_quint", label: "Privado" },
    ]
  }

  const entries = labels.map(item => ({
    label: item.label,
    valor: (promotion as any)[item.key]
  }))

  return entries.filter((entry) => entry.valor != null && entry.valor > 0) as Array<{ label: string; valor: number }>
}

const formatDepartureDate = (value?: string | null) => {
  if (!value) return null
  try {
    const date = parseISO(value)
    return format(date, "d MMM", { locale: es })
  } catch {
    return value
  }
}

const buildPromotionWhatsappText = (
  promotion: Promotion,
  tipoLabel: string,
  precios: Array<{ label: string; valor: number }>
) => {
  const lines: string[] = []
  const titulo = promotion.title ? promotion.title : 'la promoción destacada'
  const destino = promotion.destino ? ` en ${promotion.destino}` : ''
  
  // Lógica específica por tipo
  if (promotion.type === 'hospedaje') {
    const hotel = promotion.hotel ? ` en el ${promotion.hotel}` : ''
    const checkin = promotion.departure_date ? ` (Check-in sugerido: ${formatDepartureDate(promotion.departure_date)})` : ''
    lines.push(`Hola, vi en el sitio y quiero reservar el alojamiento: *${titulo}*${destino}${hotel}${checkin}.`)
  } else if (promotion.type === 'paseo') {
    const data = promotion.departure_date ? ` para la fecha: ${formatDepartureDate(promotion.departure_date)}` : ''
    lines.push(`Hola, vi en el sitio y quiero reservar la experiencia: *${titulo}*${destino}${data}.`)
  } else {
    // Paquete (Default)
    const hotel = promotion.hotel ? ` en el hotel ${promotion.hotel}` : ''
    const transporte = promotion.transporte || tipoLabel
    const salida = promotion.departure_date ? ` (salida sugerida: ${formatDepartureDate(promotion.departure_date)})` : ''
    lines.push(`Hola, vi en el sitio y quiero más información sobre el paquete: *${titulo}* hacia ${promotion.destino || ''}${hotel}. Transporte: ${transporte}${salida}.`)
  }

  if (precios.length) {
    lines.push('\n💰 Valores por persona:')
    precios.forEach((item) => {
      lines.push(`• ${item.label}: ${formatPrice(item.valor)}`)
    })
  }

  lines.push('\n¿Podrían ayudarme con la disponibilidad? ¡Gracias!')

  return encodeURIComponent(lines.join('\n'))
}

function PromoCard({
  tipo,
  titulo,
  subtitulo,
  destino,
  imagen,
  precios,
  ctaLabel,
  onWhatsappClick,
  departureDate,
  hotel,
  validUntil,
}: PromoCardProps) {
  const isAereo = tipo.toLowerCase().includes("aereo") || tipo.toLowerCase().includes("aéreo")
  const isBus = tipo.toLowerCase().includes("bus") || tipo.toLowerCase().includes("bús")
  const isPaseo = tipo.toLowerCase() === 'paseo'
  const HotelIcon = isPaseo ? Camera : Bed
  
  return (
    <article className="group relative flex flex-col h-[560px] w-full overflow-hidden rounded-[24px] bg-white shadow-sm border border-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* IMAGEM - Topo Fixo (220px) */}
      <div className="relative h-[220px] w-full shrink-0 overflow-hidden bg-slate-100">
        {imagen ? (
          <Image
            src={imagen}
            alt={titulo}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-slate-400 text-xs">Sem imagem</div>
        )}
        
        {/* Badges - Top Left */}
        <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5 max-w-[70%]">
          {isAereo && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/95 backdrop-blur-md border border-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-600 shadow-sm">
              <Plane className="w-3 h-3" /> Aéreo
            </span>
          )}
          {isBus && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/95 backdrop-blur-md border border-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-600 shadow-sm">
              <Bus className="w-3 h-3" /> Bus
            </span>
          )}
          {departureDate && (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/80 backdrop-blur-md border border-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
              <Calendar className="w-3 h-3" /> {isPaseo ? 'FECHA' : 'SALIDA'} {formatDepartureDate(departureDate)}
            </span>
          )}
        </div>

        {/* Badge - Top Right (Valid Until) */}
        {validUntil && (
          <div className="absolute top-3 right-3 z-10">
            <span className="inline-flex items-center gap-1 rounded-full bg-red-500/90 backdrop-blur-md border border-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
              <Clock className="w-3 h-3" /> Válido hasta {formatDepartureDate(validUntil)}
            </span>
          </div>
        )}
      </div>

      {/* CONTEÚDO - Restante do Card */}
      <div className="flex flex-col flex-1 p-5">
        
        {/* Cabeçalho */}
        <div className="mb-3">
          <div className="flex flex-wrap items-center gap-3 mb-1.5">
            {destino && (
              <div className="flex items-center gap-1 text-[#FF6B35] text-[10px] font-bold uppercase tracking-widest">
                <MapPin className="w-3 h-3" /> {destino}
              </div>
            )}
            {hotel && (
              <div className="flex items-center gap-1 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                <HotelIcon className="w-3 h-3" /> {hotel}
              </div>
            )}
          </div>
          
          <h3 className="text-lg font-bold text-slate-900 leading-snug line-clamp-1 group-hover:text-[#FF6B35] transition-colors">
            {titulo}
          </h3>
          {subtitulo && (
            <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed font-medium">
              {subtitulo}
            </p>
          )}
        </div>

        {/* Lista de Preços - Compacta e Limpa */}
        <div className="mt-auto mb-4 bg-slate-50 rounded-xl border border-slate-100 p-3">
          <div className="space-y-1.5">
            {precios.length > 0 ? precios.slice(0, 4).map((p) => (
               <div key={p.label} className="flex justify-between items-end border-b border-slate-200/50 last:border-0 pb-1 last:pb-0">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{p.label}</span>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-[9px] text-slate-400">USD</span>
                    <span className="text-sm font-bold text-slate-900">{p.valor}</span>
                  </div>
               </div>
            )) : (
              <div className="text-center text-xs text-slate-400 py-2">Consultar valores</div>
            )}
          </div>
        </div>

        {/* Botão CTA */}
        <button
          onClick={onWhatsappClick}
          className="btn-liquid-orange h-11 w-full rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-md hover:shadow-lg group/btn shrink-0"
        >
          {ctaLabel || "Ver Disponibilidad"}
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </article>
  )
}

function PromotionBlock({
  title,
  description,
  items,
}: {
  title: string
  description: string
  items: Promotion[]
}) {
  if (!items.length) return null
  return (
    <section className="space-y-6">
      <FadeIn className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{title}</h3>
          <p className="text-slate-500 mt-1">{description}</p>
        </div>
      </FadeIn>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((promotion, index) => {
          const tipo = mapTipo(promotion)
          const precios = extractPrecios(promotion)
          const encodedMessage = buildPromotionWhatsappText(promotion, tipo, precios)
          const handleWhatsappClick = () => {
            openWhatsapp('', encodedMessage)
            logWhatsappConversion({
              origem: 'promotions-card',
              promotionId: promotion.id,
              promotionTitle: promotion.title,
            })
          }
          return (
            <FadeIn key={promotion.id} delay={index * 0.2}>
              <PromoCard
                tipo={tipo}
                titulo={promotion.title}
                subtitulo={promotion.subtitle}
                destino={promotion.destino}
                hotel={promotion.hotel}
                imagen={promotion.image_url}
                precios={precios}
                ctaLabel={promotion.cta_label}
                whatsappLabel={promotion.cta_label}
                onWhatsappClick={handleWhatsappClick}
                departureDate={promotion.departure_date}
                validUntil={promotion.valid_until}
              />
            </FadeIn>
          )
        })}
      </div>
    </section>
  )
}

export function PromotionsSection() {
  const [data, setData] = useState<PromotionGroups>({ paquetes: [], hospedajes: [], paseos: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const loadPromos = async () => {
      setLoading(true)
      try {
        const [paquetes, hospedajes, paseos] = await Promise.all([
          fetchPromotions({ type: "paquete", limit: 6 }),
          fetchPromotions({ type: "hospedaje", limit: 6 }),
          fetchPromotions({ type: "paseo", limit: 6 }),
        ])
        if (!active) return
        setData({
          paquetes: paquetes.filter((p) => !isExpired(p)),
          hospedajes: hospedajes.filter((p) => !isExpired(p)),
          paseos: paseos.filter((p) => !isExpired(p)),
        })
      } catch (error) {
        console.error("Failed to load promotions:", error)
      } finally {
        if (active) setLoading(false)
      }
    }
    loadPromos()
    return () => {
      active = false
    }
  }, [])

  if (!loading && !data.paquetes.length && !data.hospedajes.length && !data.paseos.length) {
    return null
  }

  return (
    <div className="bg-white py-20 lg:py-28 relative overflow-hidden">
      {/* Elementos decorativos de fundo */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-slate-50 to-white -z-10" />
      
      <div className="container mx-auto px-4 lg:px-[70px] space-y-24">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 animate-pulse">
            <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-orange-500 animate-spin" />
            <p className="text-slate-400 font-medium">Buscando las mejores ofertas...</p>
          </div>
        ) : (
          <>
            <PromotionBlock title={sectionCopy.paquetes.title} description={sectionCopy.paquetes.description} items={data.paquetes} />
            <PromotionBlock title={sectionCopy.hospedajes.title} description={sectionCopy.hospedajes.description} items={data.hospedajes} />
            <PromotionBlock title={sectionCopy.paseos.title} description={sectionCopy.paseos.description} items={data.paseos} />
          </>
        )}
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { BusFront, Plane } from "lucide-react"
import { fetchPromotions } from "@/lib/supabase-service"
import type { Promotion } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { openWhatsapp, logWhatsappConversion } from "@/lib/whatsapp"

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
}

const sectionCopy = {
  paquetes: {
    title: "Paquetes promocionales",
    description: "Combos con bus/aéreo y hotel a precio especial, listos para salir ya.",
  },
  hospedajes: {
    title: "Hospedajes con descuento",
    description: "Hoteles seleccionados con tarifas limitadas por tiempo.",
  },
  paseos: {
    title: "Paseos destacados",
    description: "Excursiones y experiencias locales con precios especiales.",
  },
}

const sectionCopyLabel = (title: string) => {
  const normalized = title.toLowerCase()
  if (normalized.includes('paquete')) return 'Paquetes'
  if (normalized.includes('hosped')) return 'Hospedajes'
  if (normalized.includes('paseo')) return 'Paseos'
  return 'Destacados'
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
  const entries = [
    { label: "Doble", valor: promotion.price_double },
    { label: "Triple", valor: promotion.price_triple },
    { label: "Quadruple", valor: promotion.price_quad },
    { label: "Quintuple", valor: promotion.price_quint },
  ]
  return entries.filter((entry) => entry.valor != null) as Array<{ label: string; valor: number }>
}

const transportMeta = (tipo: string) => {
  const normalized = tipo.toLowerCase()
  if (normalized.includes("aer")) {
    return {
      label: "Aéreo",
      icon: Plane,
      iconBg: "bg-sky-50 text-sky-600",
      badgeClass: "border-sky-100 text-sky-700",
    }
  }
  if (normalized.includes("bus") || normalized.includes("bús")) {
    return {
      label: "Bús",
      icon: BusFront,
      iconBg: "bg-amber-50 text-amber-600",
      badgeClass: "border-amber-100 text-amber-700",
    }
  }
  return {
    label: tipo || "Promo",
    icon: null,
    iconBg: "bg-emerald-50 text-emerald-600",
    badgeClass: "border-slate-200 text-slate-700",
  }
}

const defaultCtaUrl = (promotion: Promotion) => {
  if (promotion.cta_url) return promotion.cta_url
  if (promotion.type === "paquete" && promotion.slug_disponibilidade) {
    return `/detalhes?slug=${promotion.slug_disponibilidade}`
  }
  if (promotion.type === "hospedaje" && promotion.slug_hospedagem) {
    return `/detalhes-hospedagem?slug=${promotion.slug_hospedagem}`
  }
  if (promotion.type === "paseo" && promotion.slug_paseo) {
    return `/detalhes-passeio?slug=${promotion.slug_paseo}`
  }
  return "#"
}

const buildPromotionWhatsappText = (
  promotion: Promotion,
  tipoLabel: string,
  precios: Array<{ label: string; valor: number }>
) => {
  const lines: string[] = []
  const titulo = promotion.title ? `la promoción ${promotion.title}` : 'la promoción destacada'
  const destino = promotion.destino ? ` hacia ${promotion.destino}` : ''
  const hotel = promotion.hotel ? ` en el hotel ${promotion.hotel}` : ''
  const transporte = promotion.transporte || tipoLabel
  const salida = promotion.departure_date ? ` (salida sugerida: ${formatDepartureDate(promotion.departure_date)})` : ''

  lines.push(
    `Hola, vi en el sitio y quiero más información sobre ${titulo}${destino}${hotel}. Transporte: ${transporte}${salida}.`,
  )

  if (precios.length) {
    lines.push('\n💰 Valores por persona:')
    precios.forEach((item) => {
      lines.push(`• ${item.label}: ${formatPrice(item.valor)}`)
    })
  }

  lines.push('\n¿Podrían ayudarme con la disponibilidad? ¡Gracias!')

  return encodeURIComponent(lines.join('\n'))
}

const formatDepartureDate = (value?: string | null) => {
  if (!value) return null
  try {
    const date = parseISO(value)
    return format(date, "dd MMM yyyy", { locale: es })
  } catch {
    return value
  }
}

function PromoCard({
  tipo,
  titulo,
  subtitulo,
  destino,
  hotel,
  imagen,
  precios,
  ctaLabel,
  onWhatsappClick,
  whatsappLabel,
  departureDate,
}: PromoCardProps) {
  const fallbackSubtitle = "Disfrutá esta oferta especial por tiempo limitado."
  const subtitleText = subtitulo?.trim() ? subtitulo : fallbackSubtitle
  const departureDateText = formatDepartureDate(departureDate)
  const transport = transportMeta(tipo)

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-white/60 bg-white shadow-[0_22px_70px_rgba(10,20,30,0.12)] transition duration-300 ease-out hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_32px_95px_rgba(10,20,30,0.22)]">
      <div className="relative h-48 w-full overflow-hidden sm:h-56">
        {imagen ? (
          <Image src={imagen} alt={titulo} fill sizes="(max-width:768px) 100vw, 25vw" className="object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100 text-xs text-slate-400">Sin imagen</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-2xl font-semibold text-white drop-shadow-[0_10px_25px_rgba(0,0,0,0.45)]">{titulo}</h3>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-slate-600">
          <span
            className={`inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-[0.65rem] uppercase tracking-wide shadow-sm ${transport.badgeClass}`}
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-sm ${transport.iconBg}`}
            >
              {transport.icon ? <transport.icon className="h-3.5 w-3.5" strokeWidth={2.2} /> : "🌴"}
            </span>
            {transport.label}
          </span>
          {departureDateText && (
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[0.65rem] uppercase tracking-wide text-slate-600 shadow-sm">
              <span role="img" aria-hidden="true">📅</span>
              Salida · {departureDateText}
            </span>
          )}
        </div>
        <p className="text-sm text-[#667085]">{subtitleText}</p>

        <div className="flex flex-wrap justify-center gap-2 text-xs font-medium text-slate-600">
          {destino && (
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs shadow-inner shadow-white/70">
              📍 {destino}
            </span>
          )}
          {hotel && (
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs shadow-inner shadow-white/70">
              🏨 {hotel}
            </span>
          )}
        </div>

        <div className="rounded-2xl bg-slate-50/90 p-3 shadow-inner shadow-white/70 sm:p-4">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-slate-400 sm:text-xs">
            💰 Precios por persona
          </p>
          {precios.length > 0 ? (
            <dl className="mt-2 grid gap-2 sm:mt-3 sm:grid-cols-2 sm:gap-3">
              {precios.map((precio) => (
                <div
                  key={precio.label}
                  className="rounded-2xl border border-slate-200 bg-white/95 px-3 py-2 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] sm:py-3"
                >
                  <dd className="text-base font-bold text-slate-900 sm:text-lg">{formatPrice(precio.valor)}</dd>
                  <dt className="text-[0.6rem] font-semibold uppercase tracking-wide text-slate-500 sm:text-[0.65rem]">{precio.label}</dt>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-3 text-sm text-slate-500">Consultar valores con nuestro equipo.</p>
          )}
        </div>
      </div>

      <div className="px-5 pb-5">
        <Button
          type="button"
          className="w-full rounded-2xl bg-gradient-to-r from-[#25D366] to-[#17b059] text-sm font-semibold uppercase tracking-wide text-white shadow-[0_15px_35px_rgba(23,176,89,0.35)] transition hover:brightness-110 hover:-translate-y-[2px]"
          onClick={onWhatsappClick}
        >
          {(whatsappLabel || ctaLabel || "Hablar por WhatsApp").toUpperCase()} <span className="ml-1 text-base">↗</span>
        </Button>
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
    <section className="space-y-4">
      <div className="text-center sm:text-left">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-orange-500 sm:text-xs">
          {sectionCopyLabel(title)}
        </p>
        <h3 className="text-xl font-semibold text-slate-900 sm:text-2xl">{title}</h3>
        <p className="text-sm text-slate-500 sm:text-base">{description}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((promotion) => {
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
            <PromoCard
              key={promotion.id}
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
            />
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
      const [paquetes, hospedajes, paseos] = await Promise.all([
        fetchPromotions({ type: "paquete", limit: 6 }),
        fetchPromotions({ type: "hospedaje", limit: 6 }),
        fetchPromotions({ type: "paseo", limit: 6 }),
      ])
      if (!active) return
      setData({ paquetes, hospedajes, paseos })
      setLoading(false)
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
    <section className="bg-gradient-to-b from-white to-slate-50 px-4 py-12 sm:py-16 lg:px-[70px]">
      <div className="mx-auto flex max-w-6xl flex-col gap-12">
        <div className="space-y-3 px-2 text-center sm:px-0">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-orange-500 sm:text-xs">Promociones exclusivas</p>
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Promociones exclusivas para tus próximas vacaciones</h2>
          <p className="text-sm text-slate-500 sm:text-base">Aprovechá las mejores ofertas en paquetes, hoteles y paseos por Brasil.</p>
        </div>

        {loading ? (
          <p className="text-center text-sm text-slate-500">Cargando ofertas...</p>
        ) : (
          <div className="space-y-12">
            <PromotionBlock title={sectionCopy.paquetes.title} description={sectionCopy.paquetes.description} items={data.paquetes} />
            <PromotionBlock title={sectionCopy.hospedajes.title} description={sectionCopy.hospedajes.description} items={data.hospedajes} />
            <PromotionBlock title={sectionCopy.paseos.title} description={sectionCopy.paseos.description} items={data.paseos} />
          </div>
        )}
      </div>
    </section>
  )
}

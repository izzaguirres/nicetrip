type HabInput = {
  label?: string
  adultos?: number
  children0to3?: number
  children4to5?: number
  children6plus?: number
  criancas_0_3?: number
  criancas_4_5?: number
  criancas_6?: number
  tipo?: string
  quarto_tipo?: string
  numero?: number
}

type Trecho = {
  data?: string
  origem_iata?: string
  destino_iata?: string
  saida?: string
  chegada?: string
}

type InstallmentsInfo = {
  count: number
  value: number
  currency?: string
}

type DiscountInfo = {
  name?: string
  amount?: number
}

type PackageWhatsappPayload = {
  destino?: string
  hotel?: string
  transporte?: string
  embarque?: string
  fecha_salida?: string
  fecha_regreso?: string
  noches?: number
  habitaciones?: HabInput[]
  total?: number
  total_original?: number
  ahorro?: number
  currency?: string
  installments?: InstallmentsInfo
  descuentos?: DiscountInfo[]
  voos?: Trecho[]
  bagagem?: { carry: number; despachada: number }
  extras?: string[]
  notas?: string[]
  link?: string
}

type HabitacionWhatsappPayload = {
  destino?: string
  hotel?: string
  checkin?: string
  checkout?: string
  noches?: number
  habitaciones?: HabInput[]
  total?: number
  currency?: string
  extras?: string[]
  notas?: string[]
  link?: string
}

type PaseoParticipant = {
  label: string
  quantidade: number
  unit?: number
  total?: number
}

type PaseoWhatsappPayload = {
  paseo?: string
  mes?: string
  adultos?: number
  ninos?: number
  participantes?: PaseoParticipant[]
  currency?: string
  total?: number
  local?: string | null
  horario?: string | null
  punto_encuentro?: string | null
  observaciones?: string[]
  link?: string
}

const fmt = {
  money(value?: number, currency?: string) {
    const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0
    const { symbol, locale } = resolveCurrency(currency)
    return `${symbol} ${safeValue.toLocaleString(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`
  },
  date(d?: string) {
    if (!d) return ''
    const [y, m, day] = d.split('-').map(Number)
    if (!y || !m || !day) return d
    const dt = new Date(Date.UTC(y, m - 1, day))
    return dt.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    })
  },
}

function resolveCurrency(currency?: string) {
  if (!currency) return { symbol: 'USD', locale: 'es-AR' as const }
  const cleaned = currency.trim().toUpperCase()
  if (cleaned === 'R$' || cleaned === 'BRL') {
    return { symbol: 'R$', locale: 'pt-BR' as const }
  }
  if (cleaned === 'ARS') {
    return { symbol: 'ARS', locale: 'es-AR' as const }
  }
  return { symbol: cleaned || 'USD', locale: 'es-AR' as const }
}

function compactLink(input?: string, slug?: string) {
  if (slug) return `https://nicetrip.com/p/${slug}`
  if (input) {
    try {
      const u = new URL(input)
      return `${u.origin}${u.pathname}`
    } catch {
      return input
    }
  }
  return ''
}

function describeVoos(voos?: Trecho[], bagagem?: { carry: number; despachada: number }) {
  if (!voos || voos.length === 0) return ''

  const linhas: string[] = []
  linhas.push('✈️ *Voos*')
  voos.forEach((v) => {
    if (v.saida && v.chegada && v.origem_iata && v.destino_iata) {
      const data = v.data ? `${fmt.date(v.data)} ` : ''
      linhas.push(`• ${data}${v.origem_iata}→${v.destino_iata} ${v.saida}–${v.chegada}`)
    }
  })
  if (bagagem) {
    linhas.push(
      `🎒 Equipaje: carry + item hasta ${bagagem.carry}kg | 1 maleta ${bagagem.despachada}kg (158 cm)`
    )
  }
  return linhas.join('\n')
}

type NormalizedRoom = {
  label: string
  adultos: number
  criancas0a3: number
  criancas4a5: number
  criancas6mais: number
  tipo?: string
}

function normaliseRooms(list?: HabInput[]): NormalizedRoom[] {
  if (!Array.isArray(list)) return []
  return list.map((room, index) => {
    const adultos = Number(room.adultos ?? 0)
    const c03 =
      Number(room.children0to3 ?? room.criancas_0_3 ?? 0)
    const c45 =
      Number(room.children4to5 ?? room.criancas_4_5 ?? 0)
    const c6 =
      Number(room.children6plus ?? room.criancas_6 ?? 0)
    const tipo = room.tipo || room.quarto_tipo || undefined
    const label =
      room.label ||
      (room.numero ? `Habitación ${room.numero}` : `Habitación ${index + 1}`)
    return { label, adultos, criancas0a3: c03, criancas4a5: c45, criancas6mais: c6, tipo }
  })
}

function formatRoomLine(room: NormalizedRoom) {
  const parts: string[] = []
  if (room.adultos > 0) {
    parts.push(`${room.adultos} adulto${room.adultos > 1 ? 's' : ''}`)
  }
  if (room.criancas0a3 > 0) {
    parts.push(`${room.criancas0a3} niño${room.criancas0a3 > 1 ? 's' : ''} (0-3)`)
  }
  if (room.criancas4a5 > 0) {
    parts.push(`${room.criancas4a5} niño${room.criancas4a5 > 1 ? 's' : ''} (4-5)`)
  }
  if (room.criancas6mais > 0) {
    parts.push(`${room.criancas6mais} niño${room.criancas6mais > 1 ? 's' : ''} 6+`)
  }
  const tipo = room.tipo ? ` (${room.tipo})` : ''
  return `• ${room.label}${tipo}: ${parts.length ? parts.join(', ') : 'configuración no informada'}`
}

function buildRoomSummary(rooms: NormalizedRoom[]) {
  if (!rooms.length) return ''

  const totals = rooms.reduce(
    (acc, room) => {
      acc.adultos += room.adultos
      acc.c03 += room.criancas0a3
      acc.c45 += room.criancas4a5
      acc.c6 += room.criancas6mais
      return acc
    },
    { adultos: 0, c03: 0, c45: 0, c6: 0 }
  )

  const parts: string[] = []
  if (totals.adultos > 0) parts.push(`${totals.adultos} adulto${totals.adultos > 1 ? 's' : ''}`)
  if (totals.c03 > 0) parts.push(`${totals.c03} niño${totals.c03 > 1 ? 's' : ''} (0-3)`)
  if (totals.c45 > 0) parts.push(`${totals.c45} niño${totals.c45 > 1 ? 's' : ''} (4-5)`)
  if (totals.c6 > 0) parts.push(`${totals.c6} niño${totals.c6 > 1 ? 's' : ''} 6+`)

  if (!parts.length) return ''

  const totalPeople = totals.adultos + totals.c03 + totals.c45 + totals.c6
  return `👥 *Pasajeros:* ${parts.join(' • ')} (total ${totalPeople})`
}

function formatInstallments(info?: InstallmentsInfo, fallbackCurrency?: string) {
  if (!info || info.count <= 0) return ''
  const currency = info.currency || fallbackCurrency
  if (info.count === 1) {
    return `💳 *Pago:* 1 cuota de ${fmt.money(info.value, currency)}`
  }
  return `💳 *Pago:* hasta ${info.count}x de ${fmt.money(info.value, currency)}`
}

function addLines(lines: string[], ...entries: Array<string | null | undefined>) {
  entries.forEach((entry) => {
    if (entry !== undefined && entry !== null && entry !== '') {
      lines.push(entry)
    }
  })
}

function buildPaqueteMessage(data: PackageWhatsappPayload) {
  const lines: string[] = []
  addLines(lines, '✅ *Nueva reserva - Nice Trip*')
  addLines(lines, data.destino && `📍 *Destino:* ${data.destino}`)
  addLines(lines, data.hotel && `🏨 *Hospedaje:* ${data.hotel}`)

  if (data.transporte) {
    const embarque = data.embarque ? ` - *Embarque:* ${data.embarque}` : ''
    addLines(lines, `🚌✈️ *Transporte:* ${data.transporte}${embarque}`)
  }

  if (data.fecha_salida || data.fecha_regreso) {
    const trecho = `${fmt.date(data.fecha_salida)} → ${fmt.date(data.fecha_regreso)}`
    const noches =
      typeof data.noches === 'number' && data.noches > 0 ? ` (${data.noches} noche(s))` : ''
    addLines(lines, `📅 *Fechas:* ${trecho}${noches}`)
  }

  const rooms = normaliseRooms(data.habitaciones)
  const roomSummary = buildRoomSummary(rooms)
  if (roomSummary) addLines(lines, '', roomSummary)

  if (rooms.length) {
    addLines(lines, '', '🛏️ *Habitaciones:*')
    rooms.forEach((room) => addLines(lines, formatRoomLine(room)))
  }

  const currency = data.currency
  const total = data.total
  const original = data.total_original
  const ahorro =
    typeof data.ahorro === 'number'
      ? data.ahorro
      : original && total
        ? original - total
        : undefined

  if (original && total && original > total + 0.01) {
    addLines(
      lines,
      '',
      `💵 *Precio anterior:* ${fmt.money(original, currency)}`,
      `💚 *Ahora:* ${fmt.money(total, currency)}`
    )
  } else if (typeof total === 'number') {
    addLines(lines, '', `💵 *Total estimado:* ${fmt.money(total, currency)}`)
  }

  if (ahorro && ahorro > 0) {
    addLines(lines, `🔖 *Ahorro:* ${fmt.money(ahorro, currency)}`)
  }

  const installmentsLine = formatInstallments(data.installments, currency)
  if (installmentsLine) addLines(lines, installmentsLine)

  if (Array.isArray(data.descuentos) && data.descuentos.length > 0) {
    addLines(lines, '', '🏷️ *Descuentos aplicados:*')
    data.descuentos.slice(0, 3).forEach((rule, index) => {
      const label = rule.name || `Descuento ${index + 1}`
      addLines(lines, `• ${label}: ${fmt.money(rule.amount ?? 0, currency)}`)
    })
    if (data.descuentos.length > 3) {
      addLines(lines, `• y ${data.descuentos.length - 3} descuento(s) más`)
    }
  }

  if (Array.isArray(data.extras) && data.extras.length > 0) {
    addLines(lines, '', '🧾 *Extras incluidos:*')
    data.extras.forEach((extra) => addLines(lines, `• ${extra}`))
  }

  const voosTxt = describeVoos(data.voos, data.bagagem)
  if (voosTxt) {
    addLines(lines, '', voosTxt)
  }

  if (Array.isArray(data.notas) && data.notas.length > 0) {
    addLines(lines, '', '🗒️ *Notas:*')
    data.notas.forEach((nota) => addLines(lines, `• ${nota}`))
  }

  const compact = compactLink(data.link)
  if (compact) {
    addLines(lines, '', `🔗 Link: ${compact}`)
  }

  return lines
}

function buildHabitacionMessage(data: HabitacionWhatsappPayload) {
  const lines: string[] = []
  addLines(lines, '🏨 *Reserva de Habitación - Nice Trip*')
  addLines(lines, data.destino && `📍 *Destino:* ${data.destino}`)
  addLines(lines, data.hotel && `🏨 *Hospedaje:* ${data.hotel}`)

  if (data.checkin || data.checkout) {
    addLines(
      lines,
      `📅 *Check-in:* ${fmt.date(data.checkin)}`
    )
    addLines(
      lines,
      `📅 *Check-out:* ${fmt.date(data.checkout)}`
    )
  }

  if (typeof data.noches === 'number' && data.noches > 0) {
    addLines(lines, `🛎️ *Noches:* ${data.noches}`)
  }

  const rooms = normaliseRooms(data.habitaciones)
  const roomSummary = buildRoomSummary(rooms)
  if (roomSummary) addLines(lines, '', roomSummary)

  if (rooms.length) {
    addLines(lines, '', '🛏️ *Habitaciones:*')
    rooms.forEach((room) => addLines(lines, formatRoomLine(room)))
  }

  if (typeof data.total === 'number') {
    addLines(lines, '', `💵 *Total estimado:* ${fmt.money(data.total, data.currency)}`)
  }

  if (Array.isArray(data.extras) && data.extras.length > 0) {
    addLines(lines, '', '🧾 *Incluye:*')
    data.extras.forEach((extra) => addLines(lines, `• ${extra}`))
  }

  if (Array.isArray(data.notas) && data.notas.length > 0) {
    addLines(lines, '', '🗒️ *Notas:*')
    data.notas.forEach((nota) => addLines(lines, `• ${nota}`))
  }

  const compact = compactLink(data.link)
  if (compact) {
    addLines(lines, '', `🔗 Link: ${compact}`)
  }

  return lines
}

function buildPaseoMessage(data: PaseoWhatsappPayload) {
  const lines: string[] = []
  addLines(lines, '🌴 *Reserva de Paseo - Nice Trip*')
  addLines(lines, data.paseo && `🚶 *Paseo:* ${data.paseo}`)
  addLines(lines, data.mes && `📅 *Mes:* ${data.mes}`)
  if (data.local) {
    addLines(lines, `📍 *Salida desde:* ${data.local}`)
  }
  if (data.horario) {
    addLines(lines, `⏰ *Horario:* ${data.horario}`)
  }
  if (data.punto_encuentro) {
    addLines(lines, `📌 *Punto de encuentro:* ${data.punto_encuentro}`)
  }

  if (Array.isArray(data.participantes) && data.participantes.length > 0) {
    addLines(lines, '', '👥 *Participantes:*')
    data.participantes.forEach((item) => {
      if (!item || item.quantidade <= 0) return
      const unit = typeof item.unit === 'number' ? fmt.money(item.unit, data.currency) : null
      const total = typeof item.total === 'number' ? fmt.money(item.total, data.currency) : null
      const parts = [`${item.quantidade} ${item.label}`]
      if (unit) parts.push(`x ${unit}`)
      if (total) parts.push(`= ${total}`)
      addLines(lines, `• ${parts.join(' ')}`)
    })
  } else {
    const partes: string[] = []
    if (data.adultos && data.adultos > 0) partes.push(`${data.adultos} adulto${data.adultos > 1 ? 's' : ''}`)
    if (data.ninos && data.ninos > 0) partes.push(`${data.ninos} niño${data.ninos > 1 ? 's' : ''}`)
    if (partes.length) addLines(lines, '', `👥 *Participantes:* ${partes.join(', ')}`)
  }

  if (typeof data.total === 'number') {
    addLines(lines, '', `💵 *Total estimado:* ${fmt.money(data.total, data.currency)}`)
  }

  if (Array.isArray(data.observaciones) && data.observaciones.length > 0) {
    addLines(lines, '', '🗒️ *Observaciones:*')
    data.observaciones.forEach((obs) => addLines(lines, `• ${obs}`))
  }

  const compact = compactLink(data.link)
  if (compact) {
    addLines(lines, '', `🔗 Link: ${compact}`)
  }

  return lines
}

export function buildWhatsappMessage(
  tipo: 'paquete' | 'habitacion' | 'paseo',
  data: PackageWhatsappPayload | HabitacionWhatsappPayload | PaseoWhatsappPayload
) {
  let lines: string[] = []

  if (tipo === 'paquete') {
    lines = buildPaqueteMessage(data as PackageWhatsappPayload)
  } else if (tipo === 'habitacion') {
    lines = buildHabitacionMessage(data as HabitacionWhatsappPayload)
  } else {
    lines = buildPaseoMessage(data as PaseoWhatsappPayload)
  }

  return encodeURIComponent(lines.join('\n'))
}

export function openWhatsapp(telefoneOperador: string, mensagemCodificada: string) {
  const DEFAULT_WHATSAPP_PHONE = '5548998601754'
  const provided = (telefoneOperador || '').replace(/\D/g, '')
  const configured = (process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '').replace(/\D/g, '')
  const targetNumber = provided || configured || DEFAULT_WHATSAPP_PHONE

  const urlNative = `whatsapp://send?phone=${targetNumber}&text=${mensagemCodificada}`
  const urlWeb = `https://api.whatsapp.com/send?phone=${targetNumber}&text=${mensagemCodificada}`

  if (typeof window !== 'undefined') {
    const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent)
    const finalUrl = isMobile ? urlNative : urlWeb
    window.open(finalUrl, '_blank')
    return finalUrl
  }
  return urlWeb
}

export function logWhatsappConversion(context: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  void fetch('/api/events/conversion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ context }),
    keepalive: true,
  }).catch(() => undefined)
}

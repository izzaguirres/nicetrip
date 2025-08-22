type Hab = { adultos: number; children0to3?: number; children4to5?: number; children6plus?: number };
type Trecho = { data?: string; origem_iata?: string; destino_iata?: string; saida?: string; chegada?: string };

const fmt = {
  money(n: number) { return `USD ${Number(n || 0).toLocaleString("es-AR")}`; },
  date(d?: string) {
    if (!d) return "";
    const [y, m, day] = d.split("-").map(Number);
    if (!y || !m || !day) return d;
    const dt = new Date(Date.UTC(y, m - 1, day));
    return dt.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
  }
};

function compactLink(input?: string, slug?: string) {
  if (slug) return `https://nicetrip.com/p/${slug}`; // ajuste domínio/rota
  if (input) {
    try {
      const u = new URL(input);
      return `${u.origin}${u.pathname}`;
    } catch {}
  }
  return "";
}

function blocoVoos(voos?: Trecho[], bagagem?: { carry: number; despachada: number }) {
  if (!voos || voos.length === 0) return "";
  const linhas: string[] = [];
  linhas.push("✈️ *Voos*");
  voos.forEach((v) => {
    if (v.saida && v.chegada && v.origem_iata && v.destino_iata) {
      const data = v.data ? `${fmt.date(v.data)} ` : "";
      linhas.push(`• ${data}${v.origem_iata}→${v.destino_iata} ${v.saida}–${v.chegada}`);
    }
  });
  if (bagagem) {
    linhas.push(`🎒 Equipaje: carry+item hasta ${bagagem.carry}kg | 1 maleta ${bagagem.despachada}kg (158 cm)`);
  }
  return linhas.join("\n");
}

export function buildWhatsappMessage(
  tipo: "paquete" | "habitacion" | "paseo",
  data: any
) {
  const lines: string[] = [];
  const add = (s = "") => { if (s !== undefined && s !== null) lines.push(s); };

  if (tipo === "paquete") {
    add("✅ *Nueva reserva - Nice Trip*");
    add(`📍 *Destino:* ${data.destino}`);
    add(`🏨 *Hospedaje:* ${data.hotel}`);
    add(`🚌✈️ *Transporte:* ${data.transporte} - *Embarque:* ${data.embarque}`);
    add(`📅 *Fechas:* ${fmt.date(data.fecha_salida)} → ${fmt.date(data.fecha_regreso)} (${data.noches} noches)`);
    add("");
    add("👥 *Habitaciones:*");
    (data.habitaciones as Hab[]).forEach((h: Hab, i: number) => {
      add(`• Habitación ${i + 1}: ${h.adultos} adultos, ${h.children0to3 ?? 0} niño(s) 0–3, ${h.children4to5 ?? 0} niño(s) 4–5, ${h.children6plus ?? 0} niño(s) 6+`);
    });
    add("");
    if (data.total != null) add(`💵 *Total estimado:* ${fmt.money(data.total)}`);
    const voosTxt = blocoVoos(data.voos, data.bagagem);
    if (voosTxt) { add(""); add(voosTxt); }
    // link removido a pedido do cliente
  }

  if (tipo === "habitacion") {
    add("🏨 *Reserva de Habitación - Nice Trip*");
    add(`📍 *Hospedaje:* ${data.hotel}`);
    add(`📅 *Check-in:* ${fmt.date(data.checkin)}`);
    add(`📅 *Check-out:* ${fmt.date(data.checkout)}`);
    add("");
    add("🛏️ *Habitaciones:*");
    (data.habitaciones as { adultos: number; niños: number }[]).forEach((h, i) => {
      add(`• Habitación ${i + 1}: ${h.adultos} adultos, ${h.niños} niños`);
    });
    add("");
    if (data.total != null) add(`💵 *Total:* ${fmt.money(data.total)}`);
    // link removido a pedido do cliente
  }

  if (tipo === "paseo") {
    add("🌴 *Reserva de Paseo - Nice Trip*");
    add(`🚶 *Paseo:* ${data.paseo}`);
    add(`📅 *Mes:* ${data.mes}`);
    add(`👥 *Personas:* ${data.adultos} adultos, ${data.ninos} niños`);
    add("");
    if (data.total != null) add(`💵 *Total:* ${fmt.money(data.total)}`);
    // link removido a pedido do cliente
  }

  return encodeURIComponent(lines.join("\n"));
}

export function openWhatsapp(telefoneOperador: string, mensagemCodificada: string) {
  const onlyDigits = (telefoneOperador || '').replace(/\D/g, '');
  const url = `https://wa.me/${onlyDigits}?text=${mensagemCodificada}`;
  if (typeof window !== "undefined") window.open(url, "_blank");
  return url;
}

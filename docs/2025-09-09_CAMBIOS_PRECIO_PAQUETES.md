# Cambios de hoy — Precios de Paquetes y UX (2025‑09‑09)

## Resumen Ejecutivo

Se unificó y corrigió la lógica de precios para Paquetes (Bus y Aéreo), se trasladó la aplicación de tasas del Aéreo al detalle, y se mejoró la comunicación en los cards y en el desglose por cuarto. Además, se ajustó el subtítulo del hero en la home.

## Reglas de Cálculo (estado final)

### Base por ocupación (común a Bus y Aéreo)
- La base de cálculo parte de los “adultos cobrados” (pagantes equivalentes):
  - Adultos (>= 6 años) siempre cuentan como adulto.
  - 1 niño 0–5 con tarifa reducida por cada 2 adultos.
  - Excedentes 0–5 se cobran como adulto.

### Paquetes – Bus/Bús
- 0–3: USD 50 (reducida)
- 4–5: USD 350 (reducida)
- 6+: tarifa de adulto (precio del hotel para adulto)
- No hay tasas adicionales.

### Paquetes – Aéreo
- 0–2: USD 160 (incluye impuestos) — exento de la tasa de 200.
- 2–5: USD 500 (base). La tasa de USD 200 se suma al final (detalle).
- 6+: tarifa de adulto (precio del hotel para adulto).
- Tasas e Impuestos (detalle):
  - +USD 200 por persona para Adultos (incluye 6+) y niños 2–5.
  - 0–2 exentos.

## Cambios de UI y Mensajería
- Cards de resultados (Paquetes):
  - “Precio por persona” = Total del paquete ÷ total de personas (adultos + niños).
  - Parcelas/financiación se calculan sobre el Total del paquete (no sobre el valor por persona).
  - Se agrega una nota en el desglose cuando un niño es cobrado como adulto (excedente de 0–5).
- Detalle (Paquetes):
  - El “Total antes de impuestos” suma únicamente la base.
  - “Tasas e Impuestos”: muestra USD 200 por persona y la cuenta exacta de personas gravadas (Adultos y 2–5).
  - “Valor Total” = base + tasas (+ adicionales, si aplican).
- Home (Hero):
  - Subtítulo actualizado a “Busca como queres viajar y empeza a planear”.

## Archivos Afectados Principales
- `lib/package-pricing.ts` — Nueva función `computePackageBaseTotal(...)` con las reglas unificadas y breakdown detallado (adultos cobrados, niños reducidos, excedentes tratados como adulto).
- `app/resultados/page.tsx` —
  - Cards usan la función nueva para calcular el total por cuarto/hotel.
  - Per‑persona y parcelas ajustados.
  - Popover de Aéreo actualizado (0–2=160, 2–5=500 base, +200 en detalle).
  - Nota en el desglose cuando un niño es cobrado como adulto.
- `app/detalhes/page.tsx` —
  - Recompone precio por cuarto con la función nueva.
  - Suma tasas del Aéreo al final, con conteo de personas gravadas (Adultos y 2–5).
  - Muestra mensaje explicativo de tasas.
- `app/page.tsx` — Texto del hero actualizado.

## Ejemplos Verificados
1) Bus — 2 Adultos + 2 Niños (0–3, 0–3)
   - Adultos cobrados: 3; Niños 0–3 reducida: 1 → Total = 3×adulto + 50.

2) Aéreo — 3 Adultos + 1 Niño (0–2)
   - Base = 3×adulto + 160; Tasas = 3×200; Total = base + 600.

3) Aéreo — 2 Adultos + 1 Niño (2–5) + 1 Niño (0–2)
   - Base = 3×adulto + 500 + 160; Tasas = 3×200; Total = base + 600.

## Consideraciones Técnicas
- La función central devuelve breakdown:
  - `adultosCobrados`, `criancas0a3ComTarifaReduzida`, `criancas4a5ComTarifaReduzida`, `excedentes0a3ComoAdulto`, `excedentes4a5ComoAdulto`.
- En Aéreo, la tasa se calcula directamente desde la ocupación por cuarto (adultos + 6+ + 2–5), ignorando excedentes 0–2.
- Cards y Detalle comparten exactamente la misma lógica de cálculo para evitar divergencias.

## Checklist de QA
- [ ] Bus: 2A + 2×(0–3) → Triple + 1 niño (0–3) reducida; total = 3×adulto + 50.
- [ ] Aéreo: 3A + 1×(0–2) → base = 3×adulto + 160; tasas = 3×200; total = base + 600.
- [ ] Aéreo: 2A + 1×(2–5) + 1×(0–2) → base = 3×adulto + 500 + 160; tasas = 3×200; total = base + 600.
- [ ] Cards: per‑persona = total ÷ personas; parcelas sobre el total.
- [ ] Detalle: muestra cuenta de personas gravadas (Adultos y 2–5).

## Notas de Deploy
- Sin migraciones de DB: se consumen las columnas existentes (`preco_adulto`, y si hubiere `preco_adulto_aereo`), con reglas de negocio en código.
- No se añadieron dependencias nuevas.


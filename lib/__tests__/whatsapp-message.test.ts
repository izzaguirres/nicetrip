import { describe, it, expect } from 'vitest'

import { buildWhatsappMessage } from '../whatsapp'

describe('buildWhatsappMessage', () => {
  it('monta mensagem detalhada de pacote com quartos e valores', () => {
    const encoded = buildWhatsappMessage('paquete', {
      destino: 'Canasvieiras',
      hotel: 'Hotel Fênix',
      transporte: 'Bus',
      embarque: 'Córdoba',
      fecha_salida: '2025-10-19',
      fecha_regreso: '2025-10-26',
      noches: 7,
      habitaciones: [
        { label: 'Habitación 1', adultos: 2, children0to3: 1 },
        { label: 'Habitación 2', adultos: 2, children4to5: 1 },
      ],
      total: 2150,
      currency: 'USD',
      installments: { count: 6, value: 358.33, currency: 'USD' },
    })

    const message = decodeURIComponent(encoded)
    expect(message).toContain('Canasvieiras')
    expect(message).toContain('Habitación 1')
    expect(message).toContain('2 adultos')
    expect(message).toContain('1 niño (0-3)')
    expect(message).toContain('USD 2.150')
    expect(message).toContain('hasta 6x de USD 358')
  })

  it('monta mensagem de hospedagem com moeda BRL e noites', () => {
    const encoded = buildWhatsappMessage('habitacion', {
      destino: 'Bombinhas',
      hotel: 'Pousada Sol e Mar',
      checkin: '2025-01-10',
      checkout: '2025-01-15',
      noches: 5,
      habitaciones: [{ label: 'Suite Familiar', adultos: 2, children4to5: 2 }],
      total: 4860,
      currency: 'BRL',
    })

    const message = decodeURIComponent(encoded)
    expect(message).toContain('Bombinhas')
    expect(message).toContain('Pousada Sol e Mar')
    expect(message).toContain('*Noches:* 5')
    expect(message).toContain('R$ 4.860')
  })

  it('monta mensagem de passeio com participantes e total', () => {
    const encoded = buildWhatsappMessage('paseo', {
      paseo: 'Passeo en Barco',
      mes: 'Enero de 2026',
      participantes: [
        { label: 'Adultos', quantidade: 2, unit: 80, total: 160 },
        { label: 'Niños (4-5)', quantidade: 1, unit: 40, total: 40 },
      ],
      total: 200,
      currency: 'USD',
      local: 'Canasvieiras',
      horario: '09:00',
    })

    const message = decodeURIComponent(encoded)
    expect(message).toContain('Passeo en Barco')
    expect(message).toContain('Enero de 2026')
    expect(message).toContain('• 2 Adultos x USD 80 = USD 160')
    expect(message).toContain('• 1 Niños (4-5) x USD 40 = USD 40')
    expect(message).toContain('USD 200')
  })
})

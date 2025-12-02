import { describe, it, expect } from 'vitest'
import { parseDisponibilidadeCsv } from '../admin-disponibilidades'

describe('parseDisponibilidadeCsv', () => {
  it('converte linhas em entradas normalizadas', () => {
    const csv = `destino,data_saida,transporte,hotel,capacidade,preco_adulto\nCanasvieiras,2025-10-19,Bus,Residencial Terrazas,4,490`
    const result = parseDisponibilidadeCsv(csv)
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      destino: 'Canasvieiras',
      data_saida: '2025-10-19',
      transporte: 'Bus',
      hotel: 'Residencial Terrazas',
      capacidade: 4,
      preco_adulto: 490,
    })
  })

  it('aceita ponto e vírgula como delimitador e converte números com vírgula', () => {
    const csv = `destino;data_saida;transporte;hotel;preco_adulto\nFlorianópolis;2025-11-02;Aéreo;Hotel Fênix;1.200,50`
    const result = parseDisponibilidadeCsv(csv)
    expect(result[0].preco_adulto).toBe(1200.5)
  })

  it('lança erro quando falta coluna obrigatória', () => {
    const csv = `destino,data_saida,hotel\nCanasvieiras,2025-10-19,Residencial`
    expect(() => parseDisponibilidadeCsv(csv)).toThrow(/transporte/)
  })
})


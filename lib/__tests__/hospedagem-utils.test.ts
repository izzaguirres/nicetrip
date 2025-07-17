/**
 * Testes unitários para hospedagem-utils.ts
 */

import {
  calcularPagantesHospedagem,
  validarConfiguracaoHospedagem,
  quartoAtendeRequisitos,
  calcularPrecoHospedagem,
  formatarExplicacaoPagantes,
  type HospedagemCalculation
} from '../hospedagem-utils';

describe('calcularPagantesHospedagem', () => {
  test('2 adultos + 1 criança 0-5 = Quarto Doble (2 pagantes)', () => {
    const result = calcularPagantesHospedagem(2, 1, 0, 0);
    
    expect(result.totalPagantes).toBe(2);
    expect(result.totalPessoas).toBe(3);
    expect(result.tipoQuartoRequerido).toBe('Doble');
    expect(result.criancasGratuitas).toBe(1);
    expect(result.excedente_0_5).toBe(0);
  });

  test('2 adultos + 2 crianças 0-5 = Quarto Triple (3 pagantes)', () => {
    const result = calcularPagantesHospedagem(2, 2, 0, 0);
    
    expect(result.totalPagantes).toBe(3);
    expect(result.totalPessoas).toBe(4);
    expect(result.tipoQuartoRequerido).toBe('Triple');
    expect(result.criancasGratuitas).toBe(1);
    expect(result.excedente_0_5).toBe(1);
  });

  test('2 adultos + 1 criança 6+ = Quarto Triple (3 pagantes)', () => {
    const result = calcularPagantesHospedagem(2, 0, 0, 1);
    
    expect(result.totalPagantes).toBe(3);
    expect(result.totalPessoas).toBe(3);
    expect(result.tipoQuartoRequerido).toBe('Triple');
    expect(result.criancasGratuitas).toBe(0);
    expect(result.excedente_0_5).toBe(0);
  });

  test('4 adultos + 2 crianças 0-5 = Quarto Quadruple (4 pagantes)', () => {
    const result = calcularPagantesHospedagem(4, 1, 1, 0);
    
    expect(result.totalPagantes).toBe(4);
    expect(result.totalPessoas).toBe(6);
    expect(result.tipoQuartoRequerido).toBe('Quadruple');
    expect(result.criancasGratuitas).toBe(2); // 4 adultos = 2 crianças grátis
    expect(result.excedente_0_5).toBe(0);
  });

  test('1 adulto + 1 criança 0-5 = Quarto Single (1 pagante)', () => {
    const result = calcularPagantesHospedagem(1, 1, 0, 0);
    
    expect(result.totalPagantes).toBe(1);
    expect(result.totalPessoas).toBe(2);
    expect(result.tipoQuartoRequerido).toBe('Single');
    expect(result.criancasGratuitas).toBe(0); // 1 adulto = 0 crianças grátis
    expect(result.excedente_0_5).toBe(1);
  });

  test('Cenário complexo: 3 adultos + 1 criança 0-3 + 1 criança 4-5 + 1 criança 6+', () => {
    const result = calcularPagantesHospedagem(3, 1, 1, 1);
    
    expect(result.totalPagantes).toBe(5); // 3 adultos + 1 criança 6+ + 1 excedente 0-5
    expect(result.totalPessoas).toBe(6);
    expect(result.tipoQuartoRequerido).toBe('Quintuple');
    expect(result.criancasGratuitas).toBe(1); // 3 adultos = 1 criança grátis
    expect(result.excedente_0_5).toBe(1); // 2 crianças 0-5 - 1 grátis = 1 paga
  });

  test('Deve lançar erro para valores inválidos', () => {
    expect(() => calcularPagantesHospedagem(-1, 0, 0, 0)).toThrow();
    expect(() => calcularPagantesHospedagem(1.5, 0, 0, 0)).toThrow();
  });
});

describe('validarConfiguracaoHospedagem', () => {
  test('Configuração válida deve passar', () => {
    const calculation = calcularPagantesHospedagem(2, 1, 0, 0);
    const validation = validarConfiguracaoHospedagem(calculation);
    
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  test('Deve detectar erro: sem pessoas', () => {
    const calculation = calcularPagantesHospedagem(0, 0, 0, 0);
    const validation = validarConfiguracaoHospedagem(calculation);
    
    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain('Deve haver pelo menos 1 pessoa');
  });

  test('Deve detectar erro: sem adultos', () => {
    const calculation = calcularPagantesHospedagem(0, 1, 0, 0);
    const validation = validarConfiguracaoHospedagem(calculation);
    
    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain('Deve haver pelo menos 1 adulto');
  });

  test('Deve detectar aviso: crianças pagas', () => {
    const calculation = calcularPagantesHospedagem(2, 2, 0, 0);
    const validation = validarConfiguracaoHospedagem(calculation);
    
    expect(validation.valid).toBe(true);
    expect(validation.warnings).toContain('1 criança(s) de 0-5 anos será(ão) cobrada(s)');
  });
});

describe('quartoAtendeRequisitos', () => {
  test('Quarto adequado deve atender requisitos', () => {
    const calculation = calcularPagantesHospedagem(2, 1, 0, 0);
    const quarto = { tipo_quarto: 'Doble', capacidade: 4 };
    
    expect(quartoAtendeRequisitos(quarto, calculation)).toBe(true);
  });

  test('Quarto com capacidade insuficiente não deve atender', () => {
    const calculation = calcularPagantesHospedagem(2, 1, 0, 0);
    const quarto = { tipo_quarto: 'Doble', capacidade: 2 }; // Só 2 pessoas, mas são 3
    
    expect(quartoAtendeRequisitos(quarto, calculation)).toBe(false);
  });

  test('Quarto com tipo inadequado não deve atender', () => {
    const calculation = calcularPagantesHospedagem(2, 1, 0, 0);
    const quarto = { tipo_quarto: 'Single', capacidade: 4 }; // Tipo errado
    
    expect(quartoAtendeRequisitos(quarto, calculation)).toBe(false);
  });
});

describe('calcularPrecoHospedagem', () => {
  test('Deve calcular preço baseado em pagantes', () => {
    const calculation = calcularPagantesHospedagem(2, 1, 0, 0); // 2 pagantes
    const resultado = calcularPrecoHospedagem(100, 3, calculation);
    
    expect(resultado.precoPorNoite).toBe(200); // 100 * 2 pagantes
    expect(resultado.precoTotal).toBe(600); // 200 * 3 noites
    expect(resultado.breakdown.adultos).toBe(2);
    expect(resultado.breakdown.criancas_gratuitas).toBe(1);
  });
});

describe('formatarExplicacaoPagantes', () => {
  test('Deve formatar explicação corretamente', () => {
    const calculation = calcularPagantesHospedagem(2, 1, 0, 0);
    const explicacao = formatarExplicacaoPagantes(calculation);
    
    expect(explicacao).toBe('2 pagantes (2 adultos) + 1 niño gratis');
  });

  test('Deve formatar cenário com crianças pagas', () => {
    const calculation = calcularPagantesHospedagem(2, 2, 0, 0);
    const explicacao = formatarExplicacaoPagantes(calculation);
    
    expect(explicacao).toBe('3 pagantes (2 adultos + 1 niño (0-5 años)) + 1 niño gratis');
  });

  test('Deve formatar cenário com criança 6+', () => {
    const calculation = calcularPagantesHospedagem(2, 0, 0, 1);
    const explicacao = formatarExplicacaoPagantes(calculation);
    
    expect(explicacao).toBe('3 pagantes (2 adultos + 1 niño (6+ años))');
  });
});
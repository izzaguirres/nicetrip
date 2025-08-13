/**
 * Utilitários para cálculos de hospedagem
 * Implementa a lógica de pagantes com política de gratuidade para crianças
 */

// Tipos TypeScript para cálculos de hospedagem
export interface HospedagemCalculation {
  adultos: number;
  criancas_0_3: number;
  criancas_4_5: number;
  criancas_6_mais: number;
  totalPessoas: number;        // Total físico de pessoas no quarto
  totalPagantes: number;       // Pessoas que efetivamente pagam
  tipoQuartoRequerido: string; // Tipo de quarto baseado em pagantes
  criancasGratuitas: number;   // Quantas crianças 0-5 são gratuitas
  excedente_0_5: number;       // Crianças 0-5 que excedem o limite gratuito
}

export interface HospedagemValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Calcula pagantes para hospedagem baseado na política de gratuidade
 * 
 * Política:
 * - 1 criança de 0-5 anos é gratuita a cada 2 adultos
 * - Crianças 6+ contam como adultos
 * - Excedentes de crianças 0-5 contam como pagantes
 * 
 * @param adultos Número de adultos
 * @param criancas_0_3 Crianças de 0 a 3 anos
 * @param criancas_4_5 Crianças de 4 a 5 anos  
 * @param criancas_6_mais Crianças de 6 anos ou mais
 * @returns Cálculo completo de pagantes e tipo de quarto
 */
export function calcularPagantesHospedagem(
  adultos: number,
  criancas_0_3: number,
  criancas_4_5: number,
  criancas_6_mais: number
): HospedagemCalculation {
  // Validar inputs
  const inputs = [adultos, criancas_0_3, criancas_4_5, criancas_6_mais];
  if (inputs.some(val => val < 0 || !Number.isInteger(val))) {
    throw new Error('Todos os valores devem ser números inteiros não negativos');
  }

  // Calcular totais básicos
  const criancas_0_5 = criancas_0_3 + criancas_4_5;
  const totalPessoas = adultos + criancas_0_5 + criancas_6_mais;

  // Aplicar política de gratuidade
  // 1 criança 0-5 gratuita a cada 2 adultos
  const criancasGratuitasPermitidas = Math.floor(adultos / 2);
  const criancasGratuitas = Math.min(criancas_0_5, criancasGratuitasPermitidas);
  const excedente_0_5 = Math.max(0, criancas_0_5 - criancasGratuitasPermitidas);

  // Calcular total de pagantes
  const totalPagantes = adultos + criancas_6_mais + excedente_0_5;

  // Determinar tipo de quarto baseado em pagantes
  const tipoQuartoRequerido = determinarTipoQuarto(totalPagantes);

  return {
    adultos,
    criancas_0_3,
    criancas_4_5,
    criancas_6_mais,
    totalPessoas,
    totalPagantes,
    tipoQuartoRequerido,
    criancasGratuitas,
    excedente_0_5
  };
}

/**
 * Determina o tipo de quarto baseado no número de pagantes
 */
function determinarTipoQuarto(pagantes: number): string {
  const mapeamento: { [key: number]: string } = {
    1: "Single",
    2: "Doble", 
    3: "Triple",
    4: "Cuadruple", // Correção de digitação
    5: "Quintuple",
    6: "Sextuple"
  };

  return mapeamento[pagantes] || "Familiar"; // Alterado para "Familiar"
}

/**
 * Verifica se um tipo de quarto é compatível com outro (flexível)
 * Agora verifica se o nome disponível CONTÉM o nome requerido.
 */
export function tiposQuartoCompativeis(tipoRequerido: string, tipoDisponivel: string): boolean {
  // Normalizar nomes para verificação (minúsculas, sem acentos/espaços)
  const normalizar = (tipo: string) => 
    (tipo || '').toLowerCase()
        .replace(/á|à|ã|â/g, 'a')
        .replace(/é|ê/g, 'e')
        .replace(/í/g, 'i')
        .replace(/ó|ô|õ/g, 'o')
        .replace(/ú|ü/g, 'u')
        .replace(/\s+/g, '') // remove espaços
        .replace(/[^a-z0-9]/g, ''); // remove caracteres especiais

  const requerido = normalizar(tipoRequerido);
  const disponivel = normalizar(tipoDisponivel);

  // Mapeamento de equivalências (mantém a robustez)
  const equivalencias: { [key: string]: string[] } = {
    'single': ['single', 'individual', 'simples', 'solteiro'],
    'doble': ['doble', 'double', 'duplo', 'casal'],
    'triple': ['triple', 'triplo'],
    'cuadruple': ['cuadruple', 'quadruplo'],
    'quintuple': ['quintuple', 'quintuplo'],
    'sextuple': ['sextuple', 'sextuplo'],
    'familiar': ['familiar', 'familia', 'suite']
  };

  // Encontrar a base para o tipo requerido
  let baseRequerida = requerido;
  for (const [base, sinonimos] of Object.entries(equivalencias)) {
    if (sinonimos.includes(requerido)) {
      baseRequerida = base;
      break;
    }
  }

  // Verificar se o nome do quarto disponível contém a base requerida ou um de seus sinônimos
  const sinonimosRequeridos = equivalencias[baseRequerida] || [baseRequerida];
  for (const sinonimo of sinonimosRequeridos) {
    if (disponivel.includes(sinonimo)) {
      return true;
    }
  }

  return false;
}

/**
 * Valida uma configuração de hospedagem
 */
export function validarConfiguracaoHospedagem(
  calculation: HospedagemCalculation
): HospedagemValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validações críticas (impedem reserva)
  if (calculation.totalPessoas === 0) {
    errors.push("Deve haver pelo menos 1 pessoa");
  }

  if (calculation.totalPagantes === 0) {
    errors.push("Deve haver pelo menos 1 pagante");
  }

  if (calculation.totalPessoas > 6) {
    errors.push("Máximo 6 pessoas por quarto");
  }

  if (calculation.adultos === 0) {
    errors.push("Deve haver pelo menos 1 adulto");
  }

  // Avisos (não impedem, mas alertam)
  if (calculation.excedente_0_5 > 0) {
    warnings.push(`${calculation.excedente_0_5} criança(s) de 0-5 anos será(ão) cobrada(s)`);
  }

  if (calculation.criancasGratuitas > 0) {
    warnings.push(`${calculation.criancasGratuitas} criança(s) de 0-5 anos gratuita(s)`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Verifica se um quarto atende aos requisitos de uma configuração
 */
export function quartoAtendeRequisitos(
  quarto: { tipo_quarto: string; capacidade: number },
  calculation: HospedagemCalculation
): boolean {
  // Lógica de "tolerância" baseada na sugestão do usuário.
  // Se houver crianças de 0-5 anos, permitimos que a capacidade total
  // seja excedida em 1, para acomodar a criança gratuita.

  const criancas_0_5 = calculation.criancas_0_3 + calculation.criancas_4_5;

  // 1. A capacidade do quarto com a tolerância aplicada.
  const toleranciaExtra = criancas_0_5 > 0 ? 1 : 0;
  const capacidadePermitida = quarto.capacidade + toleranciaExtra;

  // 2. O número total de pessoas (físico) deve caber na capacidade com tolerância.
  const atendeCapacidadeFisica = calculation.totalPessoas <= capacidadePermitida;

  // 3. O número de pagantes deve ser EXATAMENTE IGUAL à capacidade *padrão* do quarto.
  //    Isso garante que para 3 pagantes, o sistema busque um quarto com capacidade 3 (Triple).
  const atendeCapacidadePagantes = calculation.totalPagantes === quarto.capacidade;

  // Debugging para o console do servidor
  console.log(
    `[DEBUG] Quarto: ${quarto.tipo_quarto} (Cap: ${quarto.capacidade}) | ` +
    `Busca: ${calculation.totalPessoas} pessoas (${calculation.totalPagantes} pagantes) | ` +
    `Tolerância: ${toleranciaExtra} | ` +
    `Pagantes OK: ${atendeCapacidadePagantes} | Pessoas OK: ${atendeCapacidadeFisica}`
  );

  // Ambas as condições precisam ser verdadeiras para o quarto ser válido.
  return atendeCapacidadePagantes && atendeCapacidadeFisica;
}

/**
 * Calcula preço total para hospedagem baseado em pagantes
 */
export function calcularPrecoHospedagem(
  valorDiaria: number,
  noites: number,
  calculation: HospedagemCalculation
): {
  precoTotal: number;
  precoPorNoite: number;
  breakdown: {
    adultos: number;
    criancas_6_mais: number;
    criancas_0_5_pagas: number;
    criancas_gratuitas: number;
  };
} {
  // CORREÇÃO: O preço do quarto é por diária, não por pessoa.
  const precoPorNoite = valorDiaria;
  const precoTotal = precoPorNoite * noites;

  return {
    precoTotal,
    precoPorNoite,
    breakdown: {
      adultos: calculation.adultos,
      criancas_6_mais: calculation.criancas_6_mais,
      criancas_0_5_pagas: calculation.excedente_0_5,
      criancas_gratuitas: calculation.criancasGratuitas
    }
  };
}

/**
 * Formata texto explicativo sobre a política de pagantes
 */
export function formatarExplicacaoPagantes(calculation: HospedagemCalculation): string {
  const partes: string[] = [];

  if (calculation.adultos > 0) {
    partes.push(`${calculation.adultos} adulto${calculation.adultos > 1 ? 's' : ''}`);
  }

  if (calculation.criancas_6_mais > 0) {
    partes.push(`${calculation.criancas_6_mais} niño${calculation.criancas_6_mais > 1 ? 's' : ''} (6+ años)`);
  }

  if (calculation.excedente_0_5 > 0) {
    partes.push(`${calculation.excedente_0_5} niño${calculation.excedente_0_5 > 1 ? 's' : ''} (0-5 años)`);
  }

  let texto = `${calculation.totalPagantes} pagante${calculation.totalPagantes > 1 ? 's' : ''}`;
  
  if (partes.length > 0) {
    texto += ` (${partes.join(' + ')})`;
  }

  if (calculation.criancasGratuitas > 0) {
    // Deixar explícito a faixa etária do(s) gratuito(s)
    const faixaGratis = calculation.criancas_0_3 > 0 ? '0–3 años' : '0–5 años';
    texto += ` + ${calculation.criancasGratuitas} niño${calculation.criancasGratuitas > 1 ? 's' : ''} (${faixaGratis}) gratis`;
  }

  return texto;
}
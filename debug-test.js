// Teste rápido da lógica
console.log('🧪 Testando cenários de crianças...\n');

// Simular a lógica que implementamos
function calcularPagantesTest(adultos, criancas_0_3, criancas_4_5, criancas_6_mais) {
  const criancas_0_5 = criancas_0_3 + criancas_4_5;
  const criancasGratuitasPermitidas = Math.floor(adultos / 2);
  const criancasGratuitas = Math.min(criancas_0_5, criancasGratuitasPermitidas);
  const excedente_0_5 = Math.max(0, criancas_0_5 - criancasGratuitasPermitidas);
  const totalPagantes = adultos + criancas_6_mais + excedente_0_5;
  const totalPessoas = adultos + criancas_0_5 + criancas_6_mais;
  
  const tipoQuarto = {
    1: "Single",
    2: "Doble", 
    3: "Triple",
    4: "Quadruple",
    5: "Quintuple",
    6: "Sextuple"
  }[totalPagantes] || "Suite Familiar";
  
  return {
    totalPessoas,
    totalPagantes,
    tipoQuarto,
    criancasGratuitas,
    excedente_0_5
  };
}

// Teste: 2 adultos + 1 criança 0-3
console.log('Teste 1: 2 adultos + 1 criança 0-3');
const result1 = calcularPagantesTest(2, 1, 0, 0);
console.log('Resultado:', result1);
console.log('Deveria buscar quartos:', result1.tipoQuarto, '\n');

// Teste: 2 adultos + 2 crianças 0-3  
console.log('Teste 2: 2 adultos + 2 crianças 0-3');
const result2 = calcularPagantesTest(2, 2, 0, 0);
console.log('Resultado:', result2);
console.log('Deveria buscar quartos:', result2.tipoQuarto, '\n');

// Teste: 2 adultos + 1 criança 4-5
console.log('Teste 3: 2 adultos + 1 criança 4-5');
const result3 = calcularPagantesTest(2, 0, 1, 0);
console.log('Resultado:', result3);
console.log('Deveria buscar quartos:', result3.tipoQuarto, '\n');
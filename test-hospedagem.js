// Teste manual da lógica de hospedagem
const { calcularPagantesHospedagem, validarConfiguracaoHospedagem } = require('./lib/hospedagem-utils.ts');

console.log('🧪 Testando lógica de pagantes para hospedagem...\n');

// Teste 1: 2 adultos + 1 criança 0-5 = Quarto Doble
console.log('Teste 1: 2 adultos + 1 criança 0-5');
try {
  const result1 = calcularPagantesHospedagem(2, 1, 0, 0);
  console.log('✅ Resultado:', result1);
  console.log(`   Pagantes: ${result1.totalPagantes} (esperado: 2)`);
  console.log(`   Tipo: ${result1.tipoQuartoRequerido} (esperado: Doble)`);
  console.log(`   Crianças grátis: ${result1.criancasGratuitas} (esperado: 1)\n`);
} catch (error) {
  console.log('❌ Erro:', error.message);
}

// Teste 2: 2 adultos + 2 crianças 0-5 = Quarto Triple  
console.log('Teste 2: 2 adultos + 2 crianças 0-5');
try {
  const result2 = calcularPagantesHospedagem(2, 2, 0, 0);
  console.log('✅ Resultado:', result2);
  console.log(`   Pagantes: ${result2.totalPagantes} (esperado: 3)`);
  console.log(`   Tipo: ${result2.tipoQuartoRequerido} (esperado: Triple)`);
  console.log(`   Crianças grátis: ${result2.criancasGratuitas} (esperado: 1)`);
  console.log(`   Excedente: ${result2.excedente_0_5} (esperado: 1)\n`);
} catch (error) {
  console.log('❌ Erro:', error.message);
}

// Teste 3: 2 adultos + 1 criança 6+ = Quarto Triple
console.log('Teste 3: 2 adultos + 1 criança 6+');
try {
  const result3 = calcularPagantesHospedagem(2, 0, 0, 1);
  console.log('✅ Resultado:', result3);
  console.log(`   Pagantes: ${result3.totalPagantes} (esperado: 3)`);
  console.log(`   Tipo: ${result3.tipoQuartoRequerido} (esperado: Triple)`);
  console.log(`   Crianças grátis: ${result3.criancasGratuitas} (esperado: 0)\n`);
} catch (error) {
  console.log('❌ Erro:', error.message);
}
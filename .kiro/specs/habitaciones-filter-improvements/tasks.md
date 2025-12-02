# Implementation Plan - Melhorias do Filtro de Habitaciones

## Tarefas de Implementação

- [x] 1. Criar funções utilitárias para cálculo de pagantes
  - Implementar função `calcularPagantesHospedagem` com lógica de gratuidade
  - Criar função `validarConfiguracao` para validações
  - Adicionar tipos TypeScript para `HospedagemCalculation` e `HospedagemResult`
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 2. Implementar lógica de cálculo de pagantes
  - Codificar fórmula: `excedente_0_5 = Math.max(0, criancas_0_5 - Math.floor(adultos / 2))`
  - Implementar cálculo: `totalPagantes = adultos + criancas_6_mais + excedente_0_5`
  - Criar mapeamento de tipos de quarto baseado em pagantes
  - Adicionar validação de capacidade física vs pagantes
  - _Requirements: 3.1, 3.2, 3.3, 3.5, 3.6, 3.7_

- [x] 3. Atualizar filtro de resultados na página de resultados
  - Modificar função `filtrarResultados` para usar lógica de pagantes em hospedagens
  - Integrar `calcularPagantesHospedagem` no processamento de quartos
  - Implementar filtro por tipo de quarto baseado em pagantes, não em pessoas totais
  - Manter verificação de capacidade física para todas as pessoas
  - _Requirements: 3.5, 3.6, 3.7, 4.3_

- [x] 4. Ajustar cálculo de preços para hospedagens
  - Modificar cálculo de preço para usar número de pagantes
  - Atualizar exibição de preço total baseado em diárias × pagantes
  - Implementar lógica diferenciada entre pacotes (por pessoa) e hospedagens (por pagantes)
  - Adicionar breakdown de preço mostrando crianças gratuitas
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 5. Implementar validações e tratamento de erros
  - Adicionar validação de máximo 6 pessoas por quarto
  - Implementar verificação de pelo menos 1 pagante
  - Criar mensagens de erro específicas para configurações inválidas
  - Adicionar fallback graceful quando não há quartos disponíveis
  - _Requirements: 2.4, 3.7_

- [x] 6. Criar testes unitários para lógica de pagantes
  - Testar cenário: 2 adultos + 1 criança 0-5 = Quarto Doble
  - Testar cenário: 2 adultos + 2 crianças 0-5 = Quarto Triple
  - Testar cenário: 2 adultos + 1 criança 6+ = Quarto Triple
  - Testar cenário: múltiplas idades e configurações complexas
  - Testar validações e casos de erro
  - _Requirements: 3.1, 3.2, 3.5, 3.6_

- [x] 7. Atualizar interface de exibição de resultados
  - Modificar cards de resultado para mostrar informações de pagantes vs pessoas totais
  - Adicionar indicador visual de crianças gratuitas
  - Atualizar texto explicativo sobre política de gratuidade
  - Manter consistência visual com filtro de pacotes
  - _Requirements: 2.1, 2.2, 5.1, 5.2, 5.4_

- [x] 8. Integrar com sistema de comodidades e imagens
  - Garantir que comodidades reais sejam exibidas para hospedagens
  - Manter integração com galeria de imagens dos hotéis
  - Preservar cache de dados de hospedagens
  - Adicionar informações específicas de habitaciones (check-in/out, políticas)
  - _Requirements: 2.3, 2.4, 5.3_

- [x] 9. Otimizar performance e adicionar logs
  - Implementar memoização para cálculos de pagantes
  - Adicionar logs detalhados para debug da lógica
  - Otimizar queries ao Supabase quando possível
  - Implementar cache inteligente para resultados de hospedagem
  - _Requirements: 1.1, 1.2_

- [x] 10. Testes de integração e validação final
  - Testar fluxo completo: filtro → cálculo → resultados → detalhes
  - Validar com dados reais do Supabase
  - Testar responsividade e UX em diferentes dispositivos
  - Verificar consistência entre abas Paquetes e Habitaciones
  - Realizar testes de regressão para garantir que pacotes continuam funcionando
  - _Requirements: 1.3, 5.1, 5.2, 5.3_
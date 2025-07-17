# Design Document - Melhorias do Filtro de Habitaciones

## Overview

Este documento detalha o design para implementar a lógica correta de pagantes no filtro de Habitaciones, considerando a política de gratuidade para crianças de 0-5 anos e garantindo que os resultados mostrem apenas quartos adequados à configuração selecionada pelo usuário.

## Architecture

### Fluxo de Dados Atual vs Novo

**Atual:**
```
Filtro → Supabase → Resultados (sem lógica de pagantes)
```

**Novo:**
```
Filtro → Cálculo de Pagantes → Supabase (filtrado por tipo) → Resultados
```

### Componentes Afetados

1. **HabitacionesSearchFilter** - Mantém funcionalidade atual
2. **ResultadosPage** - Nova lógica de filtro e cálculo
3. **fetchHabitacionesData** - Possível filtro adicional por tipo de quarto
4. **Funções utilitárias** - Novas funções de cálculo

## Components and Interfaces

### 1. Função de Cálculo de Pagantes

```typescript
interface PagantesCalculation {
  totalPessoas: number;      // Total físico de pessoas
  totalPagantes: number;     // Pessoas que pagam
  tipoQuartoRequerido: string; // Single, Doble, Triple, etc.
  criancasGratuitas: number; // Quantas crianças são gratuitas
}

function calcularPagantesHospedagem(
  adultos: number,
  criancas_0_3: number,
  criancas_4_5: number,
  criancas_6_mais: number
): PagantesCalculation
```

### 2. Lógica de Cálculo

```typescript
// Fórmula principal
const criancas_0_5 = criancas_0_3 + criancas_4_5;
const excedente_0_5 = Math.max(0, criancas_0_5 - Math.floor(adultos / 2));
const totalPagantes = adultos + criancas_6_mais + excedente_0_5;
const totalPessoas = adultos + criancas_0_5 + criancas_6_mais;

// Mapeamento de tipo de quarto
const tipoQuarto = {
  1: "Single",
  2: "Doble", 
  3: "Triple",
  4: "Quadruple",
  5: "Quintuple",
  6: "Sextuple"
}[totalPagantes] || "Suite Familiar";
```

### 3. Filtro de Resultados Atualizado

```typescript
function filtrarResultadosHospedagem(
  items: any[], 
  quartos: Room[]
): any[] {
  return items.filter(item => {
    const calculoPagantes = calcularPagantesHospedagem(
      quartos.reduce((sum, q) => sum + q.adults, 0),
      quartos.reduce((sum, q) => sum + q.children_0_3, 0),
      quartos.reduce((sum, q) => sum + q.children_4_5, 0),
      quartos.reduce((sum, q) => sum + q.children_6, 0)
    );
    
    // Verificar capacidade física
    if (item.capacidade < calculoPagantes.totalPessoas) {
      return false;
    }
    
    // Verificar tipo de quarto baseado em pagantes
    return item.tipo_quarto === calculoPagantes.tipoQuartoRequerido;
  });
}
```

## Data Models

### Estrutura de Dados Existente

```sql
-- Tabela hospedagem_diarias
{
  id: uuid,
  slug_hospedagem: text,
  tipo_quarto: text, -- "Single", "Doble", "Triple", etc.
  capacidade: integer, -- Capacidade física máxima
  valor_diaria: numeric,
  data: date,
  ativo: boolean
}
```

### Novos Tipos TypeScript

```typescript
interface HospedagemCalculation {
  adultos: number;
  criancas_0_3: number;
  criancas_4_5: number;
  criancas_6_mais: number;
  totalPessoas: number;
  totalPagantes: number;
  tipoQuartoRequerido: string;
  criancasGratuitas: number;
}

interface HospedagemResult {
  ...existing_fields,
  calculoPagantes: HospedagemCalculation;
  precoTotal: number; // Baseado em pagantes
  noites: number;
}
```

## Error Handling

### Validações Necessárias

1. **Capacidade Física**: Verificar se o quarto comporta todas as pessoas
2. **Tipo de Quarto Disponível**: Verificar se existe quarto para o número de pagantes
3. **Dados Válidos**: Garantir que os cálculos não resultem em valores inválidos

```typescript
function validarConfiguracao(calculation: HospedagemCalculation): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (calculation.totalPessoas > 6) {
    errors.push("Máximo 6 pessoas por quarto");
  }
  
  if (calculation.totalPagantes < 1) {
    errors.push("Deve haver pelo menos 1 pagante");
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

## Testing Strategy

### Casos de Teste Principais

1. **Cenário Básico**: 2 adultos + 1 criança 0-5 → Quarto Doble
2. **Excedente**: 2 adultos + 2 crianças 0-5 → Quarto Triple  
3. **Criança 6+**: 2 adultos + 1 criança 6+ → Quarto Triple
4. **Múltiplas Idades**: 2 adultos + 1 criança 0-3 + 1 criança 6+ → Quarto Triple
5. **Capacidade Limite**: 2 adultos + 3 crianças 0-5 → Quarto Quadruple

### Testes de Validação

```typescript
describe('Cálculo de Pagantes Hospedagem', () => {
  test('2 adultos + 1 criança 0-5 = Doble', () => {
    const result = calcularPagantesHospedagem(2, 1, 0, 0);
    expect(result.totalPagantes).toBe(2);
    expect(result.tipoQuartoRequerido).toBe('Doble');
  });
  
  test('2 adultos + 2 crianças 0-5 = Triple', () => {
    const result = calcularPagantesHospedagem(2, 2, 0, 0);
    expect(result.totalPagantes).toBe(3);
    expect(result.tipoQuartoRequerido).toBe('Triple');
  });
  
  test('2 adultos + 1 criança 6+ = Triple', () => {
    const result = calcularPagantesHospedagem(2, 0, 0, 1);
    expect(result.totalPagantes).toBe(3);
    expect(result.tipoQuartoRequerido).toBe('Triple');
  });
});
```

## Implementation Plan

### Fase 1: Funções Utilitárias
- Criar função `calcularPagantesHospedagem`
- Criar função `validarConfiguracao`
- Adicionar testes unitários

### Fase 2: Integração com Filtros
- Atualizar `filtrarResultadosHospedagem` na página de resultados
- Modificar lógica de exibição de preços
- Testar cenários principais

### Fase 3: Refinamentos
- Adicionar logs para debug
- Otimizar performance
- Melhorar mensagens de erro

### Fase 4: Validação
- Testes end-to-end
- Validação com dados reais
- Ajustes finais baseados em feedback

## Performance Considerations

- **Cache**: Manter cache de cálculos para evitar reprocessamento
- **Filtros SQL**: Considerar filtrar tipos de quarto no Supabase quando possível
- **Memoização**: Usar React.useMemo para cálculos pesados

## Security Considerations

- **Validação de Input**: Sempre validar dados do usuário
- **Limites**: Impor limites máximos de pessoas e quartos
- **Sanitização**: Garantir que cálculos não resultem em valores negativos
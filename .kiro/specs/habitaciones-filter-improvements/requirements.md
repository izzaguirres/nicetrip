# Requirements Document - Melhorias do Filtro de Habitaciones

## Introduction

O filtro de Habitaciones já está implementado e funcionando, conectado ao banco de dados Supabase. No entanto, os resultados que o filtro retorna precisam de ajustes para melhorar a experiência do usuário e garantir que as informações sejam apresentadas de forma clara e precisa.

## Requirements

### Requirement 1: Análise dos Resultados Atuais

**User Story:** Como desenvolvedor, eu quero analisar os resultados atuais do filtro de Habitaciones, para que eu possa identificar quais ajustes são necessários.

#### Acceptance Criteria

1. WHEN o filtro de Habitaciones é executado THEN o sistema SHALL retornar dados da tabela `hospedagem_diarias`
2. WHEN os resultados são exibidos THEN o sistema SHALL mostrar informações relevantes para hospedagem por diárias
3. IF existem problemas nos resultados THEN o sistema SHALL identificar quais campos precisam de ajuste

### Requirement 2: Formatação de Dados de Hospedagem

**User Story:** Como usuário, eu quero ver informações claras sobre as habitaciones disponíveis, para que eu possa tomar uma decisão informada sobre minha reserva.

#### Acceptance Criteria

1. WHEN uma habitación é exibida THEN o sistema SHALL mostrar o nome do hotel correto
2. WHEN o preço é calculado THEN o sistema SHALL considerar o número de noites selecionadas
3. WHEN múltiplas diárias existem THEN o sistema SHALL agrupar por hotel e tipo de quarto
4. IF não há disponibilidade THEN o sistema SHALL mostrar mensagem apropriada

### Requirement 3: Lógica de Pagantes para Hospedagem

**User Story:** Como usuário, eu quero que o sistema calcule corretamente os pagantes baseado na política de gratuidade, para que eu veja apenas quartos adequados à minha configuração.

#### Acceptance Criteria

1. WHEN há 1 criança de 0-5 anos para cada 2 adultos THEN o sistema SHALL considerar a criança como gratuita
2. WHEN há mais de 1 criança de 0-5 anos por 2 adultos THEN o sistema SHALL contar as excedentes como pagantes
3. WHEN há crianças de 6+ anos THEN o sistema SHALL contar como adultos pagantes
4. WHEN calcula tipo de quarto THEN o sistema SHALL usar fórmula: adultos + crianças_6+ + excedente_0_5
5. IF 2 adultos + 1 criança 0-5 THEN o sistema SHALL mostrar quartos "Doble" (2 pagantes)
6. IF 2 adultos + 2 crianças 0-5 THEN o sistema SHALL mostrar quartos "Triple" (3 pagantes)
7. WHEN verifica capacidade THEN o sistema SHALL considerar todas as pessoas físicas no quarto

### Requirement 4: Integração com Sistema de Preços

**User Story:** Como usuário, eu quero ver preços precisos para minha estadia, para que eu possa comparar opções e fazer minha escolha.

#### Acceptance Criteria

1. WHEN o período de estadia é selecionado THEN o sistema SHALL calcular o preço total baseado nas diárias
2. WHEN há diferentes tipos de quarto THEN o sistema SHALL mostrar preços específicos para cada tipo
3. WHEN o preço é calculado THEN o sistema SHALL usar o número de pagantes, não o total de pessoas
4. IF há promoções ou descontos THEN o sistema SHALL aplicar as regras corretas

### Requirement 4: Exibição de Informações Complementares

**User Story:** Como usuário, eu quero ver informações detalhadas sobre as habitaciones, para que eu possa avaliar se atendem às minhas necessidades.

#### Acceptance Criteria

1. WHEN uma habitación é exibida THEN o sistema SHALL mostrar comodidades disponíveis
2. WHEN imagens estão disponíveis THEN o sistema SHALL exibir galeria de fotos
3. WHEN informações de localização existem THEN o sistema SHALL mostrar distância da praia
4. IF há políticas específicas THEN o sistema SHALL exibir condições de cancelamento

### Requirement 5: Consistência com Interface de Pacotes

**User Story:** Como usuário, eu quero uma experiência consistente entre filtros de Pacotes e Habitaciones, para que eu possa navegar facilmente entre as opções.

#### Acceptance Criteria

1. WHEN navego entre abas THEN o sistema SHALL manter layout consistente
2. WHEN vejo resultados THEN o sistema SHALL usar componentes visuais similares
3. WHEN interajo com filtros THEN o sistema SHALL ter comportamento similar
4. IF há diferenças necessárias THEN o sistema SHALL destacar informações específicas de habitaciones
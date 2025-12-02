# 🚀 LEVEL UP SPEC: Admin & Operação Nice Trip 3.0

Este documento define o roteiro de melhorias para o painel administrativo e a experiência do operador, transformando o Admin de uma ferramenta de cadastro em um **hub de gestão inteligente**.

**Data:** 27/11/2025
**Foco:** Melhoria da UX do Operador, Flexibilidade de Regras de Negócio e CMS de Conteúdo.

---

## 1. Regras de Desconto Cirúrgicas (Prioridade Alta)
Atualmente, os descontos aplicam-se globalmente a um pacote/hotel. Precisamos de granularidade por data de saída.

### Mudanças no Banco de Dados (`discount_rules`)
- Adicionar coluna `target_dates` (Array de Datas) ou `travel_window_start` / `travel_window_end`.
- **Objetivo:** Permitir regras como "Desconto de $50 apenas para saída de 15/Outubro".

### Mudanças na UX (Admin)
- No formulário de Desconto (`discount-rule-form.tsx`):
  - Adicionar toggle: "Aplicar a todas as datas" vs "Selecionar datas específicas".
  - Se "Específico", mostrar um *date picker* múltiplo ou intervalo de datas de viagem.

### Mudanças no Cálculo (`package-pricing.ts`)
- Atualizar `computePackageBaseTotal` (ou wrapper de descontos) para verificar se a `data_saida` do pacote selecionado pelo cliente bate com as datas da regra antes de aplicar.

---

## 2. Promoções com "Sense of Urgency" (Prioridade Alta)
Transformar os cards promocionais em ferramentas de venda ativa com validade.

### Mudanças no Banco de Dados (`promotions`)
- Adicionar coluna `valid_until` (Timestamp).
- Adicionar coluna `auto_hide` (Boolean) - se true, remove o card automaticamente após a data.

### Mudanças na UX (Admin)
- Adicionar campo "Válido até" no formulário de Promoções.

### Mudanças no Front-end (Home)
- Componente `PromotionCard`:
  - Ler `valid_until`.
  - Se a data estiver próxima (< 48h), exibir badge "Expira em X horas!".
  - Se a data passou e `auto_hide` for true, não renderizar o card.

---

## 3. Disponibilidade 2.0: Visão & Conteúdo (CMS) (Prioridade Média/Alta)
Resolver a "planilha infinita" e dar poder de edição de conteúdo ao operador.

### A. Nova Visualização (Cards vs Lista)
- Criar toggle na tela `/admin/disponibilidades`.
- **View Cards:** Agrupar registros por `Hotel + Destino`.
  - Card exibe: Nome do Hotel, Destino, Qtd de Datas cadastradas.
  - Clique expande para ver as datas específicas daquele hotel.

### B. Gestão de Conteúdo (CMS)
- **Problema:** Hoje, descrição/fotos vêm do cadastro inicial ou tabelas auxiliares pouco acessíveis.
- **Solução:** Permitir edição direta no Admin.
  - Ao editar uma Disponibilidade, permitir editar os dados do **Hotel/Pacote Pai**:
    - Descrição rica (Rich Text).
    - Galeria de Imagens (Reordenar/Upload).
    - Comodidades (Checklist).
- **Técnica:** Precisamos ver se esses dados estão normalizados (tabela `hoteis`) ou repetidos na `disponibilidades`. Se estiverem na `disponibilidades`, precisaremos de uma função "Atualizar em Lote" para que a mudança na descrição reflita em todas as datas daquele hotel.

---

## 4. Dashboard & Analytics Inteligente (Prioridade Futura)
- Widget de **"Melhores Performances"**: Quais pacotes/destinos tiveram mais cliques no WhatsApp.
- Widget de **"Oportunidades"**: Destinos muito buscados mas sem pacotes cadastrados.

---

## Roteiro de Execução Sugerido

1.  **Fase 1: Estrutura & Descontos**
    *   Migration DB: `discount_rules` e `promotions`.
    *   Atualizar Form de Descontos.
    *   Atualizar Cálculo de Preço.

2.  **Fase 2: Promoções Turbinadas**
    *   Atualizar Form de Promoções.
    *   Atualizar Componente Visual na Home.

3.  **Fase 3: Refatoração da Tela de Disponibilidades (Visual)**
    *   Implementar Toggle View (Lista/Agrupada).

4.  **Fase 4: CMS de Conteúdo**
    *   Implementar edição de descrição/fotos.

---

# Smart Filter – Guia de Lógica e Integração

Este documento descreve a arquitetura, os dados de entrada/saída e todas as regras de cálculo usadas pelo Smart Filter e pelos fluxos de Paquetes (Bus e Aéreo), Habitaciones e Paseos.

## Sumário

- [Visão geral do fluxo](#visão-geral-do-fluxo)
- [Entradas (URL / filtros)](#entradas-url--filtros)
- [Domínios e regras de preço](#domínios-e-regras-de-preço)
  - [Paquetes – Bus/Bús](#paquetes--busbús)
  - [Paquetes – Aéreo](#paquetes--aéreo)
  - [Habitaciones](#habitaciones)
  - [Paseos](#paseos)
- [Seleção de quartos e composição por hotel (Paquetes)](#seleção-de-quartos-e-composição-por-hotel-paquetes)
- [Exibição nos Cards](#exibição-nos-cards)
- [Página de Detalhes (Paquetes)](#página-de-detalhes-paquetes)
- [API Smart Filter](#api-smart-filter)
- [Supabase – campos e índices](#supabase--campos-e-índices)
- [Flags de execução e debug](#flags-de-execução-e-debug)
- [Arquivos principais](#arquivos-principais)
- [Testes rápidos (checklist)](#testes-rápidos-checklist)
- [Melhorias futuras](#melhorias-futuras)
- [Diagrama do fluxo](#diagrama-do-fluxo)

## Visão geral do fluxo

1. Usuário preenche o filtro unificado (`components/unified-search-filter.tsx`) ou o de Habitaciones.
2. A página de resultados (`app/resultados/page.tsx`) lê os parâmetros da URL, monta a configuração de quartos e busca dados reais no Supabase via `lib/supabase-service.ts`.
3. Para Paquetes, os resultados são montados por hotel, respeitando exatamente as capacidades e os preços do Supabase. O card exibe o preço por persona (total dividido pelo nº de pessoas) e envia um breakdown para a página de detalhes.
4. Na página de detalhes (`app/detalhes/page.tsx`) o preço é recomposto a partir do breakdown da navegação e são aplicadas as taxas (Aéreo) e adicionais.
5. A API de Smart Filter (`app/api/smart-filter/route.ts`) recebe filtros, usa o mesmo serviço de dados e retorna recomendações/agrupamentos quando a busca “com IA” é acionada.

## Entradas (URL / filtros)

- Parâmetros principais (Paquetes):
  - `destino`, `transporte` ("Bus"/"Bús" ou "Aéreo"), `data` (yyyy-MM-dd), `salida` (cidade de saída)
  - Pessoas agregadas: `adultos`, `criancas_0_3`, `criancas_4_5`, `criancas_6`
  - Quartos: `quartos` e `rooms_config` (JSON com a distribuição por quarto)
- Rooms config (por quarto):
  - `{ adults, children_0_3, children_4_5, children_6 }`
- Observação (Aéreo): a UI hoje exibe faixas 0–2, 2–5, 6+ (labels dinâmicos). O mapeamento de valores usa as colunas específicas de Aéreo no banco.

## Domínios e regras de preço

### Paquetes – Bus/Bús
- Tabela: `disponibilidades` (campos existentes)
  - `preco_adulto`, `preco_crianca_0_3`, `preco_crianca_4_5`, `preco_crianca_6_mais`
- Cálculo por quarto solicitado:
  - subtotal = (adultos × `preco_adulto`) + (0–3 × `preco_crianca_0_3`) + (4–5 × `preco_crianca_4_5`) + (6+ × `preco_crianca_6_mais`)
- Taxas: nenhuma taxa extra para Bus/Bús (3% removido do sistema).

### Paquetes – Aéreo
- Novas colunas (em `disponibilidades`):
  - `preco_adulto_aereo`, `preco_crianca_0_2_aereo`, `preco_crianca_2_5_aereo`, `preco_crianca_6_mais_aereo`, `taxa_aereo_por_pessoa` (DEFAULT 200)
- Cálculo por quarto solicitado:
  - subtotal = (adultos × `preco_adulto_aereo`) + (0–2 × `preco_crianca_0_2_aereo`) + (2–5 × `preco_crianca_2_5_aereo`) + (6+ × `preco_crianca_6_mais_aereo`)
- Taxa por pessoa (aplicada no total do hotel):
  - taxa = `taxa_aereo_por_pessoa` × (adultos + 2–5 + 6+)
  - Crianças 0–2 são isentas dessa taxa.

### Habitaciones
- Diárias: `hospedagem_diarias` (diária por tipo de quarto/dia)
- Regra de pagantes (política do hotel):
  - 1 criança 0–5 grátis a cada 2 adultos
  - 6+ conta como adulto
  - Excedente 0–5 paga como pagante
- Preço: valor da diária do quarto × nº de noites (não multiplica por pagantes).

### Paseos
- Sem preços definitivos; exibimos valores sob consulta.

## Seleção de quartos e composição por hotel (Paquetes)

- Para cada quarto solicitado pelo usuário, o sistema busca no Supabase um registro com a **capacidade exata**. Se não encontrar, tenta por `quarto_tipo` equivalente (Doble, Triple, etc.).
- O mesmo registro pode ser reutilizado para múltiplos quartos de mesmo tipo/capacidade (pois representa preço por persona daquele tipo).
- O total do hotel = soma dos subtotais dos quartos (e, no Aéreo, + taxa por pessoa).
- Metadados enviados ao detalhe:
  - `__linhas_compostas`: lista com `{ quarto_tipo, capacidade, preços unitários, quarto (ocupação), subtotal, taxa_por_pessoa? }`
  - `__total_composto_base` e `__total_composto` (com taxas, se Aéreo)
  - `transporte`

## Exibição nos Cards

- Paquetes: mostramos **preço por persona** = total do hotel ÷ nº total de pessoas da busca.
- Parcelas: calculadas a partir do valor exibido (por persona) e da data de viagem.

## Página de Detalhes (Paquetes)

- Recompõe o preço base a partir de `rooms_breakdown` (enviado na URL), garantindo paridade com o card.
- Aéreo: aplica `+200` por persona (adultos, 2–5, 6+) no total; 0–2 isento.
- “Servicios Adicionales”: por persona (adultos + 6+). Exceção: “Butaca Cama” também conta 4–5.

## API Smart Filter

Rota: `app/api/smart-filter/route.ts`
- Entrada: `{ filters, roomsConfig }`
- Usa `fetchDataForSmartFilter` para buscar dados reais (Supabase) e aplica:
  - filtro por destino/transporte/data
  - agrupamento por hotel
  - cálculo de preços conforme regras do domínio
  - escore de otimização (ocupação adequada × preço competitivo), retornando as melhores opções
- Saída: lista de recomendações com justificativa e metadados.

## Supabase – campos e índices

Tabelas usadas:
- `disponibilidades` (Paquetes)
- `hospedagem_diarias` (Habitaciones)
- `cidades_saida` (Filtro de cidades)

Para Aéreo, criar colunas conforme `SUPABASE_SETUP.md` e (opcional) índices:
```sql
create index if not exists ix_disponibilidades_transporte on public.disponibilidades (transporte);
create index if not exists ix_disponibilidades_data_saida on public.disponibilidades (data_saida);
```

## Flags de execução e debug

- `NEXT_PUBLIC_ENABLE_FALLBACK` = true|false → liga/desliga dados de fallback.
- `NEXT_PUBLIC_DEBUG_LOGS` (ou `DEBUG_LOGS`) = true|false → habilita logs detalhados em server/client.

## Arquivos principais

- Filtro/UI: `components/unified-search-filter.tsx`
- Resultados: `app/resultados/page.tsx`
- Detalhes: `app/detalhes/page.tsx`
- Serviço de dados: `lib/supabase-service.ts`
- API Smart Filter: `app/api/smart-filter/route.ts`
- Utilitários de hospedagem (pagantes/validação): `lib/hospedagem-utils.ts`

## Testes rápidos (checklist)

- Bus – 2 adultos: card exibe tipo Doble e valor por persona conforme Supabase. Detalhe replica.
- Bus – múltiplos quartos: cada quarto utiliza linha de capacidade correspondente; total = soma.
- Aéreo – 2 adultos + 1 niño (2–5): total = base por faixas + 200 × (3 pessoas taxadas). 0–2 não taxado.
- Habitaciones – 2 adultos + 1 niño (0–5): quarto Doble, diária × noites; explicação mostra criança grátis.

## Melhorias futuras

- UI do filtro de Paquetes Aéreo com contadores separados 0–2 e 2–5 (labels já dinâmicos, lógica pronta).
- Validações por estoque/disponibilidade por tipo de quarto (se aplicável).
- Logs estruturados opcionais (console JSON) para auditoria de preços.

## Diagrama do fluxo

```mermaid
graph TD
  U[Usuário] --> UF[UnifiedSearchFilter / Habitaciones Filter]
  UF -->|parâmetros na URL| R[Resultados (app/resultados/page.tsx)]
  R -->|fetch| SDS[lib/supabase-service.fetchRealData]
  SDS --> DB[(Supabase)]
  R -->|Paquetes: compor por hotel| COMPOS[Composição por hotel\n(capacidade exata → subtotais)]
  COMPOS --> CARD[Card de resultados\n(preço por persona)]
  R -->|IA opcional| API[/api/smart-filter]
  API --> SDS
  CARD --> DET[Detalhes (app/detalhes/page.tsx)]
  DET --> BRK[rooms_breakdown da URL]
  BRK --> CALC[Calcular preço final\nAéreo: +200/pessoa (exceto 0–2)\nAdicionais por persona]
  CALC --> UI[Exibição final + parcelas]
```



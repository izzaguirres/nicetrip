# Nice Trip – Visão Geral do Sistema

Este documento consolida os principais pontos arquiteturais do site Nice Trip, facilitando on-boarding e manutenções futuras. Ele complementa `README.md` e os guias específicos já existentes em `docs/`.

## 1. Contexto & Stack

- **Produtos cobertos:** busca de pacotes (Bus/Bús e Aéreo), hospedagens avulsas, passeios e cockpit administrativo.
- **Tech stack:** Next.js 15 / React 19 (App Router), TypeScript, Tailwind + shadcn/ui, Supabase (Postgres + Auth + Storage), OpenAI e Google Maps.
- **Dependências-chave:** descritas em `package.json`, com Radix UI, lucide-react, react-hook-form, date-fns, Supabase JS, OpenAI SDK, vitest/testing-library.

## 2. Estrutura de Pastas

| Pasta | Descrição |
| --- | --- |
| `app/` | Rotas da aplicação, incluindo públicas (`/`, `/resultados`, `/detalhes`, `/detalhes-hospedagem`, `/detalhes-passeio`) e privadas (`/admin/**`, APIs em `/api/**`). |
| `components/` | Componentes reutilizáveis (seções da landing, filtros, tabelas Admin, UI shadcn). |
| `hooks/` | Hooks para Supabase (ex.: `use-packages`), smart filter, toasts e responsividade. |
| `lib/` | Serviços e regras de negócio (Supabase, pricing, hospedagem, conteúdo, analytics, etc.). |
| `supabase/` | Helper de auth, schema base, migrations e scripts SQL auxiliares. |
| `docs/` | Especificações funcionais (e agora este overview). |
| `tests/` | Baselines vitest para pricing, resultados, smart filter e hospedagem. |

## 3. Fluxo Público Principal

1. **Landing (`app/page.tsx`)**: hero responsivo com tabs “Paquetes / Hospedajes / Paseos”, seções institucionais e CTA para tarifários.
2. **Filtro Unificado (`components/unified-search-filter.tsx`)**: controla destino, transporte, datas e múltiplos quartos, aplicando fallback inteligente e chamando hooks de Supabase (`hooks/use-packages.ts`).
3. **Página de Resultados (`app/resultados/page.tsx`)**: lê parâmetros da URL, reidrata a configuração de quartos, busca dados reais via `lib/supabase-service.ts`, monta cards de pacotes/hospedagens/passeios e registra eventos (`lib/search-analytics.ts`).
4. **Páginas de Detalhes**:
   - `app/detalhes/page.tsx`: recompõe preços, aplica descontos adicionais, consulta voos (`lib/voos-service.ts`), condições e descrições dinâmicas, além de montar mensagens para WhatsApp (`lib/whatsapp.ts`).
   - `app/detalhes-hospedagem/page.tsx`: foca em diárias (`lib/hospedagem-utils.ts` + `lib/hospedagens-service.ts`).
5. **Paseos**: listados na mesma página de resultados e detalhados em `app/detalhes-passeio/page.tsx` usando `lib/paseos-service.ts` e os metadados de `lib/paseos-data.ts`.

## 4. Regras de Dados & Pricing

- **Supabase Service (`lib/supabase-service.ts`)**: ponto único para `disponibilidades`, `hospedagem_diarias`, promoções, discount_rules e eventos. Implementa cache de 5 min, fallback mockado e utilitários de auditoria.
- **Pricing de pacotes (`lib/package-pricing.ts`)**: calcula totais por quarto com as regras “2 adultos liberam 1 criança 0–5 grátis” e integra descontos configuráveis. Qualquer mudança requer atualizar os testes de baseline.
- **Hospedagens (`lib/hospedagem-utils.ts`)**: valida capacidade física, pagantes e compatibilidade entre tipo requerido e disponível.
- **Conteúdo dinâmico**: serviços específicos para texto e condições (`lib/package-content-service.ts`, `lib/package-description-service.ts`, `lib/package-conditions-service.ts`).
- **Dados auxiliares**: imagens e metadados de hotéis (`lib/hotel-data.ts`), comodidades formatadas (`lib/hospedagens-service.ts`), e imagens de passeios (`lib/paseos-data.ts`).

## 5. APIs & Integrações

- **Smart Filter (`app/api/smart-filter/route.ts`)**: processa filtros, agrupa registros por hotel e retorna recomendações com justificativas.
- **GPT Filter / Sugestões (`app/api/gpt-filter/route.ts`, `app/api/sugerir-pacotes/route.ts`, `app/api/sugerir-passeios/route.ts`)**: usam OpenAI quando disponível e caem para regras determinísticas caso contrário.
- **Eventos**: `/api/events/conversion` registra cliques do WhatsApp; `/api/test-supabase` valida rapidamente a conexão e dados em `disponibilidades`.
- **Google Maps**: `components/ui/map-display.tsx` exige `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` para renderizar o mapa na página de detalhes.

## 6. Cockpit Admin

- **Middleware (`middleware.ts`)** protege `/admin/**` e `/api/admin/**`, aplicando rate limit e verificando `admin_users` no Supabase.
- **Dashboard e páginas**:
  - `/admin`: visão geral (`app/admin/(app)/page.tsx`) usando `lib/admin-dashboard.ts`.
  - `/admin/analytics`: gráficos e export (`lib/admin-analytics.ts`, `app/api/admin/analytics/export/route.ts`).
  - `/admin/disponibilidades`: CRUD com importação CSV e log (`lib/admin-disponibilidades.ts`, `components/admin/*`).
  - `/admin/discounts`, `/admin/promotions`, `/admin/users`, `/admin/audit-log`: cada rota consome os respectivos serviços em `lib/admin-*.ts`.
- **APIs Admin**: CRUD de dados, uploads (avatar/promo) via Supabase Storage e check de sessão (`app/api/admin/me`, `.../logout`).

## 7. Operação & Qualidade

- **Documentação adicional**: `SMART_FILTER.md`, `SUPABASE_SETUP.md`, `ADMIN_SPEC.md`, `SUPABASE_RLS_ROLLOUT.md`, `CONFIGURACAO*.md` e `DEBUG_FILTROS.md` descrevem regras de negócio, pipelines e ambientes.
- **Testes**: `tests/baseline/*.test.ts` fixam o comportamento aprovado pelos clientes (pricing bus/aéreo, múltiplos quartos, smart filter). Sempre rodar `npm run lint`, `npm run test` e `npm run test:baseline` antes de deploy.
- **Banco**: migrations versionadas em `supabase/migrations/`; scripts adicionais em `supabase/schema.sql`, `schema_passeios.sql`, `insert_new_paseos.sql` e CSVs dentro de `docs/`.
- **Variáveis de ambiente**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (admin), `NEXT_PUBLIC_ENABLE_FALLBACK`, `NEXT_PUBLIC_DEBUG_LOGS`, `OPENAI_API_KEY`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` e flags mencionadas nos guias.

## 8. Referências Rápidas

- **Entrada/Busca:** `components/unified-search-filter.tsx`, `hooks/use-packages.ts`, `hooks/use-smart-filter.ts`.
- **Resultados/Detalhes:** `app/resultados/page.tsx`, `app/detalhes/page.tsx`, `app/detalhes-hospedagem/page.tsx`, `lib/voos-service.ts`, `lib/whatsapp.ts`.
- **Dados/Pricing:** `lib/supabase-service.ts`, `lib/package-pricing.ts`, `lib/hospedagem-utils.ts`, `lib/hotel-data.ts`.
- **Admin:** `middleware.ts`, `app/admin/(app)/**`, `lib/admin-*.ts`, `components/admin/**`.
- **APIs públicas:** `app/api/smart-filter`, `app/api/gpt-filter`, `app/api/sugerir-pacotes`, `app/api/sugerir-passeios`, `app/api/events/conversion`, `app/api/test-supabase`.

> Para detalhes de regras específicas (pagantes, filtros, RLS, configurações), consulte também os arquivos temáticos em `docs/` e as notas no `README.md`.
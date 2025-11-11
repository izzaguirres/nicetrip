# Admin Dashboard & Configuration Platform Plan

## Contexto
O time da Nice Trip precisa administrar disponibilidades, regras de preço, descontos e analisar o uso do Smart Filter sem depender de alterações manuais no banco. Vamos criar uma área administrativa dentro do próprio projeto (Next.js + Supabase) que permita gerenciar esses dados, registrar histórico e observar métricas básicas.

## Objetivos
1. Fornecer um painel protegido por login para ajustar disponibilidades, regras e promoções.
2. Tornar descontos/regras (ex.: “-USD 150 por adulto no Aéreo”) configuráveis e aplicados automaticamente no cálculo.
3. Registrar e visualizar métricas de busca (destinos filtrados, transportes mais usados, conversões para WhatsApp).
4. Rastrear alterações administrativas para auditoria básica.

## Conceitos-Chave
- **Autenticação**: Supabase Auth (email/senha ou magic link), com RLS garantindo que somente admins vejam/alterem os dados.
- **Configurable Pricing**: o cálculo de pacotes consulta tabelas `discount_rules`, `pricing_overrides` etc., evitando hardcode.
- **Analytics**: eventos de busca e clique são guardados em novas tabelas; dashboard exibe volume, top destinos, etc.
- **Auditoria**: cada alteração relevante grava um registro em `audit_logs`.

## Escopo & Tasks Detalhadas

### Task 0 – Planejamento do Schema & Flags
- Adicionar novas tabelas no Supabase:
  - `admin_users` (se necessário separar das contas normais) ou usar `auth.users`.
  - `discount_rules`: colunas `id`, `name`, `transport_type`, `destination`, `age_min`, `age_max`, `amount`, `currency`, `type` (fixo, percentual), `valid_from`, `valid_to`, `is_active`, `created_by`, `created_at`.
  - `pricing_overrides`: regras específicas por hotel/quarto (opcional para fase inicial).
  - `search_events`: `id`, `filters_json`, `created_at`, `result_count`, `user_agent`, `ip_hash`.
  - `conversion_events`: registra cliques para WhatsApp/pedido.
  - `audit_logs`: `id`, `entity`, `entity_id`, `action`, `payload`, `performed_by`, `created_at`.
- Definir RLS:
  - Usuários admin podem inserir/editar nessas tabelas.
  - Usuários públicos (client-side) só leem o que for necessário (`discount_rules` com `is_active`).
- Documentar no README/SPEC como rodar migrações (SQl scripts no diretório `supabase/`).

### Task 1 – Base do Admin (UI + Auth)
- Criar layout `/app/admin/layout.tsx` com `AdminShell` (sidebar, header).
- Configurar `middleware.ts` para proteger rotas `/admin` (verificação de sessão Supabase).
- Implementar login simples (página `/admin/login`) utilizando Auth do Supabase (magic link ou email/senha).
- Página inicial `/admin` com cards resumindo:
  - Total de regras ativas.
  - Últimas alterações (leitura de `audit_logs`).
  - Eventos de busca nas últimas 24h.
- Ferramentas:
  - Use shadcn/ui (já presente) para tabelas, forms, toast.
  - Crie hooks em `hooks/use-admin-session.ts` para obter estado do usuário.

### Task 2 – CRUD de Regras de Desconto
- Componentizar tabela paginada de `discount_rules`.
- Formulário para criar/editar regra:
  - Campos obrigatórios: nome, transporte (select), desconto (valor fixo ou percentual, com moeda), faixa etária (min/max), datas de validade, destinos segmentados (multi-select).
  - Toggle “ativo” e campos de observação.
- Lógica:
  - Criar rotas API (`app/api/admin/discount-rules`) usando Supabase server-side helpers.
  - Validar input com Zod.
- UI: modal ou página `/admin/discounts` com listagem e botão “Adicionar”.
- Auditar: cada criação/edição/gravação gera `audit_logs` (via helper).

### Task 3 – Integração com o cálculo de pacotes
- Expandir `lib/package-pricing.ts`:
  - Carregar regras ativas (cache interna de curto prazo para não bater no supabase a cada request).
  - Aplicar `amount` por passageiro elegível (considerando transporte, destino, faixa de idade, janela de validade).
  - Prever combinações: múltiplas regras aplicadas? (definir: somar todas ou priorizar a maior? Para começo, aplicar todas as compatíveis.)
- Adicionar testes:
  - `discount_rules` com adultos 6+ em aéreo (-USD 150).
  - Regra percentual (ex.: -10%).
- Atualizar Smart Filter e página de resultados para refletir totais pós-desconto.

### Task 4 – Gestão de Disponibilidades
- Página `/admin/disponibilidades`:
  - Tabela com filtros (destino, transporte, data).
  - Edição inline ou modal (preço, capacidade, datas, hotel).
  - Botão “Duplicar” disponibilidade (prefill com nova data).
- Consumo via Supabase RPC ou mutações pelo admin API (similar ao `discount_rules`).
- Implementar upload CSV opcional (importar novas disponibilidades em lote).
- Toda alteração registra `audit_logs`.

### Task 5 – Analytics Básico
- Capturar eventos na UI pública:
  - Ao executar busca → POST `/api/events/search` armazenando filtros, quantidades, timestamp, IP hash (para métricas).
  - Ao clicar “Solicitar Via WhatsApp” → POST `/api/events/conversion`.
- Admin:
  - Página `/admin/analytics` com cards:
    - Total de buscas no período selecionado.
    - Top destinos / transportes.
    - Conversions (WhatsApp).
  - Use `recharts` (já presente) ou `@vercel/analytics` para gráficos simples.
- Permitir exportar CSV.

### Task 6 – Auditoria e Logs
- Helper `logAdminAction({ userId, entity, action, payload })` centralizado.
- Mostrar em `/admin/audit-log` paginado (mostrando data, usuário, resumo).
- Possibilitar filtro por entidade (ex.: `discount_rule`).

### Task 7 – UX & Segurança
- Aplicar rate-limit básico nas rotas admin (Next middleware + KV local ou Supabase rate limiting).
- Adicionar confirmação (dialog) ao remover recursos.
- Provide feedbacks (toast) ao salvar.
- Garantir que os dados sensíveis estejam escondidos em logs/client (ex.: IP hash).
- Incluir testes e2e simples usando Vitest + MSW ou Playwright (futuro).

## Deliverables
1. **SQL migrations** para tabelas novas.
2. **Admin UI** (`/app/admin/**`) com autenticação, layout, CRUDs.
3. **Serviço de pricing** com suporte a `discount_rules`.
4. **Captura de eventos** (busca/conversão) + dashboards.
5. **Auditoria básica** (logs de alteração).
6. Testes (unit/Snapshot) para as novas regras.

## Roadmap sugerido
1. Migrations + hooks (`supabase/`) + helpers admin (Task 0, Task 1).
2. CRUD `discount_rules` + integração pricing (Task 2 + Task 3).
3. CRUD disponibilidades (Task 4).
4. Eventos e analytics (Task 5).
5. Audit log, polimento (Task 6-7).

## Notas finais
- Escalar gradualmente: entregas pequeñas e testadas.
- Garantir documentação (README: como rodar admin build, migrações).
- Após concluir, descontos como “-USD 150 por adulto Aéreo” se tornam apenas um registro no painel.


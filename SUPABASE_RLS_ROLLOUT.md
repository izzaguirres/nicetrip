# Supabase RLS – Plano Seguro de Ativação (Somente SELECT)

Este guia traz SQLs prontos e um passo a passo para habilitar Row Level Security (RLS) sem alterar os resultados do site (apenas proteção).

## Conceito
- RLS + policy de `SELECT` para o role `anon` mantém os resultados idênticos aos atuais.
- Bloqueamos `INSERT/UPDATE/DELETE` para `anon` por segurança.
- Opcional: filtrar somente registros `ativo = true` se desejar ocultar inativos.
- Para o painel admin, somente usuários cadastrados em `admin_users` podem inserir/editar (`auth.uid()` precisa estar na tabela).

## Tabelas do projeto
- `public.cidades_saida`
- `public.disponibilidades`
- `public.hospedagem_diarias`
- `public.hospedagens`
- `public.package_content_templates`
- `public.package_descriptions`
- `public.voos_aereos`
- `public.admin_users`
- `public.discount_rules`
- `public.search_events`
- `public.conversion_events`
- `public.audit_logs`

## Execução rápida (janela de baixo tráfego)
1) Abra o SQL Editor do Supabase.
2) Aplique em 1 tabela menos crítica (ex.: `cidades_saida`).
3) Teste o site por 30–60s e rode o teste SQL (abaixo).
4) Aplique nas demais tabelas.
5) Se algo estranho ocorrer, use o rollback (abaixo).

---

## Modelo – SELECT-only (não muda resultados)
Substitua `nome_tabela` e execute:

```sql
alter table public.nome_tabela enable row level security;

revoke insert, update, delete on public.nome_tabela from anon;
grant select on public.nome_tabela to anon;

drop policy if exists "Public read" on public.nome_tabela;
create policy "Public read" on public.nome_tabela
  for select
  to anon
  using (true);
```

## Modelo – Somente ativos (opcional)
Para tabelas com coluna `ativo` se quiser ocultar inativos:

```sql
alter table public.nome_tabela enable row level security;

revoke insert, update, delete on public.nome_tabela from anon;
grant select on public.nome_tabela to anon;

drop policy if exists "Public read (ativo)" on public.nome_tabela;
create policy "Public read (ativo)" on public.nome_tabela
  for select
  to anon
  using (ativo is true);
```

---

## Blocos prontos por tabela

### 1) cidades_saida (SELECT-only)
```sql
alter table public.cidades_saida enable row level security;

revoke insert, update, delete on public.cidades_saida from anon;
grant select on public.cidades_saida to anon;

drop policy if exists "Public read" on public.cidades_saida;
create policy "Public read" on public.cidades_saida
  for select
  to anon
  using (true);
```

### 2) disponibilidades (SELECT-only)
```sql
alter table public.disponibilidades enable row level security;

revoke insert, update, delete on public.disponibilidades from anon;
grant select on public.disponibilidades to anon;

drop policy if exists "Public read" on public.disponibilidades;
create policy "Public read" on public.disponibilidades
  for select
  to anon
  using (true);
```

### 3) hospedagem_diarias (SELECT-only)
```sql
alter table public.hospedagem_diarias enable row level security;

revoke insert, update, delete on public.hospedagem_diarias from anon;
grant select on public.hospedagem_diarias to anon;

drop policy if exists "Public read" on public.hospedagem_diarias;
create policy "Public read" on public.hospedagem_diarias
  for select
  to anon
  using (true);
-- Para somente ativos (opcional):
-- drop policy if exists "Public read (ativo)" on public.hospedagem_diarias;
-- create policy "Public read (ativo)" on public.hospedagem_diarias
--   for select to anon using (ativo is true);
```

### 4) hospedagens (SELECT-only)
```sql
alter table public.hospedagens enable row level security;

revoke insert, update, delete on public.hospedagens from anon;
grant select on public.hospedagens to anon;

drop policy if exists "Public read" on public.hospedagens;
create policy "Public read" on public.hospedagens
  for select
  to anon
  using (true);
```

### 5) package_content_templates (SELECT-only)
```sql
alter table public.package_content_templates enable row level security;

revoke insert, update, delete on public.package_content_templates from anon;
grant select on public.package_content_templates to anon;

drop policy if exists "Public read" on public.package_content_templates;
create policy "Public read" on public.package_content_templates
  for select
  to anon
  using (true);
```

### 6) package_descriptions (SELECT-only)
```sql
alter table public.package_descriptions enable row level security;

revoke insert, update, delete on public.package_descriptions from anon;
grant select on public.package_descriptions to anon;

drop policy if exists "Public read" on public.package_descriptions;
create policy "Public read" on public.package_descriptions
  for select
  to anon
  using (true);
```

### 7) voos_aereos (SELECT-only)
```sql
alter table public.voos_aereos enable row level security;

revoke insert, update, delete on public.voos_aereos from anon;
grant select on public.voos_aereos to anon;

drop policy if exists "Public read" on public.voos_aereos;
create policy "Public read" on public.voos_aereos
  for select
  to anon
  using (true);
-- Para somente ativos (opcional):
-- drop policy if exists "Public read (ativo)" on public.voos_aereos;
-- create policy "Public read (ativo)" on public.voos_aereos
--   for select to anon using (ativo is true);
```

### 8) admin_users (admin somente)
```sql
alter table public.admin_users enable row level security;

drop policy if exists "Admin users read" on public.admin_users;
drop policy if exists "Admin users manage" on public.admin_users;

create policy "Admin users read" on public.admin_users
  for select
  to authenticated
  using (
    exists (select 1 from public.admin_users au where au.user_id = auth.uid())
  );

create policy "Admin users manage" on public.admin_users
  for all
  to authenticated
  using (
    exists (select 1 from public.admin_users au where au.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.admin_users au where au.user_id = auth.uid())
  );
```

### 9) discount_rules (público lê regras ativas, admin gerencia)
```sql
alter table public.discount_rules enable row level security;

create policy "Public discount rules" on public.discount_rules
  for select
  to anon, authenticated
  using (
    is_active = true
    and (valid_from is null or valid_from <= current_date)
    and (valid_to is null or valid_to >= current_date)
  );

create policy "Admin discount rules" on public.discount_rules
  for all
  to authenticated
  using (
    exists (select 1 from public.admin_users au where au.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.admin_users au where au.user_id = auth.uid())
  );
```

### 10) search_events & conversion_events (público insere, admin vê)
```sql
alter table public.search_events enable row level security;
alter table public.conversion_events enable row level security;

create policy "Log search events" on public.search_events
  for insert to anon, authenticated with check (true);

create policy "Log conversion events" on public.conversion_events
  for insert to anon, authenticated with check (true);

create policy "Admin search events" on public.search_events
  for select to authenticated
  using (
    exists (select 1 from public.admin_users au where au.user_id = auth.uid())
  );

create policy "Admin conversion events" on public.conversion_events
  for select to authenticated
  using (
    exists (select 1 from public.admin_users au where au.user_id = auth.uid())
  );
```

### 11) audit_logs (apenas admin insere/lê)
```sql
alter table public.audit_logs enable row level security;

create policy "Insert audit logs" on public.audit_logs
  for insert to authenticated
  with check (
    exists (select 1 from public.admin_users au where au.user_id = auth.uid())
  );

create policy "Read audit logs" on public.audit_logs
  for select to authenticated
  using (
    exists (select 1 from public.admin_users au where au.user_id = auth.uid())
  );
```

---

## Testes rápidos (SQL)
Após aplicar em cada tabela, rode:
```sql
set role anon;
select count(*) from public.cidades_saida; -- troque pela tabela aplicada
reset role;
```
Deve retornar normalmente. No site, teste filtros/resultados por 30–60 segundos.

## Rollback rápido
```sql
alter table public.nome_tabela disable row level security;
-- (Opcional) drop policy "Public read" on public.nome_tabela;
```
Volta ao estado “Unrestricted”.

## Observações
- O site usa a **anon key**; as policies devem liberar **SELECT** para `anon`.
- Não use **service_role** no frontend (ignora RLS e tem privilégios elevados).
- Para colunas sensíveis, considere criar uma **VIEW** apenas com campos públicos.

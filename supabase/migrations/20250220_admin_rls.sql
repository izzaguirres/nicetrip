-- RLS policies for admin-driven tables and public data access
--
-- Re-run safe drops before create to allow repeated execution during development.

-- Helper expression reused across policies
-- (No stored function to keep migration simple)

-- admin_users
alter table if exists public.admin_users enable row level security;

revoke insert, update, delete on public.admin_users from anon;
revoke insert, update, delete on public.admin_users from authenticated;

drop policy if exists "Admin users read" on public.admin_users;
drop policy if exists "Admin users manage (service)" on public.admin_users;
drop policy if exists "Admin users manage" on public.admin_users;

create policy "Admin users read" on public.admin_users
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users au
      where au.user_id = auth.uid()
    )
  );

create policy "Admin users manage" on public.admin_users
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users au
      where au.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.admin_users au
      where au.user_id = auth.uid()
    )
  );

create policy "Admin users manage (service)" on public.admin_users
  for all
  to service_role
  using (true)
  with check (true);

-- discount_rules
alter table if exists public.discount_rules enable row level security;

revoke insert, update, delete on public.discount_rules from anon;

drop policy if exists "Public discount rules" on public.discount_rules;
drop policy if exists "Admin discount rules" on public.discount_rules;
drop policy if exists "Service discount rules" on public.discount_rules;

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
    exists (
      select 1
      from public.admin_users au
      where au.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.admin_users au
      where au.user_id = auth.uid()
    )
  );

create policy "Service discount rules" on public.discount_rules
  for all
  to service_role
  using (true)
  with check (true);

-- disponibilidades
alter table if exists public.disponibilidades enable row level security;

revoke insert, update, delete on public.disponibilidades from anon;

drop policy if exists "Public disponibilidades" on public.disponibilidades;
drop policy if exists "Admin disponibilidades" on public.disponibilidades;
drop policy if exists "Service disponibilidades" on public.disponibilidades;

create policy "Public disponibilidades" on public.disponibilidades
  for select
  to anon, authenticated
  using (true);

create policy "Admin disponibilidades" on public.disponibilidades
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users au
      where au.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.admin_users au
      where au.user_id = auth.uid()
    )
  );

create policy "Service disponibilidades" on public.disponibilidades
  for all
  to service_role
  using (true)
  with check (true);

-- search_events
alter table if exists public.search_events enable row level security;

drop policy if exists "Log search events" on public.search_events;
drop policy if exists "Admin search events" on public.search_events;

create policy "Log search events" on public.search_events
  for insert
  to anon, authenticated
  with check (true);

create policy "Admin search events" on public.search_events
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users au
      where au.user_id = auth.uid()
    )
  );

create policy "Service search events" on public.search_events
  for all
  to service_role
  using (true)
  with check (true);

-- conversion_events
alter table if exists public.conversion_events enable row level security;

drop policy if exists "Log conversion events" on public.conversion_events;
drop policy if exists "Admin conversion events" on public.conversion_events;

create policy "Log conversion events" on public.conversion_events
  for insert
  to anon, authenticated
  with check (true);

create policy "Admin conversion events" on public.conversion_events
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users au
      where au.user_id = auth.uid()
    )
  );

create policy "Service conversion events" on public.conversion_events
  for all
  to service_role
  using (true)
  with check (true);

-- audit_logs
alter table if exists public.audit_logs enable row level security;

drop policy if exists "Insert audit logs" on public.audit_logs;
drop policy if exists "Read audit logs" on public.audit_logs;
drop policy if exists "Service audit logs" on public.audit_logs;

create policy "Insert audit logs" on public.audit_logs
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.admin_users au
      where au.user_id = auth.uid()
    )
  );

create policy "Read audit logs" on public.audit_logs
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users au
      where au.user_id = auth.uid()
    )
  );

create policy "Service audit logs" on public.audit_logs
  for all
  to service_role
  using (true)
  with check (true);

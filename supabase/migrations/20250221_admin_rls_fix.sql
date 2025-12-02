-- Ajusta policies de admin_users para autenticar com base no próprio registro

drop policy if exists "Admin users read" on public.admin_users;
drop policy if exists "Admin users manage" on public.admin_users;

create policy "Admin users read" on public.admin_users
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "Admin users manage" on public.admin_users
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- políticas de service_role continuam liberadas
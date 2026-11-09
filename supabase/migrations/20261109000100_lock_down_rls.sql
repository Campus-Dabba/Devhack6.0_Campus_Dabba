-- Campus Dabba: security lockdown
-- Fixes data that was readable or writable with the public anon key.
-- Safe to run more than once. Run AFTER 20261109000000_refresh_seed_data_and_security.sql.

begin;

-- Helper: is the caller an admin? (wraps the existing is_admin(uuid))
-- Policies below call is_admin(auth.uid()).

-- 1. Admin keys --------------------------------------------------------------
-- Every existing unused key has been publicly readable, so treat them as leaked.
update public.admin_keys set used = true, expires_at = now() where used = false;

alter table public.admin_keys enable row level security;
do $$ declare p record; begin
  for p in select policyname from pg_policies where schemaname='public' and tablename='admin_keys' loop
    execute format('drop policy %I on public.admin_keys', p.policyname);
  end loop;
end $$;
create policy "Admins manage admin keys" on public.admin_keys
  for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- Listing keys is admin-only. verify_admin_key / create_admin stay callable
-- (they are SECURITY DEFINER and only check a key the caller already has).
create or replace function public.list_available_admin_keys()
returns table (key text, created_at timestamptz, expires_at timestamptz)
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'not authorized';
  end if;
  return query
    select ak.key, ak.created_at, ak.expires_at from public.admin_keys ak
    where ak.used = false and ak.expires_at > now();
end $$;
revoke execute on function public.list_available_admin_keys() from anon, public;

-- 2. Admins table --------------------------------------------------------------
alter table public.admins enable row level security;
drop policy if exists "Admins can view admins" on public.admins;
create policy "Admins can view admins" on public.admins
  for select to authenticated
  using (id = auth.uid() or public.is_admin(auth.uid()));

-- 3. Plaintext passwords ------------------------------------------------------
update public.cooks set password = null where password is not null;
update public.users set password = null where password is not null;
update public.cooks_backup set password = null where password is not null;

create or replace function public.strip_plaintext_password()
returns trigger language plpgsql set search_path = public as $$
begin
  new.password := null;
  return new;
end $$;

drop trigger if exists strip_password on public.cooks;
create trigger strip_password before insert or update on public.cooks
  for each row execute function public.strip_plaintext_password();
drop trigger if exists strip_password on public.users;
create trigger strip_password before insert or update on public.users
  for each row execute function public.strip_plaintext_password();

-- Old backup table: no client access at all.
alter table public.cooks_backup enable row level security;
revoke all on public.cooks_backup from anon, authenticated;

-- 4. Cook-private data (bank details, Aadhaar/PAN) ----------------------------
alter table public.cook_bank_details enable row level security;
drop policy if exists "Cooks manage own bank details" on public.cook_bank_details;
create policy "Cooks manage own bank details" on public.cook_bank_details
  for all to authenticated
  using (cook_id = auth.uid() or public.is_admin(auth.uid()))
  with check (cook_id = auth.uid());

alter table public.cook_profiles enable row level security;
drop policy if exists "Cooks manage own profile details" on public.cook_profiles;
create policy "Cooks manage own profile details" on public.cook_profiles
  for all to authenticated
  using (cook_id = auth.uid() or public.is_admin(auth.uid()))
  with check (cook_id = auth.uid());

alter table public.cook_orders enable row level security;
drop policy if exists "Cooks view own order stats" on public.cook_orders;
create policy "Cooks view own order stats" on public.cook_orders
  for select to authenticated
  using (cook_id = auth.uid() or public.is_admin(auth.uid()));

alter table public.cook_payments enable row level security;
drop policy if exists "Cooks view own payouts" on public.cook_payments;
create policy "Cooks view own payouts" on public.cook_payments
  for select to authenticated
  using (cook_id = auth.uid() or public.is_admin(auth.uid()));

-- 5. Menus: public read, cooks edit only their own ----------------------------
alter table public.dabba_menu enable row level security;
drop policy if exists "Anyone can view menus" on public.dabba_menu;
drop policy if exists "Cooks manage own menu" on public.dabba_menu;
create policy "Anyone can view menus" on public.dabba_menu for select using (true);
create policy "Cooks manage own menu" on public.dabba_menu
  for all to authenticated
  using (cook_id = auth.uid()) with check (cook_id = auth.uid());

alter table public.menu enable row level security;
drop policy if exists "Anyone can view legacy menu" on public.menu;
drop policy if exists "Cooks manage own legacy menu" on public.menu;
create policy "Anyone can view legacy menu" on public.menu for select using (true);
create policy "Cooks manage own legacy menu" on public.menu
  for all to authenticated
  using (cook_id = auth.uid()) with check (cook_id = auth.uid());

-- 6. Ratings, payments, subscriptions, student profiles -----------------------
alter table public.cook_ratings enable row level security;
drop policy if exists "Anyone can view ratings" on public.cook_ratings;
drop policy if exists "Customers write own ratings" on public.cook_ratings;
create policy "Anyone can view ratings" on public.cook_ratings for select using (true);
create policy "Customers write own ratings" on public.cook_ratings
  for insert to authenticated with check (customer_id = auth.uid());

alter table public.payments enable row level security;
drop policy if exists "Users view own payments" on public.payments;
create policy "Users view own payments" on public.payments
  for select to authenticated
  using (student_id = auth.uid() or cook_id = auth.uid() or public.is_admin(auth.uid()));

alter table public.subscriptions enable row level security;
drop policy if exists "Users manage own subscriptions" on public.subscriptions;
create policy "Users manage own subscriptions" on public.subscriptions
  for all to authenticated
  using (student_id = auth.uid() or cook_id = auth.uid() or public.is_admin(auth.uid()))
  with check (student_id = auth.uid());

alter table public.student_profiles enable row level security;
drop policy if exists "Students manage own profile" on public.student_profiles;
create policy "Students manage own profile" on public.student_profiles
  for all to authenticated
  using (student_id = auth.uid() or public.is_admin(auth.uid()))
  with check (student_id = auth.uid());

-- 7. Settings: public read, admin write ---------------------------------------
alter table public.settings enable row level security;
drop policy if exists "Anyone can read settings" on public.settings;
drop policy if exists "Admins update settings" on public.settings;
create policy "Anyone can read settings" on public.settings for select using (true);
create policy "Admins update settings" on public.settings
  for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- 8. Orders / order items -----------------------------------------------------
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
-- "System can insert order items" allowed anyone to insert any row.
drop policy if exists "System can insert order items" on public.order_items;

-- 9. Pin search_path on every SECURITY DEFINER function in public -------------
do $$ declare f record; begin
  for f in
    select p.oid::regprocedure as sig from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.prosecdef
  loop
    execute format('alter function %s set search_path = public', f.sig);
  end loop;
end $$;

commit;

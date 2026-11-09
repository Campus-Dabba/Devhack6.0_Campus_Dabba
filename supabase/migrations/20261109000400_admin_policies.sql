-- Admin dashboard runs with the admin's own session (no service key), so admins
-- need explicit RLS access to orders and cooks.
begin;

drop policy if exists "Admins manage all orders" on public.orders;
create policy "Admins manage all orders" on public.orders
  for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "Admins manage all cooks" on public.cooks;
create policy "Admins manage all cooks" on public.cooks
  for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

commit;

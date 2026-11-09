-- Campus Dabba: remove client access to internal functions (Supabase security advisor).
-- Trigger functions still fire normally; EXECUTE is only checked for direct RPC calls.

begin;

-- Trigger / internal functions: never called from the app.
revoke execute on function public.handle_new_user() from anon, authenticated, public;
revoke execute on function public.handle_oauth_user() from anon, authenticated, public;
revoke execute on function public.sync_user_on_signup() from anon, authenticated, public;
revoke execute on function public.update_cook_earnings() from anon, authenticated, public;
revoke execute on function public.update_cook_order_stats() from anon, authenticated, public;
revoke execute on function public.update_cook_order_status_count() from anon, authenticated, public;
revoke execute on function public.update_cook_orders_count() from anon, authenticated, public;
revoke execute on function public.update_cook_rating() from anon, authenticated, public;
revoke execute on function public.update_order_status_stats() from anon, authenticated, public;
revoke execute on function public.has_admin_role(uuid) from anon, public;
revoke execute on function public.is_admin() from anon, public;

-- Signed-in only.
revoke execute on function public.list_available_admin_keys() from anon, public;
grant execute on function public.list_available_admin_keys() to authenticated;

-- Kept callable by anon on purpose:
--   verify_admin_key / create_admin  - admin signup runs before email confirmation
--   is_admin(uuid)                   - used by RLS policies and the login form

-- Mutable search_path warnings.
alter function public.update_updated_at_column() set search_path = public;
alter function public.update_order_items_updated_at() set search_path = public;
alter function public.update_orders_updated_at() set search_path = public;

commit;

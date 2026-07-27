-- 0003_rls_policies.sql
-- Row-Level Security policies + Storage bucket for product images.
--
-- Model: the backend API connects with the SECRET (service-role) key, which BYPASSES RLS.
-- So these policies govern DIRECT client access (browser using the publishable key + a
-- user's JWT). Principle: clients may READ only what they should; every write and every
-- sensitive read goes through the API. With RLS enabled and no write policy, direct client
-- INSERT/UPDATE/DELETE is denied by default -- exactly what we want (e.g. a seller cannot
-- self-approve a listing, and no one can self-escalate their role, via the database).
--
-- Re-runnable: each policy is dropped before being (re)created.

-- ========================= categories: public read =========================
drop policy if exists "categories readable by everyone" on public.categories;
create policy "categories readable by everyone"
  on public.categories for select
  using ( true );

-- ========================= users: read own row only =========================
drop policy if exists "users read own row" on public.users;
create policy "users read own row"
  on public.users for select
  to authenticated
  using ( auth.uid() = id );

-- ========================= shops =========================
drop policy if exists "active shops readable by everyone" on public.shops;
create policy "active shops readable by everyone"
  on public.shops for select
  using ( status = 'active' );

drop policy if exists "sellers read own shop" on public.shops;
create policy "sellers read own shop"
  on public.shops for select
  to authenticated
  using ( auth.uid() = user_id );

-- ========================= products =========================
-- Public sees approved listings; a seller additionally sees their own (any status).
drop policy if exists "approved products readable by everyone" on public.products;
create policy "approved products readable by everyone"
  on public.products for select
  using ( status = 'approved' );

drop policy if exists "sellers read own products" on public.products;
create policy "sellers read own products"
  on public.products for select
  to authenticated
  using ( shop_id in (select id from public.shops where user_id = auth.uid()) );

-- ========================= orders =========================
drop policy if exists "buyers read own orders" on public.orders;
create policy "buyers read own orders"
  on public.orders for select
  to authenticated
  using ( auth.uid() = buyer_id );

-- ========================= order_items =========================
drop policy if exists "buyers read own order items" on public.order_items;
create policy "buyers read own order items"
  on public.order_items for select
  to authenticated
  using ( order_id in (select id from public.orders where buyer_id = auth.uid()) );

-- ========================= custom_order_requests =========================
drop policy if exists "buyer or seller read own custom requests" on public.custom_order_requests;
create policy "buyer or seller read own custom requests"
  on public.custom_order_requests for select
  to authenticated
  using ( auth.uid() = buyer_id or auth.uid() = seller_id );

-- ip_reports and payouts intentionally get NO client policies: they stay deny-all for
-- direct access and are served only through the API (secret key).

-- ========================= Storage: product images =========================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "product images public read" on storage.objects;
create policy "product images public read"
  on storage.objects for select
  using ( bucket_id = 'product-images' );

drop policy if exists "authenticated upload product images" on storage.objects;
create policy "authenticated upload product images"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'product-images' );

-- Image replacement/removal is handled by the API (secret key bypasses Storage RLS), so
-- no client update/delete policies are granted here.

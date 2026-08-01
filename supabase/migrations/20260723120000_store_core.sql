-- ============================================================================
-- AlterCraft — Phase 0 store core schema (Supabase / Postgres)
-- Catalogue · Accounts/RBAC · Cart · Orders · Coupons · Durable leads
--
-- HOW TO APPLY (no MCP/CLI needed):
--   Supabase Dashboard → SQL Editor → New query → paste this whole file → Run.
--   Re-runnable: uses IF NOT EXISTS / DROP ... IF EXISTS throughout.
--
-- Money is stored in PAISE (integer) everywhere — Razorpay works in paise and
-- integers avoid float rounding. ₹15,000 == 1500000.
-- ============================================================================

-- ---------- Extensions ----------
create extension if not exists pgcrypto;   -- gen_random_uuid()
create extension if not exists citext;     -- case-insensitive email / coupon codes

-- ---------- Enums ----------
do $$ begin create type user_role      as enum ('customer','admin','sales','production','finance','marketing','hr'); exception when duplicate_object then null; end $$;
do $$ begin create type purchase_flow  as enum ('cart','quoted'); exception when duplicate_object then null; end $$;
do $$ begin create type product_status as enum ('draft','published','archived'); exception when duplicate_object then null; end $$;
do $$ begin create type discount_type  as enum ('flat','percent'); exception when duplicate_object then null; end $$;
do $$ begin create type order_status   as enum ('pending_payment','paid','confirmed','in_production','ready','shipped','delivered','cancelled','refunded'); exception when duplicate_object then null; end $$;
do $$ begin create type lead_status    as enum ('new','contacted','qualified','converted','lost'); exception when duplicate_object then null; end $$;

-- ---------- Shared helpers ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- ============================================================================
-- ACCOUNTS  (profiles 1:1 with auth.users)
-- ============================================================================
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  role       user_role not null default 'customer',
  full_name  text,
  phone      text,
  email      citext,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_profiles_role on public.profiles(role);

-- SECURITY DEFINER so RLS on profiles doesn't recurse when policies call these
create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role <> 'customer');
$$;
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin');
$$;

-- Auto-create a profile whenever a new auth user (phone-OTP / email) is created
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, phone, email, full_name)
  values (new.id, new.phone, new.email, coalesce(new.raw_user_meta_data->>'full_name', null))
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- A customer can never escalate their own role — only an admin may change roles
create or replace function public.guard_profile_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Only admins can change roles.';
  end if;
  return new;
end $$;
drop trigger if exists guard_profile_role on public.profiles;
create trigger guard_profile_role before update on public.profiles
  for each row execute function public.guard_profile_role();

-- ============================================================================
-- CATALOGUE  (single source of truth — tiles/PDP/cart/search all read this)
-- ============================================================================
create table if not exists public.categories (
  id                 uuid primary key default gen_random_uuid(),
  slug               text unique not null,
  name               text not null,
  flow               purchase_flow not null default 'cart',   -- TBD-8, data-driven & flippable
  anchor_price_paise integer,                                  -- "from ₹X" on home tiles
  sort_order         integer not null default 0,
  status             product_status not null default 'published',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table if not exists public.products (
  id               uuid primary key default gen_random_uuid(),
  sku              text unique not null,
  category_id      uuid not null references public.categories(id) on delete restrict,
  name             text not null,
  slug             text not null,
  subtitle         text,
  description      text,
  highlights       jsonb not null default '[]'::jsonb,        -- ["Kiln-dried hardwood", ...]
  specs            jsonb not null default '{}'::jsonb,        -- {"dimensions","material","finish","warranty"}
  base_price_paise integer,                                   -- null for quoted products
  flow             purchase_flow,                             -- null → inherit category.flow
  status           product_status not null default 'draft',
  featured         boolean not null default false,
  sort_order       integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (category_id, slug)
);
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_status   on public.products(status);

create table if not exists public.product_variants (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  sku         text unique not null,
  label       text not null,                                 -- "Queen / Hydraulic / Emerald"
  options     jsonb not null default '{}'::jsonb,            -- {"size":"Queen","storage":"Hydraulic"}
  price_paise integer not null,
  in_stock    boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists idx_variants_product on public.product_variants(product_id);

create table if not exists public.product_images (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url        text not null,
  alt        text,
  is_primary boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_images_product on public.product_images(product_id);

-- ============================================================================
-- ADDRESSES · CART · COUPONS · ORDERS · LEADS
-- ============================================================================
create table if not exists public.addresses (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  full_name  text not null,
  phone      text not null,
  line1      text not null,
  line2      text,
  city       text not null,
  state      text not null,
  pincode    text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_addresses_user on public.addresses(user_id);

create table if not exists public.coupons (
  id                 uuid primary key default gen_random_uuid(),
  code               citext unique not null,
  discount_type      discount_type not null,
  value              integer not null,              -- flat: paise ; percent: whole % (e.g. 10)
  min_order_paise    integer not null default 0,
  max_discount_paise integer,                       -- cap for percent coupons
  starts_at          timestamptz,
  expires_at         timestamptz,
  usage_limit        integer,                       -- null = unlimited (multi-use)
  per_user_limit     integer,                       -- null = unlimited
  used_count         integer not null default 0,
  active             boolean not null default true,
  created_at         timestamptz not null default now()
);

create table if not exists public.coupon_redemptions (
  id             uuid primary key default gen_random_uuid(),
  coupon_id      uuid not null references public.coupons(id) on delete cascade,
  user_id        uuid references auth.users(id) on delete set null,
  order_id       uuid,
  discount_paise integer not null,
  created_at     timestamptz not null default now()
);
create index if not exists idx_redemptions_coupon on public.coupon_redemptions(coupon_id);
create index if not exists idx_redemptions_user   on public.coupon_redemptions(user_id);

create table if not exists public.carts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade,
  status     text not null default 'active',        -- active | ordered | abandoned
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_carts_user on public.carts(user_id);

create table if not exists public.cart_items (
  id               uuid primary key default gen_random_uuid(),
  cart_id          uuid not null references public.carts(id) on delete cascade,
  product_id       uuid not null references public.products(id) on delete restrict,
  variant_id       uuid references public.product_variants(id) on delete restrict,
  quantity         integer not null default 1 check (quantity > 0),
  unit_price_paise integer not null,                -- snapshot at add-to-cart time
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists idx_cart_items_cart on public.cart_items(cart_id);

create table if not exists public.orders (
  id                uuid primary key default gen_random_uuid(),
  order_number      text unique not null default ('AC-' || to_char(now(),'YYMMDD') || '-' || upper(substr(gen_random_uuid()::text,1,6))),
  user_id           uuid references auth.users(id) on delete set null,
  status            order_status not null default 'pending_payment',
  flow              purchase_flow not null default 'cart',
  subtotal_paise    integer not null default 0,
  discount_paise    integer not null default 0,
  shipping_paise    integer not null default 0,
  tax_paise         integer not null default 0,
  total_paise       integer not null default 0,
  coupon_id         uuid references public.coupons(id) on delete set null,
  address_id        uuid references public.addresses(id) on delete set null,
  contact_name      text,
  contact_phone     text,
  contact_email     citext,
  payment_provider  text,                            -- 'razorpay' | 'cod'
  razorpay_order_id text,
  razorpay_payment_id text,
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists idx_orders_user   on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);

create table if not exists public.order_items (
  id               uuid primary key default gen_random_uuid(),
  order_id         uuid not null references public.orders(id) on delete cascade,
  product_id       uuid references public.products(id) on delete set null,
  variant_id       uuid references public.product_variants(id) on delete set null,
  sku              text,
  name             text not null,                   -- snapshot
  options          jsonb not null default '{}'::jsonb,
  quantity         integer not null default 1 check (quantity > 0),
  unit_price_paise integer not null,
  line_total_paise integer not null,
  created_at       timestamptz not null default now()
);
create index if not exists idx_order_items_order on public.order_items(order_id);

create table if not exists public.order_status_history (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.orders(id) on delete cascade,
  status     order_status not null,
  note       text,
  changed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists idx_order_history_order on public.order_status_history(order_id);

-- Durable leads (fixes audit P0 #2: quote/planner/design-visit no longer localStorage-only)
create table if not exists public.leads (
  id                   uuid primary key default gen_random_uuid(),
  source               text not null default 'web',   -- quote_form | ai_planner | design_visit | whatsapp
  name                 text,
  phone                text,
  email                citext,
  city                 text,
  service_interest     text,
  message              text,
  product_id           uuid references public.products(id) on delete set null,
  category_slug        text,
  booking_amount_paise integer,                        -- for quoted "Book a Design Visit"
  utm                  jsonb not null default '{}'::jsonb,
  landing_page         text,
  status               lead_status not null default 'new',
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index if not exists idx_leads_status  on public.leads(status);
create index if not exists idx_leads_created on public.leads(created_at);

-- ---------- updated_at triggers ----------
do $$
declare t text;
begin
  foreach t in array array['profiles','categories','products','addresses','carts','cart_items','orders','leads']
  loop
    execute format('drop trigger if exists trg_%1$s_updated on public.%1$s;', t);
    execute format('create trigger trg_%1$s_updated before update on public.%1$s for each row execute function public.set_updated_at();', t);
  end loop;
end $$;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table public.profiles             enable row level security;
alter table public.categories           enable row level security;
alter table public.products             enable row level security;
alter table public.product_variants     enable row level security;
alter table public.product_images       enable row level security;
alter table public.addresses            enable row level security;
alter table public.coupons              enable row level security;
alter table public.coupon_redemptions   enable row level security;
alter table public.carts                enable row level security;
alter table public.cart_items           enable row level security;
alter table public.orders               enable row level security;
alter table public.order_items          enable row level security;
alter table public.order_status_history enable row level security;
alter table public.leads                enable row level security;

-- profiles: self read/update; staff read all (role change blocked by trigger)
drop policy if exists profiles_read   on public.profiles;
drop policy if exists profiles_update on public.profiles;
create policy profiles_read   on public.profiles for select using (id = auth.uid() or public.is_staff());
create policy profiles_update on public.profiles for update using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());

-- catalogue: public reads published rows; staff manage everything
drop policy if exists categories_read on public.categories;
drop policy if exists categories_write on public.categories;
create policy categories_read  on public.categories for select using (status = 'published' or public.is_staff());
create policy categories_write on public.categories for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists products_read on public.products;
drop policy if exists products_write on public.products;
create policy products_read  on public.products for select using (status = 'published' or public.is_staff());
create policy products_write on public.products for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists variants_read on public.product_variants;
drop policy if exists variants_write on public.product_variants;
create policy variants_read  on public.product_variants for select using (public.is_staff() or exists (select 1 from public.products pr where pr.id = product_id and pr.status = 'published'));
create policy variants_write on public.product_variants for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists images_read on public.product_images;
drop policy if exists images_write on public.product_images;
create policy images_read  on public.product_images for select using (public.is_staff() or exists (select 1 from public.products pr where pr.id = product_id and pr.status = 'published'));
create policy images_write on public.product_images for all using (public.is_staff()) with check (public.is_staff());

-- addresses / carts: owner-scoped
drop policy if exists addresses_owner on public.addresses;
create policy addresses_owner on public.addresses for all using (user_id = auth.uid() or public.is_staff()) with check (user_id = auth.uid() or public.is_staff());

drop policy if exists carts_owner on public.carts;
create policy carts_owner on public.carts for all using (user_id = auth.uid() or public.is_staff()) with check (user_id = auth.uid() or public.is_staff());

drop policy if exists cart_items_owner on public.cart_items;
create policy cart_items_owner on public.cart_items for all
  using (exists (select 1 from public.carts c where c.id = cart_id and (c.user_id = auth.uid() or public.is_staff())))
  with check (exists (select 1 from public.carts c where c.id = cart_id and (c.user_id = auth.uid() or public.is_staff())));

-- orders: owner reads own; writes go through service-role (edge fn / webhook), which bypasses RLS
drop policy if exists orders_read on public.orders;
drop policy if exists orders_staff_write on public.orders;
create policy orders_read        on public.orders for select using (user_id = auth.uid() or public.is_staff());
create policy orders_staff_write on public.orders for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists order_items_read on public.order_items;
drop policy if exists order_items_staff_write on public.order_items;
create policy order_items_read        on public.order_items for select using (public.is_staff() or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy order_items_staff_write on public.order_items for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists order_history_read on public.order_status_history;
drop policy if exists order_history_staff_write on public.order_status_history;
create policy order_history_read        on public.order_status_history for select using (public.is_staff() or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy order_history_staff_write on public.order_status_history for all using (public.is_staff()) with check (public.is_staff());

-- coupons: never publicly listable (would leak all codes) — validate via RPC below
drop policy if exists coupons_staff on public.coupons;
create policy coupons_staff on public.coupons for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists redemptions_read on public.coupon_redemptions;
drop policy if exists redemptions_staff_write on public.coupon_redemptions;
create policy redemptions_read        on public.coupon_redemptions for select using (user_id = auth.uid() or public.is_staff());
create policy redemptions_staff_write on public.coupon_redemptions for all using (public.is_staff()) with check (public.is_staff());

-- leads: anyone may submit (public forms); only staff may read/manage
drop policy if exists leads_insert on public.leads;
drop policy if exists leads_staff on public.leads;
create policy leads_insert on public.leads for insert with check (true);
create policy leads_staff  on public.leads for all using (public.is_staff()) with check (public.is_staff());

-- ---------- Coupon validation RPC (safe: returns only the computed discount) ----------
create or replace function public.validate_coupon(p_code text, p_subtotal_paise integer)
returns table (valid boolean, reason text, discount_paise integer, coupon_id uuid)
language plpgsql stable security definer set search_path = public as $$
declare c public.coupons; d integer;
begin
  select * into c from public.coupons where code = p_code and active = true;
  if not found then return query select false, 'Invalid coupon', 0, null::uuid; return; end if;
  if c.starts_at is not null and now() < c.starts_at then return query select false, 'Coupon not yet active', 0, null::uuid; return; end if;
  if c.expires_at is not null and now() > c.expires_at then return query select false, 'Coupon expired', 0, null::uuid; return; end if;
  if p_subtotal_paise < c.min_order_paise then return query select false, 'Order below minimum', 0, null::uuid; return; end if;
  if c.usage_limit is not null and c.used_count >= c.usage_limit then return query select false, 'Coupon fully redeemed', 0, null::uuid; return; end if;
  if c.discount_type = 'flat' then
    d := least(c.value, p_subtotal_paise);
  else
    d := (p_subtotal_paise * c.value) / 100;
    if c.max_discount_paise is not null then d := least(d, c.max_discount_paise); end if;
  end if;
  return query select true, 'ok', d, c.id;
end $$;
grant execute on function public.validate_coupon(text, integer) to anon, authenticated;

-- ============================================================================
-- SEED — the extended taxonomy (TBD-5) with default flow map (TBD-8, flippable)
-- Change any category's flow later with a one-line UPDATE.
-- ============================================================================
insert into public.categories (slug, name, flow, anchor_price_paise, sort_order) values
  ('beds',            'Beds',            'cart',   1500000, 1),
  ('kitchen',         'Modular Kitchen', 'quoted', null,    2),
  ('mandir',          'Mandir Units',    'cart',   1500000, 3),
  ('wardrobe',        'Wardrobes',       'cart',   1500000, 4),
  ('shoe-rack',       'Shoe Racks',      'cart',    800000, 5),
  ('balcony-storage', 'Balcony Storage', 'cart',   1000000, 6),
  ('custom-mattress', 'Custom Mattress', 'cart',   null,    7)
on conflict (slug) do nothing;

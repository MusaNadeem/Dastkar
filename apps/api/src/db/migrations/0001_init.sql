-- 0001_init.sql — initial schema. Mirrors CLAUDE.md §5 / docs/DATABASE_SCHEMA.md.
-- Run against the Supabase project (SQL editor or CLI). Do not edit after shipping — add a new migration.

-- users: mirrors Supabase auth.users, extended with role
create table public.users (
  id uuid primary key references auth.users(id),
  email text not null,
  full_name text,
  role text not null check (role in ('buyer','seller','admin')) default 'buyer',
  created_at timestamptz default now()
);

-- shops: one per seller
create table public.shops (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id),
  name text not null,
  bio text,
  profile_image_url text,
  status text not null check (status in ('active','suspended','banned')) default 'active',
  strike_count int not null default 0,
  ip_declaration_accepted boolean not null default false,
  created_at timestamptz default now()
);

-- categories
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

-- products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id),
  category_id uuid references public.categories(id),
  title text not null,
  description text,
  price numeric(10,2) not null,
  stock_quantity int not null default 1,
  custom_orders_enabled boolean not null default false,
  status text not null check (status in ('pending_review','approved','rejected')) default 'pending_review',
  image_urls text[] default '{}',
  created_at timestamptz default now()
);

-- orders
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.users(id),
  total_amount numeric(10,2) not null,
  shipping_address jsonb not null,
  payment_method text not null check (payment_method in ('cod','simulated_digital')),
  payment_status text not null check (payment_status in ('pending','paid','failed')) default 'pending',
  order_status text not null check (order_status in ('pending','confirmed','shipped','delivered','cancelled')) default 'pending',
  tracking_number text,
  created_at timestamptz default now()
);

-- order_items
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id),
  product_id uuid not null references public.products(id),
  quantity int not null default 1,
  price_at_purchase numeric(10,2) not null
);

-- custom_order_requests
create table public.custom_order_requests (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.users(id),
  seller_id uuid not null references public.users(id),
  description text not null,
  reference_image_urls text[] default '{}',
  budget_range text,
  quoted_price numeric(10,2),
  status text not null check (status in ('pending','quoted','declined','accepted','deposit_paid','in_progress','completed','shipped')) default 'pending',
  order_id uuid references public.orders(id),
  created_at timestamptz default now()
);

-- ip_reports
create table public.ip_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_name text not null,
  reporter_email text not null,
  reported_product_id uuid references public.products(id),
  reason text not null,
  evidence_url text,
  status text not null check (status in ('open','resolved','dismissed')) default 'open',
  created_at timestamptz default now()
);

-- payouts
create table public.payouts (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id),
  amount numeric(10,2) not null,
  status text not null check (status in ('owed','disbursed')) default 'owed',
  order_id uuid references public.orders(id),
  created_at timestamptz default now()
);

-- Enable Row Level Security on every table. Add policies per docs/DATABASE_SCHEMA.md §RLS.
alter table public.users enable row level security;
alter table public.shops enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.custom_order_requests enable row level security;
alter table public.ip_reports enable row level security;
alter table public.payouts enable row level security;

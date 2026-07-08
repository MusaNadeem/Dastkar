# CLAUDE.md — Arts & Crafts Marketplace Build Guide

This file is written to be dropped into your project root as `CLAUDE.md` so Claude Code reads it automatically at the start of every session. It contains the full context, architecture, and build order for this project.

---

## 1. Project Summary

A web marketplace connecting independent Pakistani artists and craftspeople with buyers. Sellers list handmade products and accept custom commission orders. Buyers browse, purchase, and track orders. The platform replaces the current Instagram DM / WhatsApp selling model with structured listings, order management, and (eventually) secure payments.

**Full business context** (problem, market analysis, competitors, business model, IP policy, go-to-market) lives in `docs/PROJECT_OVERVIEW.md` — read that first if you need the "why," not just the "how."

**MVP timeline:** 6 weeks. **Team:** 2 developers.

### Locked MVP Decisions — do not deviate without asking

- **Auth:** Google OAuth only. No CNIC verification, no email/password, no phone verification in the MVP.
- **Payments:** **Simulated only.** No real Safepay/JazzCash/Easypaisa/Raast integration in the MVP. Build a mock payment screen with Success/Fail buttons that update order state exactly as a real gateway webhook would. Real integration is a post-MVP task — do not attempt to wire up a live gateway unless explicitly told to.
- **Custom orders:** in scope for MVP (request → quote → deposit → fulfillment → balance payment).
- **IP protection:** in scope for MVP (report button, admin takedown, three-strikes tracking). No automated image-similarity detection in MVP — that's post-MVP.
- **Courier integration:** manual tracking number entry only in MVP. No live courier API calls.

---

## 2. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | React (Vite) | Deployed to Vercel |
| Backend | Node.js + Express | Deployed to Railway or a VPS |
| Database | PostgreSQL via Supabase | Also provides auth + storage + row-level security |
| Auth | Supabase Auth (Google provider) | No custom auth code — use Supabase's built-in flow |
| Image storage | Supabase Storage (MVP) → Cloudinary later | Client-side compression before upload in MVP; watermarking can be a simple canvas overlay applied at upload time |
| Payments | Simulated in MVP | Real integration path: Safepay (aggregates cards + JazzCash + Easypaisa + Raast) |
| Email | Resend or Supabase's built-in email, or console-logged in local dev | Keep it swappable — define a single `sendEmail()` function that everything calls |
| Hosting | Vercel (frontend), Railway (backend) | |

Do not introduce additional frameworks, state management libraries, or ORMs beyond what's listed unless asked. Keep the stack boring and shippable.

---

## 3. Repository Structure

```
/apps
  /web              → React frontend (Vite)
    /src
      /pages        → route-level components (Home, Catalog, Product, Cart, Checkout, SellerDashboard, AdminPanel, etc.)
      /components   → shared/reusable UI components
      /hooks         → custom React hooks (useAuth, useCart, etc.)
      /lib           → API client, Supabase client, utils
      /styles
  /api              → Express backend
    /src
      /routes        → one file per resource (auth, products, orders, customOrders, ipReports, admin)
      /controllers    → business logic per route
      /middleware     → auth check, role check, error handler
      /db             → Supabase/Postgres client, query helpers
      /services       → email service, mock payment service, watermark service
/docs
  PROJECT_OVERVIEW.md   → full business context (problem, market, model, IP law, GTM)
  DATABASE_SCHEMA.md    → table definitions (see Section 5 below, copy into here)
  API_SPEC.md           → endpoint list as it's built (keep updated)
CLAUDE.md               → this file
.env.example
```

Keep frontend and backend in one repo (monorepo) for MVP simplicity — do not split into separate repos.

---

## 4. Environment Variables

Create `.env.example` at the root with placeholders (never commit real secrets):

```
# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Backend
PORT=4000
NODE_ENV=development

# Frontend (Vite requires VITE_ prefix)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_BASE_URL=http://localhost:4000

# Email (placeholder — can stub with console.log in dev)
EMAIL_PROVIDER_API_KEY=
```

---

## 5. Database Schema (build this first, in Supabase)

Create these tables in order (respecting foreign key dependencies). Use Supabase's SQL editor or write a migration file in `/apps/api/src/db/migrations/`.

```sql
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
-- seed: Fine Art, Crafts, Calligraphy, Jewelry, Home Decor, Custom

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
```

Enable Row Level Security on every table. Baseline policies: buyers can only read/write their own orders and custom requests; sellers can only read/write their own shop, products, and incoming orders/requests; admins bypass via service role key on the backend only (never expose the service role key to the frontend).

---

## 6. Build Order — Sprint by Sprint

Work through these in order. Each sprint should end in something demoable. Do not start a sprint's backend routes before its schema pieces exist, and do not build frontend screens before the backend route they depend on is working (test with curl/Postman first).

### Sprint 1 — Auth, Onboarding, Seller Listings, Admin Approval
1. Set up Supabase project, run the schema above, seed categories.
2. Set up Express skeleton with a health-check route, error middleware, and Supabase client.
3. Set up React (Vite) skeleton with routing and a Supabase client using Google OAuth.
4. Build: Google sign-up/login → role selection screen → writes `role` to `users` table.
5. Build seller onboarding form (shop name, bio, image, IP declaration checkbox) → creates `shops` row.
6. Build role-based route protection (frontend guard + backend middleware checking `role`).
7. Build product CRUD (create/edit/delete) with image upload to Supabase Storage, watermark applied client-side or on upload.
8. Build seller dashboard shell (My Products list, placeholder Orders/Payouts tabs).
9. Build public shop profile page (public route, no auth required).
10. Build admin listing approval queue (list pending products, approve/reject buttons).

**Demo at end of Sprint 1:** a seller can sign up, create a shop, list a product, an admin approves it, and the shop page shows it publicly.

### Sprint 2 — Buyer Catalog & Discovery
1. Homepage: featured categories + recent approved products grid.
2. Catalog page: category filter, price range filter, sort (newest/price), pagination or infinite scroll.
3. Search: keyword match against product title/description (Postgres `ilike` is fine for MVP — no need for a search engine).
4. Product detail page: image gallery, price, description, seller card linking to shop, Add to Cart, and (if `custom_orders_enabled`) a Request Custom Order button.
5. Cart: add/remove/update quantity, persisted to a `cart_items` table or local state + synced on login (your call — local state is fine for MVP, persisted cart is a nice-to-have).

**Demo at end of Sprint 2:** a buyer can browse, filter, search, view a product, and build a cart.

### Sprint 3 — Checkout, Simulated Payment, Order Lifecycle
1. Checkout page: shipping address form (save to `users` or a separate `addresses` table), payment method radio (COD / Simulated Digital).
2. Simulated payment screen: on "Simulated Digital," show a mock screen with Success/Fail buttons. Success → creates order with `payment_status = 'paid'`, `order_status = 'confirmed'`. Fail → returns to checkout with an error, no order created.
3. COD path: creates order directly with `payment_status = 'pending'`, `order_status = 'confirmed'`.
4. Seller order view: list of incoming orders, "Mark as Shipped" action that prompts for a tracking number, updates `order_status = 'shipped'`.
5. Buyer order tracking view: list of orders with status and tracking number, "Confirm Delivery" button that sets `order_status = 'delivered'`. Add a note in the UI that auto-confirmation after 72 hours is a post-MVP background job (build it now only if time allows — a Postgres scheduled function or a simple cron in the backend).

**Demo at end of Sprint 3:** full purchase loop works — browse to cart to checkout to (simulated) payment to seller fulfillment to buyer tracking.

### Sprint 4 — Custom Orders
1. "Request Custom Order" form on product/shop pages: description, reference image upload, budget range → creates `custom_order_requests` row.
2. Seller view: incoming custom requests, Accept-with-quote or Decline actions.
3. Buyer view: see quote, Approve & Pay Deposit (simulated payment, 30–50% of quoted price) → creates an `orders` row linked via `custom_order_requests.order_id`, status moves to `deposit_paid`.
4. Seller uploads progress photos (store as an array on the request or a simple related table), then final photos.
5. Buyer approves final photos (or requests revision — cap at 2 rounds, track a revision counter) → pays balance (simulated) → status `completed` → normal shipping flow from Sprint 3 takes over.

**Demo at end of Sprint 4:** a buyer can commission a custom piece end-to-end.

### Sprint 5 — IP Protection & Admin Analytics
1. "Report This Listing" button on every product page → form → creates `ip_reports` row.
2. Admin IP report queue: view report + evidence, Takedown (sets product `status = 'rejected'` or a new `'taken_down'` status, increments `shops.strike_count`) or Dismiss.
3. Three-strikes logic: on 1st strike, just log it; 2nd strike sets shop `status = 'suspended'` for a defined period (or requires manual admin reinstatement in MVP); 3rd strike sets `status = 'banned'` permanently.
4. Counter-notice: simple form for sellers to contest a takedown, goes back into the admin queue with a "disputed" flag.
5. Admin analytics dashboard: counts of sellers, products, orders, and sum of `orders.total_amount` for GMV. A few basic numbers is enough — no charting library needed unless you want one.
6. Admin seller overview: list all shops with status and strike count, manual suspend/ban override.

**Demo at end of Sprint 5:** IP reports can be filed, reviewed, and enforced; admin has visibility into platform health.

### Sprint 6 — Notifications, Polish, Legal, Testing, Launch Prep
1. Wire up a single `sendEmail()` service function; call it for order confirmation, new order (seller), shipped notification, custom request notification. Stub with console.log if no email provider is configured yet.
2. Mobile responsiveness pass on every page built so far — this is not optional, most traffic will be mobile.
3. Empty states and loading states everywhere data is fetched.
4. Legal pages: Terms of Service, Privacy Policy, IP Policy, Refund Policy — static content pages, link from footer.
5. Add Google Analytics or a simple event log for: page_view, add_to_cart, checkout_started, order_completed.
6. Full manual regression pass through every flow in Sprints 1–5. Fix what breaks.
7. Seed 10–15 real seller accounts with real listings (this is a content/ops task, not a dev task — but the platform needs to support it smoothly).
8. Soft launch to a closed group of buyers.

---

## 7. Coding Conventions

- Keep components small and route-scoped; don't build a giant shared component library upfront.
- Every backend route validates input before touching the database — use a lightweight validation approach (e.g. zod) rather than manual if-checks scattered everywhere.
- Every mutation that changes money-adjacent state (`orders`, `payouts`, `custom_order_requests`) should be logged with enough detail to reconstruct what happened, even in MVP — this matters for dispute resolution later.
- Do not hardcode role checks in multiple places — centralize in one middleware/hook.
- Naming: snake_case in the database, camelCase in JS/TS code, translate at the data-access layer.
- No premature abstraction. If something is only used once, don't build a generic system for it yet.

## 8. What NOT to Build in MVP

Do not build, even if it seems easy to add "while you're in there":
- Real payment gateway integration
- CNIC/identity verification
- Automated image similarity/duplicate detection
- Courier API integration (tracking numbers are entered manually)
- Reviews/ratings system
- Wishlists
- Seller analytics dashboards (beyond the basic admin-side counts)
- Referral program
- Mobile app / PWA
- Multi-language support

These are explicitly post-MVP (see the 6–24 month roadmap in `docs/PROJECT_OVERVIEW.md`).

## 9. Reference Documents

If these files exist in the repo, read them for deeper context before making product decisions:
- `docs/PROJECT_OVERVIEW.md` — business problem, market analysis, business model, full IP/legal section, go-to-market strategy
- `docs/API_SPEC.md` — keep this updated as you build each route; don't let it drift from the actual code

When in doubt about scope, favor the MVP decisions in Section 1 of this file over anything that sounds like a "nice to have."

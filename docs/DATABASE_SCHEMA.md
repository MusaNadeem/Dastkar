# Database Schema

PostgreSQL via Supabase. Build in order (foreign-key dependencies matter). The authoritative migration lives at [`../apps/api/src/db/migrations/0001_init.sql`](../apps/api/src/db/migrations/0001_init.sql); categories are seeded in `0002_seed_categories.sql`. This document is the human-readable reference — keep it in sync with the migrations.

**Enable Row Level Security on every table.** See §RLS below.

## Tables

| Table | Purpose | Key columns |
|---|---|---|
| `users` | All accounts; mirrors `auth.users`, adds `role` | `id`, `email`, `role (buyer\|seller\|admin)` |
| `shops` | One per seller | `user_id`, `name`, `status`, `strike_count`, `ip_declaration_accepted` |
| `categories` | Seeded taxonomy | `name` (unique) |
| `products` | Belongs to a shop | `shop_id`, `category_id`, `price`, `stock_quantity`, `custom_orders_enabled`, `status`, `image_urls[]` |
| `orders` | Belongs to a buyer | `buyer_id`, `total_amount`, `shipping_address`, `payment_method`, `payment_status`, `order_status`, `tracking_number` |
| `order_items` | Joins orders↔products | `order_id`, `product_id`, `quantity`, `price_at_purchase` |
| `custom_order_requests` | Commission lifecycle | `buyer_id`, `seller_id`, `description`, `quoted_price`, `status`, `order_id` |
| `ip_reports` | IP complaints | `reported_product_id`, `reason`, `evidence_url`, `status` |
| `payouts` | Amounts owed/disbursed per seller | `shop_id`, `amount`, `status`, `order_id` |

### Enum values (CHECK constraints)
- `users.role`: `buyer` · `seller` · `admin`
- `shops.status`: `active` · `suspended` · `banned`
- `products.status`: `pending_review` · `approved` · `rejected`
- `orders.payment_method`: `cod` · `simulated_digital`
- `orders.payment_status`: `pending` · `paid` · `failed`
- `orders.order_status`: `pending` · `confirmed` · `shipped` · `delivered` · `cancelled`
- `custom_order_requests.status`: `pending` · `quoted` · `declined` · `accepted` · `deposit_paid` · `in_progress` · `completed` · `shipped`
- `ip_reports.status`: `open` · `resolved` · `dismissed`
- `payouts.status`: `owed` · `disbursed`

> The full `CREATE TABLE` DDL is in `CLAUDE.md` §5 and the `0001_init.sql` migration. Do not edit shipped migrations — add a new numbered migration for any change.

## RLS baseline

- **buyers** — read/write only their own `orders`, `order_items`, `custom_order_requests`, cart.
- **sellers** — read/write only their own `shops`, `products`, and incoming `orders`/`custom_order_requests`.
- **public** — read `approved` products, `active` shops, `categories`.
- **admin** — no RLS grant; admin acts through the backend **service role key only** (never exposed to the frontend).

Seed categories: Fine Art, Crafts, Calligraphy, Jewelry, Home Decor, Custom.

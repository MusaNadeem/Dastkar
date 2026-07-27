# API Spec

Contract between the React frontend and the Express backend. **Keep this in sync as each route is built** (a Definition-of-Done requirement — see `DEVELOPMENT_PLAN.md` §7). Do not let it drift from the actual code.

- Base URL: `VITE_API_BASE_URL` (default `http://localhost:4000`)
- Auth: `Authorization: Bearer <supabase_jwt>` on protected routes
- Errors: consistent shape `{ "error": "message" }` with appropriate HTTP status
- Validation: every route validates its body/params (zod) before touching the DB

Legend: 🔓 public · 🔑 authenticated · 🎨 seller · 🛡️ admin

## Endpoints (fill in as built)

### Health
- `GET /health` 🔓 → `{ status: "ok" }`

### Auth / Users — *Sprint 1*
- `POST /api/users/role` 🔑 — set role after first login
- `GET  /api/users/me` 🔑 — current profile

### Shops — *Sprint 1*
- `POST /api/shops` 🔑 — create shop (requires IP declaration)
- `GET  /api/shops/:id` 🔓 — public shop profile

### Categories — *Sprint 2* ✅
- `GET /api/categories` 🔓 — all categories (id, name)

### Products — *Sprint 1–2* ✅
- `POST   /api/products` 🎨
- `PATCH  /api/products/:id` 🎨
- `DELETE /api/products/:id` 🎨
- `GET    /api/products/mine` 🎨 — seller's own products (any status)
- `GET    /api/products` 🔓 — catalog. Query: `?q=&categoryId=&minPrice=&maxPrice=&sort=newest|price_asc|price_desc&page=&pageSize=`. Returns `{ products, page, pageSize, total }`
- `GET    /api/products/:id` 🔓 — approved only

### Admin — *Sprint 1, 5* ✅
- `GET   /api/admin/products/pending` 🛡️
- `POST  /api/admin/products/:id/approve` 🛡️
- `POST  /api/admin/products/:id/reject` 🛡️
- `GET   /api/admin/analytics` 🛡️ — `{ sellers, products, approvedProducts, orders, gmv }`
- `GET   /api/admin/shops` 🛡️ — shops with status, strikes, owner
- `POST  /api/admin/shops/:id/status` 🛡️ — `{ status:'active'|'suspended'|'banned' }` manual override

### Orders — *Sprint 3* ✅
- `POST  /api/orders` 🔑 — checkout. Body `{ items:[{productId,quantity}], shippingAddress, paymentMethod:'cod'|'simulated_digital' }`. Total computed server-side; COD → confirmed + stock decremented, simulated → pending awaiting `/pay`.
- `POST  /api/orders/:id/pay` 🔑 — simulated gateway. Body `{ outcome:'success'|'fail' }`. success → paid/confirmed + stock decremented; fail → failed/cancelled.
- `GET   /api/orders/mine` 🔑 — buyer orders (with items)
- `GET   /api/orders/incoming` 🎨 — seller's incoming orders (confirmed+)
- `POST  /api/orders/:id/ship` 🎨 — body `{ trackingNumber }`; confirmed → shipped
- `POST  /api/orders/:id/deliver` 🔑 — shipped → delivered

### Custom Orders — *Sprint 4* ✅
- `POST  /api/custom-orders` 🔑 — buyer request `{ sellerId, description, budgetRange?, referenceImageUrls? }`
- `GET   /api/custom-orders/mine` 🔑 — buyer's requests
- `GET   /api/custom-orders/incoming` 🎨 — seller's requests
- `POST  /api/custom-orders/:id/quote` 🎨 — `{ quotedPrice }`; pending → quoted
- `POST  /api/custom-orders/:id/decline` 🎨 — → declined
- `POST  /api/custom-orders/:id/deposit` 🔑 — `{ outcome, shippingAddress }`; 40% deposit, creates linked order, → deposit_paid
- `POST  /api/custom-orders/:id/photos` 🎨 — `{ type:'progress'|'final', imageUrls }`; first progress → in_progress
- `POST  /api/custom-orders/:id/revision` 🔑 — request revision, max 2
- `POST  /api/custom-orders/:id/balance` 🔑 — `{ outcome }`; approve final + pay balance → completed
- `POST  /api/custom-orders/:id/ship` 🎨 — `{ trackingNumber }`; completed → shipped (buyer then confirms via `/orders/:id/deliver`)

### IP Reports — *Sprint 5* ✅
- `POST  /api/ip-reports` 🔓 — file a report `{ reporterName, reporterEmail, reportedProductId, reason, evidenceUrl? }`
- `GET   /api/ip-reports` 🛡️ — admin queue (open first, with product + shop)
- `POST  /api/ip-reports/:id/takedown` 🛡️ — hide product + strike + three-strikes (2 → suspend, 3 → ban)
- `POST  /api/ip-reports/:id/dismiss` 🛡️
- `POST  /api/ip-reports/:id/counter-notice` 🎨 — seller (owner) contests → report re-opens flagged disputed

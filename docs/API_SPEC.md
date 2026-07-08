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

### Products — *Sprint 1–2*
- `POST   /api/products` 🎨
- `PATCH  /api/products/:id` 🎨
- `DELETE /api/products/:id` 🎨
- `GET    /api/products` 🔓 — list/filter/search/sort/paginate (`?category=&min=&max=&sort=&q=&page=`)
- `GET    /api/products/:id` 🔓

### Admin — *Sprint 1, 5*
- `GET   /api/admin/products/pending` 🛡️
- `POST  /api/admin/products/:id/approve` 🛡️
- `POST  /api/admin/products/:id/reject` 🛡️
- `GET   /api/admin/analytics` 🛡️
- `GET   /api/admin/shops` 🛡️
- `POST  /api/admin/shops/:id/status` 🛡️ — manual suspend/ban override

### Orders — *Sprint 3*
- `POST  /api/orders` 🔑 — checkout (COD or simulated)
- `POST  /api/orders/:id/pay` 🔑 — simulated payment success/fail
- `GET   /api/orders/mine` 🔑 — buyer orders
- `GET   /api/orders/incoming` 🎨 — seller's incoming orders
- `POST  /api/orders/:id/ship` 🎨 — set tracking number
- `POST  /api/orders/:id/deliver` 🔑 — buyer confirm delivery

### Custom Orders — *Sprint 4*
- `POST  /api/custom-orders` 🔑 — buyer request
- `GET   /api/custom-orders/incoming` 🎨
- `POST  /api/custom-orders/:id/quote` 🎨
- `POST  /api/custom-orders/:id/decline` 🎨
- `POST  /api/custom-orders/:id/deposit` 🔑 — approve + pay deposit
- `POST  /api/custom-orders/:id/photos` 🎨 — progress/final uploads
- `POST  /api/custom-orders/:id/revision` 🔑 — request revision (max 2)
- `POST  /api/custom-orders/:id/balance` 🔑 — pay balance

### IP Reports — *Sprint 5*
- `POST  /api/ip-reports` 🔓 — file a report
- `GET   /api/ip-reports` 🛡️ — admin queue
- `POST  /api/ip-reports/:id/takedown` 🛡️ — hide product + increment strike
- `POST  /api/ip-reports/:id/dismiss` 🛡️
- `POST  /api/ip-reports/:id/counter-notice` 🎨 — seller contest

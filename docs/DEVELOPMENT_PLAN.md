# Development Plan — Arts & Crafts Marketplace

*Companion to `CLAUDE.md` (build guide) and `Arts_Crafts_Marketplace_Project.md` (business context). This document is the end-to-end engineering plan: how the app is built, in what order, with what guardrails, and how each piece is verified. Where this document and `CLAUDE.md` disagree, `CLAUDE.md`'s Locked MVP Decisions win.*

---

## 1. Objective & Scope

Ship a web marketplace where Pakistani artists list handmade products and accept custom commissions, and buyers browse, purchase (via **simulated payments**), and track orders — in **6 weeks** with a **2-developer team**.

**In scope (MVP):** Google OAuth, seller onboarding + IP declaration, product CRUD with watermarking, admin listing approval, buyer catalog/search/cart, checkout with simulated payment + COD, order lifecycle, custom order flow, IP reporting + three-strikes, admin analytics, transactional email, legal pages, mobile responsiveness.

**Explicitly out of scope (post-MVP):** real payment gateway, CNIC verification, automated image-similarity detection, courier API, reviews/ratings, wishlists, seller analytics, referral program, mobile app/PWA, multi-language. See `CLAUDE.md` §8.

---

## 2. Guiding Principles

1. **Boring and shippable.** No frameworks, state libraries, or ORMs beyond the locked stack (`CLAUDE.md` §2).
2. **Backend before frontend, schema before backend.** Never build a screen before its route works in Postman; never build a route before its tables exist.
3. **Every sprint ends demoable.** A sprint is "done" only when its demo scenario runs end-to-end.
4. **Money-adjacent state is always logged.** Any mutation to `orders`, `payouts`, `custom_order_requests` writes an audit record (see §6).
5. **Simulated payment mimics a real webhook exactly.** The mock Success/Fail path updates order state identically to how a real gateway callback eventually will — so swapping in Safepay post-MVP touches one service, not the whole flow.
6. **Security is not a sprint.** RLS on every table from day one; service role key never reaches the frontend; input validated (zod) on every route before touching the DB.

---

## 3. Team Split & Working Model

| Track | Owner | Primary surface |
|---|---|---|
| **Backend / Platform** | Dev A | Supabase schema + RLS, Express routes/controllers, services (email, mock payment, watermark), migrations, seed scripts |
| **Frontend / Product** | Dev B | React pages, components, hooks, API client, responsive/UX passes |

- Shared: API contract (`docs/API_SPEC.md`) is the interface between the two tracks and is updated **as each route is built**, never after.
- Cadence: daily 15-min sync, end-of-sprint demo + retro, a shared "definition of done" checklist (see §7).
- Branching: feature branches → PR → the other dev reviews → merge to `main`. `main` always deploys clean.

---

## 4. Architecture Overview

```
┌────────────┐     HTTPS/JSON      ┌──────────────┐     SQL / RLS      ┌────────────────┐
│  React SPA │ ──────────────────► │  Express API │ ─────────────────► │  Supabase (PG) │
│  (Vercel)  │ ◄────────────────── │  (Railway)   │ ◄───────────────── │  auth+storage  │
└────────────┘                     └──────────────┘                    └────────────────┘
      │  Supabase JS (auth session, storage upload)        ▲
      └────────────────────────────────────────────────────┘
```

- **Auth:** Supabase Google OAuth issues a JWT. Frontend attaches it to every API call; backend middleware verifies it and loads the user's role.
- **Authorization:** Two layers — Postgres RLS (defense in depth) + Express role middleware (primary app logic). Admin actions use the service role key **server-side only**.
- **Storage:** Product/reference images upload client-side to Supabase Storage after client-side compression + canvas watermark; only URLs hit the API.
- **Payments:** `mockPaymentService` on the backend transitions order state. No real money, no external calls, webhook-shaped interface.

---

## 5. Data Layer Plan

- Schema is authored once as a migration in `apps/api/src/db/migrations/0001_init.sql` (mirrors `CLAUDE.md` §5). Categories seeded via `0002_seed_categories.sql`.
- **RLS baseline** (enable on every table):
  - `buyers`: read/write only their own `orders`, `order_items`, `custom_order_requests`, cart.
  - `sellers`: read/write only their own `shops`, `products`, and incoming `orders`/`custom_order_requests`.
  - `public`: read `approved` products, `active` shops, `categories`.
  - `admin`: no RLS grant — admin acts through the backend service role key exclusively.
- **Naming:** snake_case in DB, camelCase in JS; translation happens only at the `db/` data-access layer.
- **Migrations are additive and ordered.** Never edit a shipped migration; add a new one.

---

## 6. Cross-Cutting Concerns (built in Sprint 1, used everywhere)

| Concern | Implementation | Where |
|---|---|---|
| Auth middleware | Verify Supabase JWT, attach `req.user` | `api/src/middleware/auth.js` |
| Role guard | Single `requireRole('seller'\|'admin')` middleware; frontend `useAuth` guard | `api/src/middleware/requireRole.js`, `web/src/hooks/useAuth.js` |
| Input validation | zod schema per route, validated before DB | `api/src/routes/*` |
| Error handling | Central error middleware, consistent `{ error }` shape | `api/src/middleware/errorHandler.js` |
| Audit logging | `logMoneyEvent()` on every orders/payouts/custom-order mutation | `api/src/services/auditService.js` |
| Email | Single swappable `sendEmail()` (console.log stub in dev) | `api/src/services/emailService.js` |
| Payment | `mockPaymentService.charge()` returns success/fail, transitions state | `api/src/services/mockPaymentService.js` |
| Watermark | Canvas overlay at upload time | `web/src/lib/watermark.js` |

---

## 7. Definition of Done (every feature)

A feature is done when **all** hold:

- [ ] Backend route validates input (zod) and enforces role/ownership.
- [ ] RLS policy exists and is tested for the tables it touches.
- [ ] Money-adjacent mutations write an audit log entry.
- [ ] `docs/API_SPEC.md` updated with the new endpoint.
- [ ] Frontend handles loading, empty, and error states.
- [ ] Works on a 375px-wide viewport (mobile).
- [ ] Manually verified against the sprint's demo scenario.
- [ ] PR reviewed by the other developer and merged to a clean `main`.

---

## 8. Sprint Plan (engineering detail)

The six sprints below map 1:1 to `CLAUDE.md` §6 and the 6-week table in the project brief. Each lists the build steps, the key files touched, and the demo gate. QA per sprint lives in `docs/QA_GUIDELINES.md`.

### Sprint 1 (Week 1) — Foundation, Auth, Onboarding, Listings, Admin Approval
**Build:** Supabase project + full schema + seed categories → Express skeleton (health check, error middleware, Supabase client) → React skeleton (routing, Supabase client, Google OAuth) → login → role selection → seller onboarding (shop + IP declaration) → role-based route protection → product CRUD with watermarked image upload → seller dashboard shell → public shop page → admin approval queue.
**Key files:** `db/migrations/*`, `middleware/auth.js`, `middleware/requireRole.js`, `routes/auth.js`, `routes/products.js`, `routes/admin.js`, `web/src/pages/{Login,RoleSelect,SellerOnboarding,SellerDashboard,ShopProfile,AdminPanel}.jsx`.
**Demo gate:** seller signs up → creates shop → lists a product → admin approves → product shows on public shop page.

### Sprint 2 (Week 2) — Buyer Catalog & Discovery
**Build:** homepage (featured categories + recent approved grid) → catalog (category + price filters, sort, pagination/infinite scroll) → search (`ilike` on title/description) → product detail (gallery, seller card, Add to Cart, conditional Request Custom Order) → cart (local state for MVP; persisted is nice-to-have).
**Key files:** `routes/products.js` (list/search/detail), `web/src/pages/{Home,Catalog,Product}.jsx`, `web/src/hooks/useCart.js`.
**Demo gate:** buyer browses, filters, searches, opens a product, builds a cart.

### Sprint 3 (Week 3) — Checkout, Simulated Payment, Order Lifecycle
**Build:** checkout (shipping address form, payment method radio) → simulated payment screen (Success → order `paid`/`confirmed`; Fail → error, no order) → COD path (`pending`/`confirmed`) → seller order view + Mark as Shipped (tracking number) → buyer tracking view + Confirm Delivery. Note 72h auto-confirm as post-MVP (build only if time allows).
**Key files:** `routes/orders.js`, `services/mockPaymentService.js`, `services/auditService.js`, `web/src/pages/{Checkout,MockPayment,BuyerOrders,SellerOrders}.jsx`.
**Demo gate:** full loop — browse → cart → checkout → simulated pay → seller ships → buyer tracks/confirms.

### Sprint 4 (Week 4) — Custom Orders
**Build:** Request Custom Order form (description, reference images, budget) → seller incoming requests (Accept-with-quote / Decline) → buyer sees quote, Approve & Pay Deposit (simulated, 30–50%) → creates linked order, status `deposit_paid` → seller uploads progress then final photos → buyer approves or requests revision (cap 2 rounds, counter) → pays balance → `completed` → Sprint 3 shipping takes over.
**Key files:** `routes/customOrders.js`, `web/src/pages/{CustomOrderRequest,SellerCustomOrders,BuyerCustomOrders}.jsx`.
**Demo gate:** buyer commissions a custom piece end-to-end.

### Sprint 5 (Week 5) — IP Protection & Admin Analytics
**Build:** Report This Listing button + form → admin IP report queue (Takedown / Dismiss) → three-strikes logic (1: log, 2: suspend, 3: ban) → counter-notice form (re-enters queue "disputed") → admin analytics (sellers, products, orders, GMV) → admin seller overview (status, strikes, manual override).
**Key files:** `routes/ipReports.js`, `routes/admin.js`, `web/src/pages/{ReportListing,AdminIpQueue,AdminAnalytics,AdminSellers}.jsx`.
**Demo gate:** report filed → reviewed → enforced; admin sees platform health.

### Sprint 6 (Week 6) — Notifications, Polish, Legal, Testing, Launch
**Build:** wire `sendEmail()` into order confirmation / new-order / shipped / custom-request events → mobile responsiveness pass (every page) → empty + loading states everywhere → legal pages (ToS, Privacy, IP, Refund) → analytics events (page_view, add_to_cart, checkout_started, order_completed) → full manual regression → seed 10–15 sellers with 50+ listings → soft launch.
**Key files:** `services/emailService.js`, `web/src/pages/legal/*`, `web/src/lib/analytics.js`.
**Demo gate:** every flow passes regression; platform ready for soft launch.

---

## 9. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Custom order flow slips | Medium | Medium | Core buy/sell loop is independent; defer custom orders to week 7 if needed (brief §12). |
| RLS misconfiguration leaks data | Medium | High | RLS test checklist per sprint (QA §each); service key server-only. |
| Image upload/watermark perf on mobile | Medium | Medium | Client-side compression before upload; test on real mid-range Android. |
| Payment-state bugs corrupt orders | Low | High | Mock payment is webhook-shaped + audit logged; state-machine tests. |
| Scope creep from "while I'm in there" | High | Medium | `CLAUDE.md` §8 NOT-list is binding; PR review rejects out-of-scope work. |
| Supabase free-tier limits during seeding | Low | Medium | Monitor storage/row quotas before seeding 50+ listings. |

---

## 10. Environments & Deployment

- **Local:** Vite dev server + Express (`PORT=4000`) + Supabase project (cloud dev instance). Email stubbed to console.
- **Staging (optional):** Vercel preview + Railway staging + a separate Supabase project. Used for the Sprint 6 regression pass.
- **Production:** Vercel (frontend) + Railway (backend) + production Supabase. Secrets in platform env vars, never committed (`.env.example` is the only checked-in reference).
- **CI/CD:** on PR — lint + build both apps + run the test suite; on merge to `main` — auto-deploy. Set up in Sprint 1.

---

## 11. Post-MVP Handoff

At MVP close, the following are queued (weeks 7–12, brief §12/§14): real Safepay integration (swap `mockPaymentService` only), reviews/ratings, courier API, wishlist, seller analytics, referral program. The mock payment boundary and swappable `sendEmail()` are the two seams designed for painless replacement.

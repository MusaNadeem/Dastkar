# Dastkar — Market Readiness Plan

Where the product stands, what must change before real users and real money, and what to build next.

**Current state:** MVP feature-complete. All 21 screens built, full backend, 73/73 automated QA checks passing. It is a working demo, not yet a live business.

---

## P0 — Blockers before taking real users or money

These are non-negotiable before a public launch.

| # | Gap | Why it blocks | Effort |
|---|---|---|---|
| 1 | **Payments are simulated** | No money can actually move. Integrate Safepay (covers cards + JazzCash + Easypaisa + Raast in one). The swap point is isolated in `mockPaymentService.js`. | 1-2 weeks incl. merchant onboarding |
| 2 | **Emails are console-stubbed** | Buyers/sellers get zero notifications for orders, shipping, or custom requests. Add a Resend/SES key; every notification already routes through one `sendEmail()`. | 1 day |
| 3 | **Legal copy is placeholder** | A marketplace carries real liability under Pakistan's Copyright Ordinance + consumer law. ToS, Privacy, IP Policy, Refunds need a lawyer. | External |
| 4 | **Dev-auth bypass exists** | `ALLOW_DEV_AUTH` lets any request impersonate any user. It is gated to non-production, but **verify it is unset in prod** — this is a total auth bypass if leaked. | 10 min (verify) |
| 5 | **CORS is wide open** | `cors()` accepts any origin. Lock to the production domain. | 30 min |
| 6 | **No rate limiting** | The public IP-report endpoint and auth routes can be spammed/abused. Add `express-rate-limit`. | Half day |
| 7 | **Audit log is console-only** | `logMoneyEvent()` writes to stdout, so money-event history dies with the process — exactly what you need for dispute resolution. Persist to an `audit_log` table. | Half day |
| 8 | **Stock decrement is not atomic** | Read-then-write race can oversell under concurrent checkouts. Move to a Postgres function/transaction. | Half day |
| 9 | **Placeholder imagery** | All photos come from loremflickr (a third-party dev service). Needs real seller photography before launch. | Ops |
| 10 | **No error monitoring** | You will be blind to production failures. Add Sentry + structured logging. | Half day |

---

## P1 — Quality and correctness gaps worth fixing early

**Known functional gaps**
- **Multi-seller orders fulfil as one unit.** An order containing two shops' products is marked shipped wholesale. Needs per-shop fulfilment (sub-orders).
- **Payouts are unimplemented.** The `payouts` table exists but nothing writes to it; sellers have no earnings view. Required once real payments land.
- **Buyer cannot decline a quote.** Only the seller can decline a custom request; the buyer can just not pay.
- **No single-record custom-order endpoint.** The frontend filters the full list client-side.
- **Cart is device-local.** localStorage only, not synced to the account across devices.

**Performance / scale**
- Search uses `ILIKE`; add a Postgres trigram or full-text index before the catalog grows.
- `count: exact` runs on every catalog query — gets slow past a few thousand rows.
- Uploaded images are stored full-size; add client-side compression + responsive sizes (or Cloudinary).

**UX / accessibility**
- Mobile polish: the wireframe specifies a bottom tab bar for buyers; currently a responsive top nav.
- The terracotta accent on white is ~3.8:1 contrast — below WCAG AA for small text. Darken for body-size text.
- Full keyboard/focus and alt-text audit.
- SEO for the landing page: meta tags, OG image, sitemap.

---

## P2 — Features to add after launch

Ordered by expected impact on the marketplace flywheel.

1. **Reviews & ratings** (review-gated to completed buyers) — the single biggest trust lever.
2. **Courier API integration** (PostEx / Leopards) — replaces manual tracking entry; enables COD reconciliation.
3. **Seller payouts + earnings dashboard** — sellers will not stay without visibility into money.
4. **Buyer↔seller messaging** — currently everything routes through custom-order threads only.
5. **Wishlists / favourites** — cheap retention win.
6. **Search & discovery upgrades** — filter by city, "local pickup", sort by popularity.
7. **Discount codes & seasonal collections** (Eid, weddings) — matches the go-to-market plan.
8. **Seller analytics** — views, conversion, best sellers.
9. **In-app notifications** to complement email.
10. **Urdu language support** and a **PWA/mobile app** (per the 12-18 month roadmap).

---

## Suggested sequence

1. **Week 1:** email provider, CORS lock, rate limiting, persisted audit log, atomic stock, Sentry. *(P0 engineering)*
2. **Week 2-3:** Safepay integration + payouts ledger. *(P0 money)*
3. **Parallel:** legal review, real seller onboarding + photography. *(P0 non-engineering)*
4. **Week 4:** mobile/a11y/SEO polish, then soft launch to a closed group.
5. **Post-launch:** reviews → courier API → messaging.

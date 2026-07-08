# QA Guidelines — Arts & Crafts Marketplace

*Quality gates for every phase of the build. No sprint is "done" until its QA checklist passes. These guidelines assume the locked MVP stack and decisions in `CLAUDE.md`; they pair with `docs/DEVELOPMENT_PLAN.md` (what to build) and `docs/ROADMAP.md` (when).*

---

## 0. QA Philosophy & Standards

- **Manual-first, automated where it pays.** MVP timeline is tight; automate the money-and-auth paths, manually verify the rest with scripted scenarios.
- **Test the boundary, not the framework.** Trust Supabase/Express; test *your* routes, RLS policies, validation, and state transitions.
- **A bug in money, auth, or IP state is a release blocker.** Everything else is triaged.
- **Every route is proven in Postman/curl before any UI touches it.** (`CLAUDE.md` §6.)

### Severity levels
| Level | Definition | Rule |
|---|---|---|
| **S1 Blocker** | Data loss, money-state corruption, auth bypass, RLS leak, IP-takedown failure | No release. Fix immediately. |
| **S2 Major** | Core flow broken on a supported device/path, no workaround | Fix before sprint demo. |
| **S3 Minor** | Flow works, degraded UX, edge case | Fix within sprint if time; else backlog. |
| **S4 Cosmetic** | Visual/copy polish | Backlog. |

### Definition of Done (per feature — mirrors DEVELOPMENT_PLAN §7)
Input validated (zod) · role/ownership enforced · RLS policy tested · money mutations audited · `API_SPEC.md` updated · loading/empty/error states · works at 375px · demo scenario passes · PR reviewed.

### Standard test matrix
- **Roles:** unauthenticated, buyer, seller (owner), seller (non-owner), admin.
- **Devices:** 375px mobile (primary), 768px tablet, 1280px desktop.
- **Browsers:** Chrome + Safari (iOS Safari is the real-world majority).
- **States:** loading, empty, error, success, boundary (0, 1, many, max).

---

## 1. Cross-Cutting QA (applies to every sprint)

Run this checklist against **every new route and screen**, regardless of sprint:

**Security / Auth**
- [ ] Endpoint rejects missing/invalid/expired JWT (401).
- [ ] Wrong role is rejected (403) — test buyer→seller route, seller→admin route.
- [ ] Ownership enforced: seller A cannot read/mutate seller B's shop/products/orders.
- [ ] RLS blocks the same access at the DB layer even if middleware were bypassed.
- [ ] Service role key appears in **no** frontend bundle or network payload.

**Validation**
- [ ] Missing required field → 400 with a clear error (not a 500).
- [ ] Wrong type / out-of-range (negative price, quantity 0, oversized string) rejected.
- [ ] Malformed JSON and unexpected extra fields handled gracefully.

**Data integrity**
- [ ] Every money-adjacent mutation writes an audit entry with enough detail to reconstruct it.
- [ ] Foreign-key/enum constraints hold (invalid status/category rejected).
- [ ] No orphan rows (order_items without order, etc.).

**UX baseline**
- [ ] Loading, empty, and error states render (never a blank screen or infinite spinner).
- [ ] Layout intact at 375px; no horizontal scroll; tap targets ≥ 44px.

---

## 2. Sprint 1 QA — Auth, Onboarding, Listings, Admin Approval

**Auth & roles**
- [ ] Google OAuth login creates exactly one `users` row; re-login does not duplicate.
- [ ] Role selection writes `role` correctly; user cannot silently self-assign `admin`.
- [ ] Route protection: buyer hitting `/seller/*` or `/admin/*` is redirected/blocked (frontend and backend).

**Seller onboarding**
- [ ] Shop cannot be created without accepting the IP declaration checkbox.
- [ ] One shop per seller enforced; second attempt is blocked/edits the existing.
- [ ] Missing shop name rejected.

**Product CRUD**
- [ ] Create/edit/delete work; only the owning seller can edit/delete.
- [ ] New product defaults to `pending_review` (not visible publicly).
- [ ] Price rejects negative/zero/non-numeric; stock rejects negative.
- [ ] Image upload: watermark visibly applied; client-side compression runs; ≤5 images enforced; non-image files rejected.
- [ ] Images land in Supabase Storage; only URLs stored on the row.

**Admin approval**
- [ ] Pending queue lists only `pending_review` products.
- [ ] Approve → `approved` and product appears on public shop page; Reject → `rejected` and stays hidden.
- [ ] Non-admin cannot reach approval routes.

**Exit gate test:** full seller-to-shelf loop passes on mobile + desktop.

---

## 3. Sprint 2 QA — Buyer Catalog & Discovery

- [ ] Homepage shows only `approved` products and real categories.
- [ ] Category filter, price-range filter, and sort (newest/price) return correct sets; combined filters compose correctly.
- [ ] Pagination/infinite scroll: no duplicates, no missing items at page boundaries.
- [ ] Search (`ilike`) matches title and description; case-insensitive; empty query and no-results handled.
- [ ] Product detail: gallery navigates all images; seller card links to the correct shop; Request Custom Order shows **only** when `custom_orders_enabled`.
- [ ] Unapproved/`rejected` products are unreachable by direct URL.
- [ ] Cart: add/remove/update qty correct; qty cannot exceed stock or go below 1; totals recompute; cart survives navigation (and login sync if persisted).
- [ ] Empty catalog, empty search, empty cart states render.

**Exit gate test:** browse → filter → search → product → cart, on mobile.

---

## 4. Sprint 3 QA — Checkout, Simulated Payment, Order Lifecycle

**This is the highest-risk QA area. Treat every money-state defect as S1.**

- [ ] Checkout requires a complete shipping address; malformed address rejected.
- [ ] `total_amount` recomputed **server-side** from current prices — never trusted from the client.
- [ ] Simulated payment **Success** → order `payment_status=paid`, `order_status=confirmed`, order + items persisted, audit logged.
- [ ] Simulated payment **Fail** → **no order created**, returns to checkout with error, cart intact.
- [ ] COD → order `payment_status=pending`, `order_status=confirmed`, audit logged.
- [ ] `price_at_purchase` snapshotted per item (later price changes don't alter past orders).
- [ ] Stock decremented correctly; cannot order more than stock; no oversell under repeat submits (double-submit/idempotency check).
- [ ] Seller "Mark as Shipped" requires a tracking number; sets `shipped`; only the owning seller can.
- [ ] Buyer "Confirm Delivery" sets `delivered`; only the owning buyer can.
- [ ] Illegal state transitions rejected (e.g., deliver before ship, pay an already-paid order).
- [ ] Buyer sees only their orders; seller sees only orders for their products (RLS verified).

**State-machine check:** enumerate every order status transition; confirm only legal ones succeed and each writes an audit entry.

**Exit gate test:** full purchase loop, both payment paths, on mobile.

---

## 5. Sprint 4 QA — Custom Orders

- [ ] Request form requires description; reference images optional but validated as images; budget captured.
- [ ] Seller sees only their incoming requests; Accept-with-quote sets `quoted` + price; Decline sets `declined`.
- [ ] Quote price must be positive; deposit computed at 30–50% of quote (verify boundary math, rounding).
- [ ] Approve & Pay Deposit (simulated) → creates linked `orders` row, `custom_order_requests.order_id` set, status `deposit_paid`, audit logged.
- [ ] Deposit failure creates no order and leaves status unchanged.
- [ ] Progress and final photo uploads work and are watermarked; visible to the buyer.
- [ ] Revision counter enforced — **hard cap at 2**; 3rd revision request blocked.
- [ ] Balance payment (simulated) → status `completed`; failure leaves `completed` unreached.
- [ ] On completion, order hands off to the Sprint 3 shipping flow correctly.
- [ ] Full status ladder (`pending→quoted→accepted→deposit_paid→in_progress→completed→shipped`) allows only legal transitions; each money step audited.
- [ ] Buyer↔seller isolation: neither sees the other's unrelated requests.

**Exit gate test:** commission a piece end-to-end, including one revision round.

---

## 6. Sprint 5 QA — IP Protection & Admin Analytics

- [ ] Report form on every product page; requires reporter name, email, reason; creates `open` report.
- [ ] Admin queue shows reports + evidence; only admin can reach it.
- [ ] **Takedown** hides the product (status `rejected`/`taken_down`) *and* increments `shops.strike_count` — verify both in one action.
- [ ] Three-strikes: strike 1 logs only; strike 2 sets shop `suspended`; strike 3 sets `banned`. Verify each threshold exactly (off-by-one check).
- [ ] Suspended shop's products are hidden and the seller cannot list new ones; banned is permanent.
- [ ] Counter-notice form re-enters the queue flagged `disputed`.
- [ ] Dismiss closes the report without a strike.
- [ ] Admin analytics numbers (sellers, products, orders, GMV = sum of `orders.total_amount`) match hand-counted values on seed data.
- [ ] Admin seller overview shows correct status + strike count; manual suspend/ban override works and is audited.

**Exit gate test:** file → review → takedown → strike escalation → counter-notice.

---

## 7. Sprint 6 QA — Notifications, Polish, Legal, Regression, Launch

**Notifications**
- [ ] `sendEmail()` fires on order confirmation, new-order (seller), shipped, custom-request events.
- [ ] Stub logs correctly in dev; swapping the provider needs no caller changes.
- [ ] No email on failed/aborted payments.

**Responsiveness & states**
- [ ] Every page reviewed at 375 / 768 / 1280; no overflow, no broken layouts, tap targets ≥44px.
- [ ] Empty + loading states exist on every data-fetching view.

**Legal & analytics**
- [ ] ToS, Privacy, IP Policy, Refund Policy pages exist and link from the footer.
- [ ] Analytics events fire: `page_view`, `add_to_cart`, `checkout_started`, `order_completed`.

**Full regression (all Sprints 1–5)** — run the complete matrix (roles × devices):
- [ ] Seller-to-shelf loop.
- [ ] Buyer discovery + cart.
- [ ] Purchase loop (COD + simulated), both success and fail.
- [ ] Custom order end-to-end with a revision.
- [ ] IP report → takedown → strike escalation.
- [ ] Admin analytics correct on seeded data.

**Launch readiness**
- [ ] 10–15 seeded sellers with 50+ listings load and perform acceptably.
- [ ] No S1/S2 open. Rollback plan documented. Error monitoring/logging live.
- [ ] Secrets only in env vars; `.env.example` has no real values.

---

## 8. Regression Test Suite (living checklist)

Maintain a running smoke suite run before every demo and before launch:

1. Login as each role; verify correct landing + route access.
2. Seller: create → edit → delete a product; upload watermarked image.
3. Admin: approve one product, reject one.
4. Buyer: filter, search, add to cart, checkout (COD + simulated success + simulated fail).
5. Seller: mark shipped with tracking; Buyer: confirm delivery.
6. Custom order: request → quote → deposit → progress photo → final → revision → balance → complete.
7. IP: report → takedown → verify strike increment and status change.
8. Admin analytics: numbers match seed data.
9. RLS spot-check: seller A cannot see seller B's orders via API.
10. Mobile pass on the three highest-traffic pages (Home, Product, Checkout).

---

## 9. Post-MVP QA Additions (Phase 1+)

When real payments land, extend QA with: gateway webhook signature verification, escrow hold/release correctness, refund/partial-refund paths, reconciliation against the payout ledger, and idempotency under duplicate webhooks. When courier API lands: label generation, status-relay accuracy, failure fallbacks to manual entry. These are **not** MVP QA scope but are pre-listed so the seams built in MVP (mock payment, manual tracking) are tested in a way that anticipates them.

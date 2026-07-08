# Roadmap — Arts & Crafts Marketplace

*The timeline the project follows. Weeks 1–6 are the committed MVP build (2 devs); months 2–24 are the growth roadmap from the business brief (`Arts_Crafts_Marketplace_Project.md` §12–14). Engineering detail for the MVP weeks lives in `docs/DEVELOPMENT_PLAN.md`; QA gates in `docs/QA_GUIDELINES.md`.*

---

## Phase 0 — MVP Build (Weeks 1–6)

Each week = one sprint, ends in a working demo. A week is not "done" until its **Exit gate** passes.

### Week 1 — Foundation & Auth
- **Deliverables:** project setup + CI/CD, full DB schema + RLS + seeded categories, Google auth, role selection, seller onboarding with IP declaration, role-based route protection, product CRUD with watermarked images, seller dashboard shell, public shop page, admin approval queue.
- **Milestone:** `M1 — Seller-to-shelf loop`
- **Exit gate:** seller signs up → shop → lists product → admin approves → public shop page shows it.

### Week 2 — Buyer Experience
- **Deliverables:** homepage, catalog (category/price filters, sort, pagination), keyword search, product detail page with gallery, cart.
- **Milestone:** `M2 — Discoverable catalog`
- **Exit gate:** buyer browses, filters, searches, views a product, builds a cart.

### Week 3 — Checkout & Orders
- **Deliverables:** checkout + shipping address, simulated payment (Success/Fail), COD path, order lifecycle (pending → confirmed → shipped → delivered), seller fulfillment view, buyer tracking view.
- **Milestone:** `M3 — Full purchase loop`
- **Exit gate:** browse → cart → checkout → simulated pay → seller ships → buyer confirms.

### Week 4 — Custom Orders
- **Deliverables:** custom request form, seller quote/decline, deposit payment (simulated 30–50%), progress + final photo uploads, revision cap (2), balance payment, hand-off to shipping.
- **Milestone:** `M4 — Commission lifecycle`
- **Exit gate:** buyer commissions a custom piece request → quote → deposit → fulfillment → balance → ship.
- **Risk buffer:** if this slips, it moves to Week 7; the core loop (M3) ships without it.

### Week 5 — Admin & IP System
- **Deliverables:** IP report portal, admin takedown queue, three-strikes enforcement, counter-notice, admin analytics (sellers/products/orders/GMV), admin seller overview with manual override, mobile responsiveness pass begins.
- **Milestone:** `M5 — Trust & governance`
- **Exit gate:** report filed → reviewed → enforced; admin has platform visibility.

### Week 6 — Test & Launch
- **Deliverables:** transactional emails wired, full mobile responsiveness pass, empty/loading states everywhere, legal pages (ToS/Privacy/IP/Refund), analytics events, full manual regression, seed 10–15 sellers with 50+ listings, soft launch to 50–100 invited buyers.
- **Milestone:** `M6 — Soft launch`
- **Exit gate:** all Sprint 1–5 flows pass regression; platform live to the closed group.

---

## Phase 1 — Post-Launch Hardening (Months 2–3, Weeks 7–12)

*Priority order from brief §12/§14. First real money, first real feedback.*

- **Real payments:** Safepay integration (cards + JazzCash + Easypaisa + Raast) — swap `mockPaymentService` behind the existing webhook-shaped seam; add escrow release on delivery confirmation.
- **Reviews & ratings:** review-gated (only completed buyers), feeds trust signals.
- **Courier API:** PostEx / Leopards for label generation + tracking status relay (replaces manual tracking entry).
- **Auto-confirmation job:** 72h delivery auto-confirm (Postgres scheduled function or backend cron).
- **Wishlist**, **basic recommendations**, **premium seller tier** groundwork.
- **Target:** 500 completed transactions, 50–100 active sellers, 1–2 cities.

---

## Phase 2 — Growth (Months 4–12)

- Scale to **500+ sellers**; open Instagram/Meta paid ads once conversion data exists.
- Premium seller subscription tier (analytics + priority support) goes live.
- Featured/boosted listings (secondary revenue).
- Art-community + university partnerships (NCA, IVS, NUST, LUMS, BNU).
- Occasion-based gifting collections (Eid, weddings, Valentine's).

---

## Phase 3 — Expansion (Months 12–18)

- Broaden categories (vintage, custom services).
- Launch mobile app / PWA.
- Seller analytics + marketing tools.
- Partnerships with art exhibitions and universities.

---

## Phase 4 — Diversification (Months 18–24)

- Advertising revenue (art supplies, packaging, couriers).
- B2B corporate gifting vertical.
- International shipping for the diaspora — position as an export conduit bypassing Etsy/Payoneer barriers.
- Explore auctions and subscription boxes; geographic expansion to South Asia + Middle Eastern diaspora.

---

## Milestone Summary

| ID | Milestone | When | Gate |
|---|---|---|---|
| M1 | Seller-to-shelf loop | End Wk 1 | Seller lists → admin approves → public |
| M2 | Discoverable catalog | End Wk 2 | Browse/filter/search/cart |
| M3 | Full purchase loop | End Wk 3 | Checkout → pay → ship → track |
| M4 | Commission lifecycle | End Wk 4 | Custom order end-to-end |
| M5 | Trust & governance | End Wk 5 | IP report → enforce; admin analytics |
| M6 | Soft launch | End Wk 6 | Regression passes, live to closed group |
| P1 | Real payments live | Month 2–3 | Safepay + escrow |
| P2 | 500+ sellers | Month 4–12 | Paid acquisition on |
| P3 | Mobile app/PWA | Month 12–18 | Category expansion |
| P4 | B2B + export | Month 18–24 | Ad + corporate revenue |

---

## Guardrails on the Roadmap

- **Do not pull post-MVP items into Phase 0.** The `CLAUDE.md` §8 NOT-list is binding for weeks 1–6.
- **Payments stay simulated until Phase 1**, and only then behind the Safepay swap — never a live gateway mid-MVP.
- **Weekly exit gates are hard gates.** A missed gate reshuffles the schedule (custom orders → Week 7); it does not get waved through.

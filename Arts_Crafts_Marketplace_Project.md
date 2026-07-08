# Arts & Crafts Marketplace — Complete Project Documentation

*Prepared by: Aiman Ahmad · June 2026*

A dedicated digital marketplace connecting independent Pakistani artists and craftspeople with buyers, replacing the fragmented Instagram/WhatsApp selling model with a structured platform for listings, secure transactions, and custom orders.

---

## 1. The Business Problem

Thousands of Pakistani artists and craftspeople — calligraphers, painters, resin artists, crochet makers, jewelry designers — sell their work through Instagram DMs and WhatsApp. These are social platforms, not commerce platforms, and the gap creates real problems:

- **No proper storefront.** There is no cart, no structured catalog, no checkout.
- **No payment system.** Sellers manually verify bank transfer screenshots or rely on cash on delivery.
- **No order tracking.** Buyers have no automated updates; sellers carry a heavy manual customer-service burden.
- **No buyer protection.** Transactions run on blind trust, and buyers have no recourse if a product never arrives or is misrepresented.
- **Discovery is algorithm-dependent.** Talented artists with small followings stay invisible regardless of quality, and a single algorithm change can wipe out reach overnight.

The market exists on both sides. Supply is large and growing, demand is real, but the connection between them is inefficient and unreliable.

---

## 2. The Proposed Solution

A web-based marketplace where artists list their products, buyers browse and purchase securely, and the platform handles payments, order tracking, and dispute resolution. In short: **Etsy built specifically for Pakistan** — local payments, local couriers, and a focus on authentic handmade goods.

The platform also supports **custom orders**, letting buyers commission bespoke pieces directly through a structured request-quote-approve-pay flow rather than negotiating in DMs.

---

## 3. Market Analysis

### Target Market

- **Sellers:** Independent artists aged 18–35, primarily home-based creators in Lahore, Karachi, Islamabad, and Multan.
- **Buyers:** Urban middle-to-upper-middle-class consumers aged 20–40 seeking unique handmade gifts, home decor, and art.
- **Secondary buyers:** Corporate clients for custom gifts and event decor.

### Market Segmentation

Fine art (paintings, digital prints), handmade crafts (resin, crochet, pottery), calligraphy and Islamic art, personalized/custom-order items (custom portraits, name plates), jewelry and accessories, and home decor.

### Market Demand & Size

- Pakistan's e-commerce market is valued at **$5.8–$7.7 billion** (2024–25), growing at roughly **13% CAGR**, projected to exceed **$20 billion by 2029**.
- The global online art market reached **$12.2 billion in 2025** (7.1% CAGR).
- Domestically, an estimated **10,000–50,000 active small-scale creators**, with average monthly sales of **PKR 15,000–50,000** each.
- Pakistani handicraft exports grew **53% YoY in FY25**, signaling a strong revival of interest.

### Geographic Focus

Initial launch in Lahore, Karachi, and Islamabad/Rawalpindi (highest creator density and buyer purchasing power). Online-first, no physical presence; shipping handled via TCS, Leopards, and PostEx.

---

## 4. Competitive Landscape

- **Daraz** (~50% market share) focuses on high-velocity FMCG and electronics. Its handicraft listings are buried under mass-produced goods with no artisan curation. Its financial mandate to reach profitability pushes it further toward high-turnover categories, leaving the artisan space open.
- **Instagram / Facebook** are discovery tools, not commerce platforms.
- **Etsy** ($11.9B GMS, 86.5M buyers in FY2025) is effectively inaccessible to most Pakistani sellers due to Payoneer KYC barriers, IP-flagging of Pakistani addresses, and automated account suspensions.
- **Local players** like Vceela (50,000+ artisans) and Polly & Other Stories validate demand but operate at niche scale.

The space is **underserved, not unserved** — the problem is recognized but not adequately addressed, and the gap is widening.

---

## 5. Unique Selling Proposition

- Curated, Pakistan-focused marketplace exclusively for handmade and original art — not competing with factory goods.
- Built-in custom order flow: buyers request bespoke pieces, artists quote, and the platform manages the full lifecycle.
- Creator-first tools: portfolio pages, order management, and analytics that replace the Instagram DM workflow.
- Localized payments (JazzCash, Easypaisa, Raast, COD) and integrated courier booking built for the Pakistani context.

---

## 6. Features

### For Sellers

- Simple signup via **Google authentication**
- Personal shop page with bio and portfolio
- Product listing with images and pricing
- Custom order acceptance (receive briefs, send quotes, fulfill)
- Order management dashboard
- Payout tracking

### For Buyers

- Browsable catalog with categories, search, and filters
- Product pages with images and seller info
- Custom order requests (describe what you want, get quotes from artists)
- Cart and checkout with COD and digital payment options
- Order tracking
- IP reporting (flag copied or stolen work)

### Admin

- Listing approval before going live
- IP takedown management (three-strikes system)
- Platform analytics (sellers, orders, revenue)

---

## 7. Business Model

**Type:** Platform-as-a-service (marketplace model). No inventory is held; the platform facilitates transactions between independent sellers and buyers.

**Revenue Streams:**

- **Primary:** 10–15% commission per completed sale (including custom orders).
- **Secondary:** Featured/boosted listings, tiered seller subscriptions (free basic tier, paid premium with analytics and priority support), and advertising from relevant brands (art supplies, packaging, couriers).

The commission model aligns incentives — the platform only earns when its sellers earn.

---

## 8. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Backend | Node.js with Express |
| Database | PostgreSQL via Supabase |
| Image Storage | Supabase Storage / Cloudinary (with watermarking) |
| Payments (MVP) | **Simulated** — no live gateway integration |
| Payments (post-MVP) | Safepay (single integration for cards, JazzCash, Easypaisa, Raast) |
| Logistics | PostEx / Leopards API for courier booking and COD management |
| Hosting | Vercel (frontend), Railway or VPS (backend) |

### How the stack works together

- **Frontend (React on Vercel)** handles everything the user sees, route-separated into buyer pages, the seller dashboard, and the admin panel. Role-based access controls which routes each user can reach.
- **Backend (Node.js + Express)** is the API layer between the frontend and everything else. It validates requests, runs business logic, receives payment/courier webhooks, and sends notification emails.
- **Database (PostgreSQL via Supabase)** stores all structured data. Supabase also provides built-in auth (Google OAuth), real-time subscriptions, row-level security, and file storage — saving weeks of infrastructure work.
- **Image storage (Cloudinary/Supabase)** handles product photos with automatic compression, watermarking, and responsive delivery for fast mobile loading.
- **Payments** are **simulated in the MVP** — the checkout flow, order states, and payout logic all work end-to-end using a mock payment step, with no real money moving. This lets the full purchase loop be built and tested without waiting on gateway approvals. Real integration via Safepay is a post-MVP task.
- **Logistics (PostEx/Leopards)** generates shipping labels and tracking numbers, and relays courier status updates back to the buyer's order page.

### Core Database Tables

- `users` — all accounts (buyers, sellers, admins) with a role field; Google OAuth via Supabase Auth.
- `shops` — one per seller; name, bio, profile image, status, strike count.
- `products` — belongs to a shop; title, description, price, stock, category, custom-orders flag, review status, image URLs.
- `categories` — Fine Art, Crafts, Calligraphy, Jewelry, Home Decor, Custom.
- `orders` — belongs to a buyer; total, shipping address, payment method, payment status, order status, tracking number.
- `order_items` — joins orders and products; quantity, price at purchase.
- `custom_order_requests` — buyer ID, seller ID, description, reference images, budget range, status.
- `ip_reports` — reporter info, reported listing, reason, evidence, status.
- `payouts` — tracks amounts owed and disbursed per seller.

---

## 9. Payment Landscape (Reference for Post-MVP Integration)

Payments are **simulated in the MVP**. The following is the researched basis for the eventual real integration.

| Provider | API Access | Transaction Cost | Notes |
|---|---|---|---|
| **JazzCash** | Free (no setup/monthly/annual fee) | ~2–3% per transaction | Requires registered business + KYC |
| **Easypaisa** | Free (no setup/installation fee) | ~1.75–2% per transaction | Daily/instant settlement for wallet |
| **Raast P2M** | Free, **0% MDR** | Zero fee; govt subsidy reimburses merchants ~0.5% or Rs 100 (until June 2026) | Requires a bank MSP or aggregator to integrate |
| **Safepay (aggregator)** | Free (no setup/monthly fee) | 2.9% + Rs 30 domestic; 3.2% + Rs 30 international | One integration = cards + JazzCash + Easypaisa + Raast |

**Decided direction:** Use **Safepay as the single integration** post-MVP — one API, one dashboard, one settlement flow gives all major methods at once. Direct integrations can be negotiated later once transaction volume provides leverage. COD needs no payment API; the courier collects cash.

---

## 10. Secure Payments & Buyer/Seller Protection

The core mechanism is **escrow**: the platform holds the buyer's payment until delivery is confirmed, then releases funds to the seller minus commission.

- **Digital payment flow:** Buyer pays → funds held by platform → seller ships → buyer confirms delivery (or 48–72h auto-confirmation) → funds released. Protects the buyer (money isn't released until delivery) and the seller (payment is committed before shipping).
- **COD flow:** Partner with couriers offering upfront/accelerated COD settlement (PostEx pays sellers before collection). Add buyer phone OTP verification and pre-delivery confirmation calls to cut the 15–20% refusal rate. Offer open-parcel delivery where supported.
- **Custom orders:** Buyer accepts a quote and pays a non-refundable deposit (30–50%) held in escrow. Artist uploads progress photos, then final photos. Buyer approves (with limited revision rounds) and pays the balance before shipping. The full brief, quote, and progress photos are documented on-platform to enable dispute resolution.
- **Dispute resolution:** Tiered process — direct buyer-seller messaging (48h) → escalation to admin review using order details, seller photos, courier proof, and buyer evidence → ruling (full/partial refund or dismissal) → one appeal. Manual at early stage.
- **Trust signals:** Review-gated ratings (only completed buyers can review), seller "member since" and completed-order counts, and a loud buyer-protection guarantee funded from the commission pool.

---

## 11. Intellectual Property & Platform Integrity

### Platform Stance

The platform operates as a **neutral venue** under Pakistan's **Copyright Ordinance, 1962** and **Trade Marks Ordinance, 2001**. All sellers sign a **digital IP declaration** at onboarding, warranting that every listed item is their original creation or that they hold the legal right to sell it. Under this declaration, **the seller assumes full legal liability for any IP disputes** — the platform is not liable for individual seller violations but commits to acting on valid infringement reports promptly.

### Regulatory Framework in Pakistan

- **Copyright Ordinance, 1962** (amended 2000): protects artistic works including works of artistic craftsmanship. Protection is automatic; lasts 50 years after the creator's death. Section 57 covers fair dealing (narrow exceptions for research, criticism, review). Section 62 covers moral rights (right to attribution), which are non-transferable.
- **Geographical Indications Act, 2020:** protects region-specific products (Sindhi Ajrak, Multani pottery, etc.). Weakly enforced — an opportunity for the platform to lead with authenticity tagging.
- **Trade Marks Ordinance, 2001:** protects brand names and logos.
- **Enforcement bodies:** IPO-Pakistan (primary), FIA Cyber Crime Wing (digital piracy), Pakistan Customs (counterfeit goods). Enforcement is weak in practice, so the platform must be the first line of defense.

### Enforcement Mechanism (modeled on the Etsy approach)

A **complaint-driven takedown model**:

1. Rights holders report infringement through a dedicated portal (identifying the work, the infringing listing, contact info, and a good-faith statement).
2. Valid reports trigger **immediate listing removal** and seller notification.
3. Sellers may file a **counter-notice**; if unchallenged in court, material can be relisted after 10 business days.
4. **Repeat offenders** face permanent account termination under a **three-strikes policy** (warning → temporary suspension → permanent ban).

### Early-Stage Curation (going beyond Etsy)

During launch (0–100 sellers), **all listings undergo manual review before going live**, including reverse image verification. As the platform scales, this transitions to community-driven reporting supplemented by automated image similarity detection.

### Additional Protections

- Watermarked product images and visible copyright attribution on every listing.
- For custom orders, the artist retains copyright by default; a buyer can purchase a full IP transfer as an optional add-on.
- GI tagging restricted to sellers genuinely based in or sourcing from the relevant region.

---

## 12. 6-Week MVP Development Plan

Assumes a 2-person dev team. Payments are simulated; seller auth is Google-only.

| Week | Focus Area | Deliverables |
|---|---|---|
| **1** | Foundation & Auth | Project setup, CI/CD, DB schema. Google auth flow, role selection, seller onboarding with IP declaration. Seeded categories. |
| **2** | Seller Dashboard | Product listing CRUD (title, description, price, 5 watermarked images, custom-order toggle). Seller dashboard and public shop profile page. |
| **3** | Buyer Experience | Homepage, catalog with category/price filters and search, product detail pages with image gallery, cart functionality. |
| **4** | Checkout & Orders | Checkout flow with **simulated payment** + COD. Order lifecycle (pending → shipped → delivered). Custom order request-quote-approve-pay flow. Seller/buyer order views. |
| **5** | Admin & IP System | Admin panel (listing approval, order overview, analytics). IP reporting portal with takedown actions and three-strikes tracking. Mobile responsiveness pass. Transactional emails. |
| **6** | Test & Launch | End-to-end testing of all flows. Onboard 10–15 real sellers with 50+ listings. Legal pages (ToS, Privacy, IP, Refund). Analytics setup. Soft launch to 50–100 invited buyers. |

**Risk buffers:** Since payments are simulated, gateway approval risk is removed from the MVP entirely. The custom order flow is the riskiest feature; if it slips, the core buy/sell loop works independently and it can be added in week 7.

**Post-MVP priorities (weeks 7–12):** real Safepay payment integration, reviews and ratings, courier API integration, wishlist, seller analytics, referral system.

---

## 13. Go-To-Market Strategy

Marketplaces face a chicken-and-egg problem: sellers won't come without buyers, and buyers won't come without products. **Seed the supply side first.**

### Seller Acquisition

- **Direct Instagram outreach:** search niche hashtags (#PakistaniArt, #HandmadeInPakistan, #CalligraphyPK), build a list of 200–300 active artists, and send personalized DMs offering early access with zero commission for 3–6 months and a permanent "founding seller" badge.
- **University art societies:** partner with NCA, IVS, NUST, LUMS, BNU art communities for launch events and free portfolio onboarding.
- **Existing communities:** post in "Handmade in Pakistan" Facebook groups and WhatsApp selling groups.
- **Institutional networks:** tap Vceela and SMEDA artisan clusters via showcases and onboarding workshops.

### Buyer Acquisition

- **Organic content marketing** on Instagram and TikTok: behind-the-scenes maker videos, styled product photography, "meet the maker" stories.
- **Occasion-based gifting collections:** Eid, weddings, Valentine's, housewarming — promoted 3–4 weeks ahead.
- **Micro-influencer gifting:** 15–20 lifestyle/home-decor micro-influencers (10K–50K followers).
- **Referral program** from day one.
- **Corporate gifting outreach** to HR departments for Eid and year-end gifting.

### The Flywheel

Every seller brings their existing followers; every buyer who shares creates social proof; every good review builds trust. Manual acquisition in months 1–6, then paid Instagram/Meta ads in months 6–12 once conversion data exists. Avoid broad-reach channels (billboards, TV, generic Google Ads) early — target buyers live on Instagram and TikTok.

---

## 14. Scalability & Growth Roadmap

The marketplace scales through **network effects** — more sellers attract more buyers and vice versa.

| Phase | Key Milestones |
|---|---|
| **0–6 Mo** | Build and launch MVP with custom order flow (simulated payments). Onboard 50–100 sellers. Focus on 1–2 cities. Target: 500 completed transactions. |
| **6–12 Mo** | Real Safepay integration. Scale to 500+ sellers. Add reviews, wishlists, recommendations. Premium seller tier. Instagram ads and art-community partnerships. |
| **12–18 Mo** | Expand categories. Launch mobile app/PWA. Seller analytics and marketing tools. Partner with art exhibitions and universities. |
| **18–24 Mo** | Advertising revenue. B2B corporate gifting vertical. International shipping for diaspora buyers. Position as a master export conduit bypassing Etsy/Payoneer barriers. |

**Expansion directions:** broader handmade categories (vintage, custom services), geographic expansion to South Asia and the Middle Eastern diaspora, auction capabilities, and subscription boxes.

---

## Key MVP Decisions (Locked)

- **Seller verification:** Google authentication only. No CNIC verification in the MVP.
- **Payments:** Simulated in the MVP — no live gateway integration. Real Safepay integration is a post-MVP (6–12 month) task.

# Deployment Guide — Dastkar

The MVP is feature-complete and runs locally. Going live is the one part that needs your accounts and a few decisions. This is the step-by-step.

## Architecture in production
- **Web** (React/Vite) → **Vercel** (static build)
- **API** (Express) → **Railway** (Node service)
- **Database + Auth + Storage** → **Supabase** (already provisioned)

---

## 1. Prep the database (already done for dev)
Migrations `0001`–`0005` are already applied to your Supabase project, RLS is on, categories + the `product-images` storage bucket exist. For a *fresh* production project, run the five files in `apps/api/src/db/migrations/` in order via the SQL editor.

## 2. Deploy the API to Railway
1. Push this repo to GitHub.
2. Railway → New Project → Deploy from GitHub → pick the repo.
3. Set **Root Directory** to `apps/api`.
4. Build command: `npm install` · Start command: `npm start`.
5. Add environment variables (from `apps/api/.env`):
   - `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `SUPABASE_JWKS_URL`
   - `NODE_ENV=production`
   - **Do NOT set `ALLOW_DEV_AUTH`** in production (dev-auth must be off).
6. Deploy. Note the public URL, e.g. `https://dastkar-api.up.railway.app`.
7. Verify: open `<url>/health` → `{"status":"ok","supabaseConfigured":true,"devAuth":false}`.

## 3. Deploy the web app to Vercel
1. Vercel → New Project → import the repo.
2. **Root Directory** `apps/web`. Framework preset: Vite.
3. Environment variables:
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your **publishable** key
   - `VITE_API_BASE_URL` = the Railway API URL from step 2
4. Add a SPA rewrite so client routes work on refresh — create `apps/web/vercel.json`:
   ```json
   { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
   ```
5. Deploy. Note the URL, e.g. `https://dastkar.vercel.app`.

## 4. Point Google OAuth + Supabase at production
1. **Google Cloud Console** → your OAuth client → add authorized JavaScript origin `https://dastkar.vercel.app` (redirect URI stays the Supabase `/auth/v1/callback`).
2. **Supabase** → Authentication → URL Configuration → set Site URL to the Vercel URL and add `https://dastkar.vercel.app/**` to redirect URLs.

## 5. CORS (if needed)
The API currently allows all origins (`cors()`), which is fine for launch. To lock it down, restrict `cors({ origin: 'https://dastkar.vercel.app' })` in `apps/api/src/index.js`.

## 6. Real email (optional, post-launch)
`sendEmail()` in `apps/api/src/services/emailService.js` is console-stubbed. To send real mail, set `EMAIL_PROVIDER_API_KEY` and implement the provider call (e.g. Resend) in that one function — every notification already routes through it.

---

## Post-launch checklist
- [ ] Seed real seller accounts + listings (ops task)
- [ ] Replace placeholder legal copy in `apps/web/src/pages/Legal.jsx` with lawyer-reviewed text
- [ ] Wire a real analytics sink in `apps/web/src/lib/analytics.js` (currently console)
- [ ] Real payment gateway (Safepay) — swap `mockPaymentService`, the seam is isolated
- [ ] Set a spend/usage alert on Supabase

## What stays simulated in the MVP (by design)
Payments are mock (Success/Fail), courier tracking is manual entry. Both are intentional MVP decisions with clean swap points for later.

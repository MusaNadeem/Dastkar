// Supabase clients. The service-role client bypasses RLS and MUST stay server-side only.
// Boot is resilient: if env vars are missing the server still starts (health check works),
// and DB routes return a clean 503 via the requireSupabase middleware.
import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

// Node < 22 has no global WebSocket; supabase-js builds a realtime client eagerly at
// createClient time. We don't use realtime, but the constructor still needs the global.
if (!globalThis.WebSocket) globalThis.WebSocket = WebSocket;

const url = process.env.SUPABASE_URL;
// Supabase's new API keys (sb_publishable_ / sb_secret_) replace anon / service_role.
// Prefer the new names, fall back to the legacy ones.
const anonKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

export const SUPABASE_CONFIGURED = Boolean(url && serviceRoleKey);

// Placeholders keep createClient from throwing at import time when unconfigured.
const safeUrl = url || 'http://127.0.0.1:54321';
const safeAnon = anonKey || 'anon-placeholder';
const safeService = serviceRoleKey || 'service-placeholder';

const baseAuth = { autoRefreshToken: false, persistSession: false };

// Service-role client — full access, admin/server operations. Never expose to the frontend.
export const supabaseAdmin = createClient(safeUrl, safeService, { auth: baseAuth });

// Request-scoped client carrying the caller's JWT so RLS applies (used for auth verification).
export function supabaseForToken(token) {
  return createClient(safeUrl, safeAnon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: baseAuth,
  });
}

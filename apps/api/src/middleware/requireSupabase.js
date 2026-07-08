// Guards every DB-backed route: if Supabase env vars are not set, return a clear 503
// instead of letting queries fail with cryptic errors.
import { SUPABASE_CONFIGURED } from '../db/client.js';

export function requireSupabase(_req, res, next) {
  if (!SUPABASE_CONFIGURED) {
    return res.status(503).json({
      error:
        'Supabase is not configured. Set SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY in apps/api/.env',
    });
  }
  next();
}

// Guards every DB-backed route: if Supabase env vars are not set, return a clear 503
// instead of letting queries fail with cryptic errors.
import { SUPABASE_CONFIGURED } from '../db/client.js';

export function requireSupabase(_req, res, next) {
  if (!SUPABASE_CONFIGURED) {
    return res.status(503).json({
      error:
        'Supabase is not configured. Set SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, and SUPABASE_SECRET_KEY.',
    });
  }
  next();
}

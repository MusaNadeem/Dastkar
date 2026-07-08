// Verifies the caller and attaches req.user = { id, email, role }.
// Two paths:
//   1. Dev-auth (testing only, hard-gated): trust an `x-dev-user-id` header.
//   2. Real: verify the Supabase Google JWT, then load the role from public.users.
import { supabaseAdmin, supabaseForToken } from '../db/client.js';
import { isDevAuth } from '../lib/devMode.js';

async function loadRole(userId) {
  const { data } = await supabaseAdmin.from('users').select('role').eq('id', userId).single();
  return data?.role ?? 'buyer';
}

export async function requireAuth(req, res, next) {
  try {
    // --- Dev-auth bypass (never in production) ---
    if (isDevAuth()) {
      const devId = req.headers['x-dev-user-id'];
      if (devId) {
        const { data: profile, error } = await supabaseAdmin
          .from('users')
          .select('id, email, role')
          .eq('id', devId)
          .single();
        if (error || !profile) {
          return res.status(401).json({ error: 'Dev user not found. Run: npm run seed:dev' });
        }
        req.user = { id: profile.id, email: profile.email, role: profile.role };
        return next();
      }
    }

    // --- Real Supabase JWT path ---
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing bearer token' });

    const { data, error } = await supabaseForToken(token).auth.getUser();
    if (error || !data?.user) return res.status(401).json({ error: 'Invalid or expired token' });

    req.token = token;
    req.user = { id: data.user.id, email: data.user.email, role: await loadRole(data.user.id) };
    next();
  } catch (err) {
    next(err);
  }
}

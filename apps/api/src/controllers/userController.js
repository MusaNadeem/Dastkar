import { supabaseAdmin } from '../db/client.js';
import { toCamel } from '../lib/case.js';
import { roleSchema } from '../validation/schemas.js';

// GET /api/users/me
export async function me(req, res) {
  const { data } = await supabaseAdmin
    .from('users')
    .select('id, email, full_name, role, created_at')
    .eq('id', req.user.id)
    .single();
  // Row may not exist yet on first login; fall back to the token identity.
  res.json({ user: toCamel(data) || { ...req.user } });
}

// POST /api/users/role  { role: 'buyer' | 'seller' }
export async function setRole(req, res) {
  const { role } = roleSchema.parse(req.body);
  const { data, error } = await supabaseAdmin
    .from('users')
    .upsert({ id: req.user.id, email: req.user.email, role }, { onConflict: 'id' })
    .select('id, email, full_name, role, created_at')
    .single();
  if (error) throw error;
  res.json({ user: toCamel(data) });
}

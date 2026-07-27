import { supabaseAdmin } from '../db/client.js';
import { toCamel } from '../lib/case.js';
import { roleSchema } from '../validation/schemas.js';

// GET /api/users/me — includes hasProfile so the frontend knows whether the user has
// completed onboarding (chosen a role) or still needs the role-selection screen.
export async function me(req, res) {
  const { data } = await supabaseAdmin
    .from('users')
    .select('id, email, full_name, role, created_at')
    .eq('id', req.user.id)
    .maybeSingle();
  res.json({ user: toCamel(data) || { ...req.user }, hasProfile: Boolean(data) });
}

// POST /api/users/role  { role: 'buyer' | 'seller' } — creates/updates the profile row.
export async function setRole(req, res) {
  const { role } = roleSchema.parse(req.body);
  const row = { id: req.user.id, email: req.user.email, role };
  if (req.user.fullName) row.full_name = req.user.fullName;

  const { data, error } = await supabaseAdmin
    .from('users')
    .upsert(row, { onConflict: 'id' })
    .select('id, email, full_name, role, created_at')
    .single();
  if (error) throw error;
  res.json({ user: toCamel(data) });
}

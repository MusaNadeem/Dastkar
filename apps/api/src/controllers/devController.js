import { supabaseAdmin } from '../db/client.js';
import { toCamel } from '../lib/case.js';
import { isDevAuth } from '../lib/devMode.js';

// GET /api/dev/users — dev-only. Lets the test panel pick which seeded user to act as.
export async function listDevUsers(_req, res) {
  if (!isDevAuth()) return res.status(404).json({ error: 'Not found' });
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, email, full_name, role')
    .order('role', { ascending: true });
  if (error) throw error;
  res.json({ users: toCamel(data || []) });
}

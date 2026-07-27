import { supabaseAdmin } from '../db/client.js';
import { toCamel } from '../lib/case.js';

// GET /api/categories (public)
export async function listCategories(_req, res) {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('id, name')
    .order('name');
  if (error) throw error;
  res.json({ categories: toCamel(data || []) });
}

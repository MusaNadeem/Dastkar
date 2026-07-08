import { supabaseAdmin } from '../db/client.js';
import { toCamel } from '../lib/case.js';

// GET /api/admin/products/pending
export async function pendingProducts(_req, res) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*, shops(id, name)')
    .eq('status', 'pending_review')
    .order('created_at', { ascending: true });
  if (error) throw error;
  res.json({ products: toCamel(data || []) });
}

async function setStatus(id, status) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .update({ status })
    .eq('id', id)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data;
}

// POST /api/admin/products/:id/approve
export async function approveProduct(req, res) {
  const product = await setStatus(req.params.id, 'approved');
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ product: toCamel(product) });
}

// POST /api/admin/products/:id/reject
export async function rejectProduct(req, res) {
  const product = await setStatus(req.params.id, 'rejected');
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ product: toCamel(product) });
}

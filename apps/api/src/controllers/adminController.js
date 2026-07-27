import { supabaseAdmin } from '../db/client.js';
import { toCamel } from '../lib/case.js';
import { adminShopStatusSchema } from '../validation/schemas.js';

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

async function setProductStatus(id, status) {
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
  const product = await setProductStatus(req.params.id, 'approved');
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ product: toCamel(product) });
}

// POST /api/admin/products/:id/reject
export async function rejectProduct(req, res) {
  const product = await setProductStatus(req.params.id, 'rejected');
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ product: toCamel(product) });
}

// Count helper: prefer the exact count, fall back to row length.
async function countOf(table, apply) {
  let q = supabaseAdmin.from(table).select('id', { count: 'exact' });
  if (apply) q = apply(q);
  const { count, data } = await q;
  return count ?? (data || []).length;
}

// GET /api/admin/analytics — platform health numbers.
export async function analytics(_req, res) {
  const REAL_SALES = ['confirmed', 'shipped', 'delivered'];
  const sellers = await countOf('shops');
  const products = await countOf('products');
  const approvedProducts = await countOf('products', (q) => q.eq('status', 'approved'));
  const orders = await countOf('orders', (q) => q.in('order_status', REAL_SALES));

  const { data: gmvRows } = await supabaseAdmin
    .from('orders')
    .select('total_amount')
    .in('order_status', REAL_SALES);
  const gmv = (gmvRows || []).reduce((sum, o) => sum + Number(o.total_amount), 0);

  res.json({ sellers, products, approvedProducts, orders, gmv });
}

// GET /api/admin/shops — all shops with status + strikes + owner.
export async function listShops(_req, res) {
  const { data, error } = await supabaseAdmin
    .from('shops')
    .select('id, name, status, strike_count, created_at, user_id, users(email, full_name)')
    .order('created_at', { ascending: true });
  if (error) throw error;
  res.json({ shops: toCamel(data || []) });
}

// POST /api/admin/shops/:id/status — manual suspend/ban/reactivate override.
export async function setShopStatus(req, res) {
  const { status } = adminShopStatusSchema.parse(req.body);
  const { data, error } = await supabaseAdmin
    .from('shops')
    .update({ status })
    .eq('id', req.params.id)
    .select('id, name, status, strike_count')
    .maybeSingle();
  if (error) throw error;
  if (!data) return res.status(404).json({ error: 'Shop not found' });
  res.json({ shop: toCamel(data) });
}

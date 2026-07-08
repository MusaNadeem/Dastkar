import { supabaseAdmin } from '../db/client.js';
import { toCamel } from '../lib/case.js';
import { productCreateSchema, productUpdateSchema } from '../validation/schemas.js';

// Fetch a product with its owning shop's user_id, for ownership checks.
async function findProductWithOwner(id) {
  const { data } = await supabaseAdmin
    .from('products')
    .select('*, shops(user_id, name)')
    .eq('id', id)
    .maybeSingle();
  return data;
}

async function sellerShop(userId) {
  const { data } = await supabaseAdmin
    .from('shops')
    .select('id, status')
    .eq('user_id', userId)
    .maybeSingle();
  return data;
}

// POST /api/products  (seller)
export async function createProduct(req, res) {
  const body = productCreateSchema.parse(req.body);
  const shop = await sellerShop(req.user.id);
  if (!shop) return res.status(400).json({ error: 'Create your shop first' });

  const { data, error } = await supabaseAdmin
    .from('products')
    .insert({
      shop_id: shop.id,
      title: body.title,
      description: body.description ?? null,
      price: body.price,
      stock_quantity: body.stockQuantity,
      category_id: body.categoryId ?? null,
      custom_orders_enabled: body.customOrdersEnabled,
      image_urls: body.imageUrls,
    })
    .select('*')
    .single();
  if (error) throw error;
  res.status(201).json({ product: toCamel(data) });
}

// PATCH /api/products/:id  (seller, owner only)
export async function updateProduct(req, res) {
  const body = productUpdateSchema.parse(req.body);
  const product = await findProductWithOwner(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  if (product.shops.user_id !== req.user.id) return res.status(403).json({ error: 'Not your product' });

  const patch = {};
  if (body.title !== undefined) patch.title = body.title;
  if (body.description !== undefined) patch.description = body.description;
  if (body.price !== undefined) patch.price = body.price;
  if (body.stockQuantity !== undefined) patch.stock_quantity = body.stockQuantity;
  if (body.categoryId !== undefined) patch.category_id = body.categoryId;
  if (body.customOrdersEnabled !== undefined) patch.custom_orders_enabled = body.customOrdersEnabled;
  if (body.imageUrls !== undefined) patch.image_urls = body.imageUrls;

  const { data, error } = await supabaseAdmin
    .from('products')
    .update(patch)
    .eq('id', req.params.id)
    .select('*')
    .single();
  if (error) throw error;
  res.json({ product: toCamel(data) });
}

// DELETE /api/products/:id  (seller, owner only)
export async function deleteProduct(req, res) {
  const product = await findProductWithOwner(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  if (product.shops.user_id !== req.user.id) return res.status(403).json({ error: 'Not your product' });

  const { error } = await supabaseAdmin.from('products').delete().eq('id', req.params.id);
  if (error) throw error;
  res.json({ ok: true });
}

// GET /api/products  (public) — approved listings, newest first.
export async function listProducts(_req, res) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*, shops(id, name)')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(60);
  if (error) throw error;
  res.json({ products: toCamel(data || []) });
}

// GET /api/products/mine  (seller) — all statuses for the seller's shop.
export async function myProducts(req, res) {
  const shop = await sellerShop(req.user.id);
  if (!shop) return res.json({ products: [] });
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('shop_id', shop.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  res.json({ products: toCamel(data || []) });
}

// GET /api/products/:id  (public) — approved only.
export async function getProduct(req, res) {
  const { data } = await supabaseAdmin
    .from('products')
    .select('*, shops(id, name, bio, profile_image_url)')
    .eq('id', req.params.id)
    .eq('status', 'approved')
    .maybeSingle();
  if (!data) return res.status(404).json({ error: 'Product not found' });
  res.json({ product: toCamel(data) });
}

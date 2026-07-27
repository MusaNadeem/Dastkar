import { supabaseAdmin } from '../db/client.js';
import { toCamel } from '../lib/case.js';
import { productCreateSchema, productUpdateSchema, catalogQuerySchema } from '../validation/schemas.js';

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

// GET /api/products  (public) — catalog: filter, search, sort, paginate. Approved only.
// Query params: q, categoryId, minPrice, maxPrice, sort, page, pageSize.
export async function listProducts(req, res) {
  const raw = Object.fromEntries(Object.entries(req.query).filter(([, v]) => v !== ''));
  const { q, categoryId, minPrice, maxPrice, sort, page, pageSize } = catalogQuerySchema.parse(raw);

  // shops!inner + status filter hides listings from suspended/banned shops.
  let query = supabaseAdmin
    .from('products')
    .select('*, shops!inner(id, name, status)', { count: 'exact' })
    .eq('status', 'approved')
    .eq('shops.status', 'active');

  if (categoryId) query = query.eq('category_id', categoryId);
  if (minPrice !== undefined) query = query.gte('price', minPrice);
  if (maxPrice !== undefined) query = query.lte('price', maxPrice);
  if (q) {
    // Strip characters that would break the PostgREST or() grammar; we add our own wildcards.
    const safe = q.replace(/[,()%*]/g, ' ').trim();
    if (safe) query = query.or(`title.ilike.%${safe}%,description.ilike.%${safe}%`);
  }

  if (sort === 'price_asc') query = query.order('price', { ascending: true });
  else if (sort === 'price_desc') query = query.order('price', { ascending: false });
  else query = query.order('created_at', { ascending: false });

  const from = (page - 1) * pageSize;
  query = query.range(from, from + pageSize - 1);

  const { data, count, error } = await query;
  if (error) throw error;
  res.json({ products: toCamel(data || []), page, pageSize, total: count ?? 0 });
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
    .select('*, shops(id, name, user_id, bio, profile_image_url)')
    .eq('id', req.params.id)
    .eq('status', 'approved')
    .maybeSingle();
  if (!data) return res.status(404).json({ error: 'Product not found' });
  res.json({ product: toCamel(data) });
}

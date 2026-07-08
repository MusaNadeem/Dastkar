import { supabaseAdmin } from '../db/client.js';
import { toCamel } from '../lib/case.js';
import { shopSchema } from '../validation/schemas.js';

const SHOP_COLS = 'id, user_id, name, bio, profile_image_url, status, strike_count, ip_declaration_accepted, created_at';

// POST /api/shops  (seller) — one shop per seller.
export async function createShop(req, res) {
  const body = shopSchema.parse(req.body);

  const { data: existing } = await supabaseAdmin
    .from('shops')
    .select('id')
    .eq('user_id', req.user.id)
    .maybeSingle();
  if (existing) return res.status(409).json({ error: 'You already have a shop' });

  const { data, error } = await supabaseAdmin
    .from('shops')
    .insert({
      user_id: req.user.id,
      name: body.name,
      bio: body.bio ?? null,
      profile_image_url: body.profileImageUrl ?? null,
      ip_declaration_accepted: true,
    })
    .select(SHOP_COLS)
    .single();
  if (error) throw error;
  res.status(201).json({ shop: toCamel(data) });
}

// GET /api/shops/mine  (seller)
export async function myShop(req, res) {
  const { data } = await supabaseAdmin
    .from('shops')
    .select(SHOP_COLS)
    .eq('user_id', req.user.id)
    .maybeSingle();
  res.json({ shop: toCamel(data) });
}

// GET /api/shops/:id  (public) — shop + its approved products.
export async function getShop(req, res) {
  const { data: shop } = await supabaseAdmin
    .from('shops')
    .select(SHOP_COLS)
    .eq('id', req.params.id)
    .maybeSingle();
  if (!shop) return res.status(404).json({ error: 'Shop not found' });

  const { data: products } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('shop_id', shop.id)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  res.json({ shop: toCamel(shop), products: toCamel(products || []) });
}

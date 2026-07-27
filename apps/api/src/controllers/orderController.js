import { supabaseAdmin } from '../db/client.js';
import { toCamel } from '../lib/case.js';
import { orderCreateSchema, paySchema, shipSchema } from '../validation/schemas.js';
import { charge } from '../services/mockPaymentService.js';
import { logMoneyEvent } from '../services/auditService.js';
import { sendEmail } from '../services/emailService.js';

async function sellerShopId(userId) {
  const { data } = await supabaseAdmin.from('shops').select('id').eq('user_id', userId).maybeSingle();
  return data?.id || null;
}

async function emailOf(userId) {
  const { data } = await supabaseAdmin.from('users').select('email').eq('id', userId).maybeSingle();
  return data?.email || null;
}

// Best-effort stock decrement. MVP-level (re-reads to shrink the race window); an atomic
// Postgres RPC is the future hardening step for high concurrency.
async function decrementStock(entries) {
  for (const { productId, quantity } of entries) {
    const { data: fresh } = await supabaseAdmin
      .from('products')
      .select('stock_quantity')
      .eq('id', productId)
      .single();
    const next = Math.max(0, (fresh?.stock_quantity ?? 0) - quantity);
    await supabaseAdmin.from('products').update({ stock_quantity: next }).eq('id', productId);
  }
}

// POST /api/orders  (any authenticated buyer)
// COD -> confirmed immediately + stock decremented. Simulated -> pending, awaiting /pay.
export async function createOrder(req, res) {
  const body = orderCreateSchema.parse(req.body);

  // Merge duplicate product lines so quantities can't be split to dodge the stock check.
  const merged = new Map();
  for (const it of body.items) merged.set(it.productId, (merged.get(it.productId) || 0) + it.quantity);
  const wanted = [...merged.entries()].map(([productId, quantity]) => ({ productId, quantity }));

  const { data: products, error: perr } = await supabaseAdmin
    .from('products')
    .select('id, price, stock_quantity, status, title')
    .in('id', wanted.map((w) => w.productId));
  if (perr) throw perr;
  const byId = new Map((products || []).map((p) => [p.id, p]));

  let total = 0;
  const lines = [];
  for (const { productId, quantity } of wanted) {
    const p = byId.get(productId);
    if (!p) return res.status(400).json({ error: `Product not found: ${productId}` });
    if (p.status !== 'approved') return res.status(400).json({ error: `Not available: ${p.title}` });
    if (p.stock_quantity < quantity)
      return res.status(400).json({ error: `Not enough stock for ${p.title} (have ${p.stock_quantity})` });
    const priceAtPurchase = Number(p.price); // snapshot current price, server-side
    total += priceAtPurchase * quantity;
    lines.push({ productId, quantity, priceAtPurchase });
  }

  const isCod = body.paymentMethod === 'cod';

  const { data: order, error: oerr } = await supabaseAdmin
    .from('orders')
    .insert({
      buyer_id: req.user.id,
      total_amount: total,
      shipping_address: body.shippingAddress,
      payment_method: body.paymentMethod,
      payment_status: 'pending',
      order_status: isCod ? 'confirmed' : 'pending',
    })
    .select('*')
    .single();
  if (oerr) throw oerr;

  const { data: items, error: ierr } = await supabaseAdmin
    .from('order_items')
    .insert(lines.map((l) => ({
      order_id: order.id,
      product_id: l.productId,
      quantity: l.quantity,
      price_at_purchase: l.priceAtPurchase,
    })))
    .select('*');
  if (ierr) throw ierr;

  if (isCod) await decrementStock(lines);

  await logMoneyEvent({
    entity: 'orders',
    entityId: order.id,
    action: 'order_created',
    amount: total,
    actorId: req.user.id,
    detail: { paymentMethod: body.paymentMethod, orderStatus: order.order_status, lines: lines.length },
  });

  if (isCod) {
    sendEmail({ to: req.user.email, subject: 'Your Dastkar order is confirmed', body: `Order ${order.id} confirmed. Total Rs ${total}. Payment: Cash on Delivery.` }).catch(() => {});
  }

  res.status(201).json({ order: toCamel(order), items: toCamel(items) });
}

// POST /api/orders/:id/pay  (buyer/owner) — simulated gateway. { outcome: success | fail }
export async function payOrder(req, res) {
  const { outcome } = paySchema.parse(req.body);

  const { data: order } = await supabaseAdmin.from('orders').select('*').eq('id', req.params.id).maybeSingle();
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.buyer_id !== req.user.id) return res.status(403).json({ error: 'Not your order' });
  if (order.payment_method !== 'simulated_digital')
    return res.status(409).json({ error: 'Order is not a digital-payment order' });
  if (order.payment_status !== 'pending')
    return res.status(409).json({ error: `Payment already ${order.payment_status}` });

  const result = await charge({
    orderId: order.id,
    amount: Number(order.total_amount),
    outcome,
    actorId: req.user.id,
  });

  const update = result.paid
    ? { payment_status: 'paid', order_status: 'confirmed' }
    : { payment_status: 'failed', order_status: 'cancelled' };

  const { data: updated, error } = await supabaseAdmin
    .from('orders')
    .update(update)
    .eq('id', order.id)
    .select('*')
    .single();
  if (error) throw error;

  if (result.paid) {
    const { data: its } = await supabaseAdmin
      .from('order_items')
      .select('product_id, quantity')
      .eq('order_id', order.id);
    await decrementStock((its || []).map((i) => ({ productId: i.product_id, quantity: i.quantity })));
    sendEmail({ to: req.user.email, subject: 'Your Dastkar order is confirmed', body: `Payment received. Order ${order.id} confirmed. Total Rs ${order.total_amount}.` }).catch(() => {});
  }

  res.json({ order: toCamel(updated), paid: result.paid });
}

// GET /api/orders/mine  (buyer)
export async function myOrders(req, res) {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(*, products(id, title, image_urls))')
    .eq('buyer_id', req.user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  res.json({ orders: toCamel(data || []) });
}

// GET /api/orders/incoming  (seller) — orders containing this seller's products.
export async function incomingOrders(req, res) {
  const shopId = await sellerShopId(req.user.id);
  if (!shopId) return res.json({ orders: [] });

  const { data, error } = await supabaseAdmin
    .from('order_items')
    .select('*, products!inner(id, title, shop_id), orders!inner(*)')
    .eq('products.shop_id', shopId);
  if (error) throw error;

  const byOrder = new Map();
  for (const row of data || []) {
    const order = row.orders;
    if (!['confirmed', 'shipped', 'delivered'].includes(order.order_status)) continue;
    if (!byOrder.has(order.id)) byOrder.set(order.id, { ...order, items: [] });
    byOrder.get(order.id).items.push({
      id: row.id,
      product_id: row.product_id,
      quantity: row.quantity,
      price_at_purchase: row.price_at_purchase,
      title: row.products.title,
    });
  }
  const orders = [...byOrder.values()].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json({ orders: toCamel(orders) });
}

// POST /api/orders/:id/ship  (seller) — requires a tracking number; only from 'confirmed'.
export async function shipOrder(req, res) {
  const { trackingNumber } = shipSchema.parse(req.body);
  const shopId = await sellerShopId(req.user.id);
  if (!shopId) return res.status(403).json({ error: 'You have no shop' });

  const { data: order } = await supabaseAdmin.from('orders').select('*').eq('id', req.params.id).maybeSingle();
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const { data: owns } = await supabaseAdmin
    .from('order_items')
    .select('id, products!inner(shop_id)')
    .eq('order_id', order.id)
    .eq('products.shop_id', shopId)
    .limit(1);
  if (!owns || owns.length === 0)
    return res.status(403).json({ error: 'No items from your shop in this order' });

  if (order.order_status !== 'confirmed')
    return res.status(409).json({ error: `Cannot ship an order that is ${order.order_status}` });

  const { data: updated, error } = await supabaseAdmin
    .from('orders')
    .update({ order_status: 'shipped', tracking_number: trackingNumber })
    .eq('id', order.id)
    .select('*')
    .single();
  if (error) throw error;

  await logMoneyEvent({
    entity: 'orders',
    entityId: order.id,
    action: 'order_shipped',
    amount: Number(order.total_amount),
    actorId: req.user.id,
    detail: { trackingNumber },
  });

  emailOf(order.buyer_id).then((to) => {
    if (to) sendEmail({ to, subject: 'Your Dastkar order has shipped', body: `Order ${order.id} shipped. Tracking: ${trackingNumber}.` }).catch(() => {});
  });

  res.json({ order: toCamel(updated) });
}

// POST /api/orders/:id/deliver  (buyer/owner) — only from 'shipped'.
export async function deliverOrder(req, res) {
  const { data: order } = await supabaseAdmin.from('orders').select('*').eq('id', req.params.id).maybeSingle();
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.buyer_id !== req.user.id) return res.status(403).json({ error: 'Not your order' });
  if (order.order_status !== 'shipped')
    return res.status(409).json({ error: `Cannot confirm delivery on an order that is ${order.order_status}` });

  const { data: updated, error } = await supabaseAdmin
    .from('orders')
    .update({ order_status: 'delivered' })
    .eq('id', order.id)
    .select('*')
    .single();
  if (error) throw error;

  await logMoneyEvent({
    entity: 'orders',
    entityId: order.id,
    action: 'order_delivered',
    amount: Number(order.total_amount),
    actorId: req.user.id,
    detail: {},
  });
  res.json({ order: toCamel(updated) });
}

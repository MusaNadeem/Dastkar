import { supabaseAdmin } from '../db/client.js';
import { toCamel } from '../lib/case.js';
import { logMoneyEvent } from '../services/auditService.js';
import { sendEmail } from '../services/emailService.js';
import {
  customOrderCreateSchema,
  quoteSchema,
  photosSchema,
  revisionSchema,
  customDepositSchema,
  paySchema,
  shipSchema,
} from '../validation/schemas.js';

const DEPOSIT_RATE = 0.4; // 40% deposit, within the 30-50% range
const MAX_REVISIONS = 2;
const round2 = (n) => Math.round(n * 100) / 100;

async function getRequest(id) {
  const { data } = await supabaseAdmin.from('custom_order_requests').select('*').eq('id', id).maybeSingle();
  return data;
}

// POST /api/custom-orders  (buyer)
export async function createRequest(req, res) {
  const body = customOrderCreateSchema.parse(req.body);

  const { data: seller } = await supabaseAdmin
    .from('users')
    .select('id, role, email')
    .eq('id', body.sellerId)
    .maybeSingle();
  if (!seller || seller.role !== 'seller') return res.status(400).json({ error: 'Invalid seller' });
  if (seller.id === req.user.id) return res.status(400).json({ error: 'You cannot commission yourself' });

  const { data, error } = await supabaseAdmin
    .from('custom_order_requests')
    .insert({
      buyer_id: req.user.id,
      seller_id: body.sellerId,
      description: body.description,
      budget_range: body.budgetRange ?? null,
      reference_image_urls: body.referenceImageUrls ?? [],
    })
    .select('*')
    .single();
  if (error) throw error;

  if (seller.email) {
    sendEmail({ to: seller.email, subject: 'New custom order request on Dastkar', body: `A buyer requested a custom piece: "${body.description.slice(0, 120)}". Reply with a quote in your dashboard.` }).catch(() => {});
  }

  res.status(201).json({ request: toCamel(data) });
}

// GET /api/custom-orders/mine  (buyer)
export async function myRequests(req, res) {
  const { data, error } = await supabaseAdmin
    .from('custom_order_requests')
    .select('*')
    .eq('buyer_id', req.user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  res.json({ requests: toCamel(data || []) });
}

// GET /api/custom-orders/incoming  (seller)
export async function incomingRequests(req, res) {
  const { data, error } = await supabaseAdmin
    .from('custom_order_requests')
    .select('*')
    .eq('seller_id', req.user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  res.json({ requests: toCamel(data || []) });
}

// POST /:id/quote  (seller)
export async function quote(req, res) {
  const { quotedPrice } = quoteSchema.parse(req.body);
  const r = await getRequest(req.params.id);
  if (!r) return res.status(404).json({ error: 'Request not found' });
  if (r.seller_id !== req.user.id) return res.status(403).json({ error: 'Not your request' });
  if (r.status !== 'pending') return res.status(409).json({ error: `Cannot quote a request that is ${r.status}` });

  const { data, error } = await supabaseAdmin
    .from('custom_order_requests')
    .update({ quoted_price: quotedPrice, status: 'quoted' })
    .eq('id', r.id)
    .select('*')
    .single();
  if (error) throw error;
  res.json({ request: toCamel(data) });
}

// POST /:id/decline  (seller)
export async function decline(req, res) {
  const r = await getRequest(req.params.id);
  if (!r) return res.status(404).json({ error: 'Request not found' });
  if (r.seller_id !== req.user.id) return res.status(403).json({ error: 'Not your request' });
  if (!['pending', 'quoted'].includes(r.status))
    return res.status(409).json({ error: `Cannot decline a request that is ${r.status}` });

  const { data, error } = await supabaseAdmin
    .from('custom_order_requests')
    .update({ status: 'declined' })
    .eq('id', r.id)
    .select('*')
    .single();
  if (error) throw error;
  res.json({ request: toCamel(data) });
}

// POST /:id/deposit  (buyer) — approve quote + pay deposit + provide address.
export async function payDeposit(req, res) {
  const { outcome, shippingAddress } = customDepositSchema.parse(req.body);
  const r = await getRequest(req.params.id);
  if (!r) return res.status(404).json({ error: 'Request not found' });
  if (r.buyer_id !== req.user.id) return res.status(403).json({ error: 'Not your request' });
  if (r.status !== 'quoted') return res.status(409).json({ error: `Cannot pay deposit when status is ${r.status}` });
  if (!r.quoted_price) return res.status(409).json({ error: 'No quote to pay' });

  const deposit = round2(Number(r.quoted_price) * DEPOSIT_RATE);

  if (outcome !== 'success') {
    await logMoneyEvent({ entity: 'custom_order_requests', entityId: r.id, action: 'deposit_failed', amount: deposit, actorId: req.user.id, detail: { simulated: true } });
    return res.json({ request: toCamel(r), paid: false });
  }

  // Linked order carries the FULL commission price; not shippable until balance is paid.
  const { data: order, error: oerr } = await supabaseAdmin
    .from('orders')
    .insert({
      buyer_id: r.buyer_id,
      total_amount: r.quoted_price,
      shipping_address: shippingAddress,
      payment_method: 'simulated_digital',
      payment_status: 'pending',
      order_status: 'pending',
    })
    .select('*')
    .single();
  if (oerr) throw oerr;

  const { data: updated, error } = await supabaseAdmin
    .from('custom_order_requests')
    .update({ status: 'deposit_paid', order_id: order.id, deposit_amount: deposit })
    .eq('id', r.id)
    .select('*')
    .single();
  if (error) throw error;

  await logMoneyEvent({ entity: 'custom_order_requests', entityId: r.id, action: 'deposit_paid', amount: deposit, actorId: req.user.id, detail: { orderId: order.id, quotedPrice: r.quoted_price } });
  res.json({ request: toCamel(updated), order: toCamel(order), paid: true });
}

// POST /:id/photos  (seller) — { type: progress|final, imageUrls }
export async function uploadPhotos(req, res) {
  const { type, imageUrls } = photosSchema.parse(req.body);
  const r = await getRequest(req.params.id);
  if (!r) return res.status(404).json({ error: 'Request not found' });
  if (r.seller_id !== req.user.id) return res.status(403).json({ error: 'Not your request' });
  if (!['deposit_paid', 'in_progress'].includes(r.status))
    return res.status(409).json({ error: `Cannot upload photos when status is ${r.status}` });

  const col = type === 'progress' ? 'progress_image_urls' : 'final_image_urls';
  const update = { [col]: [...(r[col] || []), ...imageUrls] };
  if (r.status === 'deposit_paid') update.status = 'in_progress';

  const { data, error } = await supabaseAdmin
    .from('custom_order_requests')
    .update(update)
    .eq('id', r.id)
    .select('*')
    .single();
  if (error) throw error;
  res.json({ request: toCamel(data) });
}

// POST /:id/revision  (buyer) — capped at MAX_REVISIONS.
export async function requestRevision(req, res) {
  revisionSchema.parse(req.body ?? {});
  const r = await getRequest(req.params.id);
  if (!r) return res.status(404).json({ error: 'Request not found' });
  if (r.buyer_id !== req.user.id) return res.status(403).json({ error: 'Not your request' });
  if (r.status !== 'in_progress')
    return res.status(409).json({ error: `Can only request a revision while in progress (is ${r.status})` });
  if ((r.final_image_urls || []).length === 0)
    return res.status(409).json({ error: 'No final work to revise yet' });
  if (r.revision_count >= MAX_REVISIONS)
    return res.status(409).json({ error: `Revision limit (${MAX_REVISIONS}) reached` });

  const { data, error } = await supabaseAdmin
    .from('custom_order_requests')
    .update({ revision_count: r.revision_count + 1, final_image_urls: [] })
    .eq('id', r.id)
    .select('*')
    .single();
  if (error) throw error;
  res.json({ request: toCamel(data) });
}

// POST /:id/balance  (buyer) — approve final work + pay balance -> completed.
export async function payBalance(req, res) {
  const { outcome } = paySchema.parse(req.body);
  const r = await getRequest(req.params.id);
  if (!r) return res.status(404).json({ error: 'Request not found' });
  if (r.buyer_id !== req.user.id) return res.status(403).json({ error: 'Not your request' });
  if (r.status !== 'in_progress') return res.status(409).json({ error: `Cannot pay balance when status is ${r.status}` });
  if ((r.final_image_urls || []).length === 0) return res.status(409).json({ error: 'No final work to approve yet' });

  const balance = round2(Number(r.quoted_price) - Number(r.deposit_amount));

  if (outcome !== 'success') {
    await logMoneyEvent({ entity: 'custom_order_requests', entityId: r.id, action: 'balance_failed', amount: balance, actorId: req.user.id, detail: { simulated: true } });
    return res.json({ request: toCamel(r), paid: false });
  }

  // Full amount now paid -> linked order becomes confirmed + shippable.
  await supabaseAdmin.from('orders').update({ payment_status: 'paid', order_status: 'confirmed' }).eq('id', r.order_id);
  const { data, error } = await supabaseAdmin
    .from('custom_order_requests')
    .update({ status: 'completed' })
    .eq('id', r.id)
    .select('*')
    .single();
  if (error) throw error;

  await logMoneyEvent({ entity: 'custom_order_requests', entityId: r.id, action: 'balance_paid', amount: balance, actorId: req.user.id, detail: { orderId: r.order_id } });
  res.json({ request: toCamel(data), paid: true });
}

// POST /:id/ship  (seller) — completed -> shipped (also updates the linked order).
export async function shipCustom(req, res) {
  const { trackingNumber } = shipSchema.parse(req.body);
  const r = await getRequest(req.params.id);
  if (!r) return res.status(404).json({ error: 'Request not found' });
  if (r.seller_id !== req.user.id) return res.status(403).json({ error: 'Not your request' });
  if (r.status !== 'completed') return res.status(409).json({ error: `Cannot ship when status is ${r.status}` });

  await supabaseAdmin.from('orders').update({ order_status: 'shipped', tracking_number: trackingNumber }).eq('id', r.order_id);
  const { data, error } = await supabaseAdmin
    .from('custom_order_requests')
    .update({ status: 'shipped' })
    .eq('id', r.id)
    .select('*')
    .single();
  if (error) throw error;

  await logMoneyEvent({ entity: 'custom_order_requests', entityId: r.id, action: 'custom_shipped', amount: Number(r.quoted_price), actorId: req.user.id, detail: { orderId: r.order_id, trackingNumber } });
  res.json({ request: toCamel(data) });
}

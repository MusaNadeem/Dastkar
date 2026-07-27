import { supabaseAdmin } from '../db/client.js';
import { toCamel } from '../lib/case.js';
import { logMoneyEvent } from '../services/auditService.js';
import { ipReportSchema, counterNoticeSchema } from '../validation/schemas.js';

// Product -> its shop (id, user_id, strike_count, status).
async function productShop(productId) {
  const { data } = await supabaseAdmin
    .from('products')
    .select('id, shop_id, shops(id, user_id, strike_count, status)')
    .eq('id', productId)
    .maybeSingle();
  return data;
}

// POST /api/ip-reports  (public — anyone can report)
export async function createReport(req, res) {
  const body = ipReportSchema.parse(req.body);

  const { data: product } = await supabaseAdmin
    .from('products')
    .select('id')
    .eq('id', body.reportedProductId)
    .maybeSingle();
  if (!product) return res.status(404).json({ error: 'Reported product not found' });

  const { data, error } = await supabaseAdmin
    .from('ip_reports')
    .insert({
      reporter_name: body.reporterName,
      reporter_email: body.reporterEmail,
      reported_product_id: body.reportedProductId,
      reason: body.reason,
      evidence_url: body.evidenceUrl ?? null,
    })
    .select('*')
    .single();
  if (error) throw error;
  res.status(201).json({ report: toCamel(data) });
}

// GET /api/ip-reports  (admin) — queue, open first.
export async function listReports(_req, res) {
  const { data, error } = await supabaseAdmin
    .from('ip_reports')
    .select('*, products(id, title, status, shops(id, name, strike_count, status))')
    .order('created_at', { ascending: false });
  if (error) throw error;
  const order = { open: 0, resolved: 1, dismissed: 2 };
  const sorted = (data || []).sort((a, b) => (order[a.status] - order[b.status]));
  res.json({ reports: toCamel(sorted) });
}

// POST /api/ip-reports/:id/takedown  (admin) — hide product + strike + three-strikes.
export async function takedown(req, res) {
  const { data: report } = await supabaseAdmin.from('ip_reports').select('*').eq('id', req.params.id).maybeSingle();
  if (!report) return res.status(404).json({ error: 'Report not found' });
  if (report.status !== 'open') return res.status(409).json({ error: `Report already ${report.status}` });

  const ps = await productShop(report.reported_product_id);
  if (!ps || !ps.shops) return res.status(404).json({ error: 'Product/shop not found' });
  const shop = ps.shops;

  // Take the listing down.
  await supabaseAdmin.from('products').update({ status: 'rejected' }).eq('id', ps.id);

  // Increment strike, then apply the three-strikes ladder.
  const strikes = (shop.strike_count || 0) + 1;
  let shopStatus = shop.status;
  if (strikes >= 3) shopStatus = 'banned';
  else if (strikes === 2) shopStatus = 'suspended';
  // strike 1: warning only, status unchanged.
  await supabaseAdmin.from('shops').update({ strike_count: strikes, status: shopStatus }).eq('id', shop.id);

  const { data: updated, error } = await supabaseAdmin
    .from('ip_reports')
    .update({ status: 'resolved' })
    .eq('id', report.id)
    .select('*')
    .single();
  if (error) throw error;

  await logMoneyEvent({
    entity: 'ip_reports',
    entityId: report.id,
    action: 'takedown',
    amount: 0,
    actorId: req.user.id,
    detail: { productId: ps.id, shopId: shop.id, strikes, shopStatus },
  });

  res.json({ report: toCamel(updated), shop: { id: shop.id, strikeCount: strikes, status: shopStatus } });
}

// POST /api/ip-reports/:id/dismiss  (admin)
export async function dismiss(req, res) {
  const { data: report } = await supabaseAdmin.from('ip_reports').select('*').eq('id', req.params.id).maybeSingle();
  if (!report) return res.status(404).json({ error: 'Report not found' });
  if (report.status !== 'open') return res.status(409).json({ error: `Report already ${report.status}` });

  const { data, error } = await supabaseAdmin
    .from('ip_reports')
    .update({ status: 'dismissed' })
    .eq('id', report.id)
    .select('*')
    .single();
  if (error) throw error;
  res.json({ report: toCamel(data) });
}

// POST /api/ip-reports/:id/counter-notice  (seller who owns the reported product)
export async function counterNotice(req, res) {
  const { counterNotice: text } = counterNoticeSchema.parse(req.body);

  const { data: report } = await supabaseAdmin.from('ip_reports').select('*').eq('id', req.params.id).maybeSingle();
  if (!report) return res.status(404).json({ error: 'Report not found' });

  const ps = await productShop(report.reported_product_id);
  if (!ps || ps.shops?.user_id !== req.user.id) return res.status(403).json({ error: 'Not your listing' });
  if (report.status !== 'resolved')
    return res.status(409).json({ error: 'Can only contest a report that led to a takedown' });

  const { data, error } = await supabaseAdmin
    .from('ip_reports')
    .update({ disputed: true, counter_notice: text, status: 'open' })
    .eq('id', report.id)
    .select('*')
    .single();
  if (error) throw error;
  res.json({ report: toCamel(data) });
}

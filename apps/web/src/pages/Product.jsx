// Screen 05 — Product detail. Wired to GET /api/products/:id.
import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../lib/apiClient.js';
import { money } from '../lib/format.js';
import { track } from '../lib/analytics.js';
import { useCart } from '../context/CartContext.jsx';

const initials = (name) => (name || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const [p, setP] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [active, setActive] = useState(0);
  const [toast, setToast] = useState(null);
  const [reporting, setReporting] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    api
      .get(`/api/products/${id}`)
      .then((r) => setP(r.product))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(null), 1800); };

  if (loading) {
    return (
      <div className="wrap" style={{ paddingBlock: 20, maxWidth: 720 }}>
        <div className="sk" style={{ height: 260 }} />
        <div className="sk" style={{ height: 20, width: '60%', margin: '14px 0 8px' }} />
        <div className="sk" style={{ height: 22, width: '30%', marginBottom: 12 }} />
        <div className="sk" style={{ height: 44 }} />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="center">
        <div className="emptybox" style={{ color: '#a2513e' }}>!</div>
        <div className="h">This piece isn't available</div>
        <div className="sm mut">It may have been removed or taken down.</div>
        <button className="btn sm primary" onClick={() => navigate('/catalog')}>Back to browse</button>
      </div>
    );
  }

  const images = p.imageUrls?.length ? p.imageUrls : [];

  return (
    <div className="wrap" style={{ paddingBlock: 20, maxWidth: 760 }}>
      <div className="img" style={{ aspectRatio: '16 / 10' }}>
        {images[active] ? <img src={images[active]} alt={p.title} /> : <span>image gallery</span>}
      </div>
      {images.length > 1 && (
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          {images.map((src, i) => (
            <div key={i} className="img" style={{ width: 46, height: 46, border: i === active ? '2px solid var(--accent)' : '1px solid var(--line)' }} onClick={() => setActive(i)}>
              <img src={src} alt="" />
            </div>
          ))}
        </div>
      )}

      <h1 className="h2" style={{ marginTop: 14 }}>{p.title}</h1>
      <div className="price" style={{ fontSize: 20, margin: '6px 0 12px' }}>{money(p.price)}</div>
      {p.description && <p className="sm" style={{ lineHeight: 1.6, marginBottom: 14 }}>{p.description}</p>}

      <Link to={`/shop/${p.shops?.id}`} className="card" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div className="avatar">{p.shops?.profileImageUrl ? <img src={p.shops.profileImageUrl} alt="" /> : initials(p.shops?.name)}</div>
        <div style={{ flex: 1 }}>
          <div className="h" style={{ fontSize: 13 }}>{p.shops?.name}</div>
          <div className="sm mut">Visit shop ›</div>
        </div>
      </Link>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 360 }}>
        <button className="btn block primary" onClick={() => { add(p, 1); track('add_to_cart', { productId: p.id, price: p.price }); flash('Added to cart'); }}>Add to Cart</button>
        {p.customOrdersEnabled && p.shops?.userId && (
          <button className="btn block" onClick={() => navigate(`/custom/new/${p.shops.userId}`, { state: { shopName: p.shops.name } })}>✎ Request Custom Order</button>
        )}
        <button className="btn ghost" onClick={() => setReporting(true)}>⚑ Report this listing</button>
      </div>

      {toast && <div className="toast">{toast}</div>}
      {reporting && <ReportModal productId={p.id} onClose={() => setReporting(false)} onDone={() => { setReporting(false); flash('Report submitted. Thank you.'); }} />}
    </div>
  );
}

function ReportModal({ productId, onClose, onDone }) {
  const [f, setF] = useState({ reporterName: '', reporterEmail: '', reason: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const valid = f.reporterName.trim() && /.+@.+\..+/.test(f.reporterEmail) && f.reason.trim();

  async function submit() {
    setBusy(true); setErr(null);
    try {
      await api.post('/api/ip-reports', { ...f, reportedProductId: productId });
      onDone();
    } catch (e) { setErr(e.message); setBusy(false); }
  }
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(42,42,40,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 90, padding: 16 }} onClick={onClose}>
      <div className="card" style={{ width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 10 }} onClick={(e) => e.stopPropagation()}>
        <div className="h2">Report this listing</div>
        <div className="sm mut">Flag content you believe infringes your rights.</div>
        <input className="field" placeholder="Your name *" value={f.reporterName} onChange={set('reporterName')} />
        <input className="field" placeholder="Your email *" value={f.reporterEmail} onChange={set('reporterEmail')} />
        <textarea className="field" placeholder="Why are you reporting this? *" value={f.reason} onChange={set('reason')} />
        {err && <div className="sm accent">{err}</div>}
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn primary" style={{ flex: 1 }} disabled={!valid || busy} onClick={submit}>{busy ? 'Sending…' : 'Submit report'}</button>
        </div>
      </div>
    </div>
  );
}

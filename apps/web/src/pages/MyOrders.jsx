// Screen 11 — My Orders (list + detail). GET /api/orders/mine, POST /api/orders/:id/deliver.
import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { api } from '../lib/apiClient.js';
import { useAuthCtx } from '../context/AuthContext.jsx';
import { money } from '../lib/format.js';

const shortId = (id) => `#DK-${(id || '').slice(0, 6).toUpperCase()}`;
const STATUS = {
  pending: { label: 'Pending payment', cls: 'tag' },
  confirmed: { label: 'Confirmed', cls: 'pend' },
  shipped: { label: 'Shipped', cls: 'terra' },
  delivered: { label: 'Delivered', cls: 'tag' },
  cancelled: { label: 'Cancelled', cls: 'tag' },
};
const qtyOf = (o) => (o.orderItems || []).reduce((n, i) => n + i.quantity, 0);
const fmtDate = (s) => new Date(s).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' });

function Timeline({ o }) {
  const rank = { confirmed: 1, shipped: 2, delivered: 3 }[o.orderStatus] || 0;
  const steps = [
    { key: 'confirmed', label: 'Confirmed', at: fmtDate(o.createdAt) },
    { key: 'shipped', label: o.trackingNumber ? `Shipped · ${o.trackingNumber}` : 'Shipped', at: '' },
    { key: 'delivered', label: 'Delivered', at: '' },
  ];
  return (
    <div className="tl">
      {steps.map((s, i) => {
        const level = i + 1;
        const done = rank > level;
        const now = rank === level;
        return (
          <div className="step" key={s.key}>
            <div className="rail">
              <div className={`knob ${done ? 'done' : now ? 'now' : ''}`} />
              {i < steps.length - 1 && <div className="line" style={done ? { background: 'var(--accent)' } : undefined} />}
            </div>
            <div className="txt">
              <div className="h" style={{ fontSize: 12, color: level <= rank ? 'var(--ink)' : 'var(--ink-3)' }}>{s.label}</div>
              <div className="sm mut">{level < rank ? s.at || 'Done' : now ? s.at || 'In progress' : 'Pending'}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function MyOrders() {
  const { session, loadingSession } = useAuthCtx();
  const navigate = useNavigate();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);

  function load() {
    setError(null);
    api.get('/api/orders/mine').then((r) => setOrders(r.orders)).catch((e) => setError(e.message));
  }
  useEffect(() => { if (session) load(); }, [session]);

  if (loadingSession) return <div className="center">Loading…</div>;
  if (!session) return <Navigate to="/login" replace />;

  async function confirmDelivery(o) {
    setBusy(true);
    try {
      const { order } = await api.post(`/api/orders/${o.id}/deliver`, {});
      setOrders((prev) => prev.map((x) => (x.id === o.id ? { ...x, ...order } : x)));
      setSelected((s) => (s && s.id === o.id ? { ...s, ...order } : s));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (error && !orders) {
    return (
      <div className="center">
        <div className="emptybox" style={{ color: '#a2513e' }}>!</div>
        <div className="h">Couldn't load your orders</div>
        <button className="btn sm primary" onClick={load}>Retry</button>
      </div>
    );
  }
  if (!orders) {
    return <div className="wrap" style={{ paddingBlock: 20, maxWidth: 620, display: 'flex', flexDirection: 'column', gap: 9 }}>{Array.from({ length: 3 }).map((_, i) => <div className="sk" key={i} style={{ height: 64 }} />)}</div>;
  }
  if (orders.length === 0) {
    return (
      <div className="center">
        <div className="emptybox">⧉</div>
        <div className="h">No orders yet</div>
        <div className="sm mut">Your purchases will show up here.</div>
        <button className="btn sm primary" onClick={() => navigate('/catalog')}>Browse the marketplace</button>
      </div>
    );
  }

  // Detail view
  if (selected) {
    const o = orders.find((x) => x.id === selected.id) || selected;
    return (
      <div className="wrap" style={{ maxWidth: 620, paddingBlock: 20 }}>
        <div className="navlink" style={{ marginBottom: 12 }} onClick={() => setSelected(null)}>‹ All orders</div>
        <h1 className="h2" style={{ marginBottom: 14 }}>Order {shortId(o.id)}</h1>
        <Timeline o={o} />
        <div className="card" style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="sm"><b>{qtyOf(o)} item{qtyOf(o) === 1 ? '' : 's'}</b> · {money(o.totalAmount)}</div>
          <div className="sm mut">{o.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Digital payment'}</div>
          {o.trackingNumber && <div className="sm"><b>Tracking</b> · {o.trackingNumber}</div>}
        </div>
        {o.orderStatus === 'shipped' && (
          <>
            <button className="btn block primary" style={{ marginTop: 12 }} disabled={busy} onClick={() => confirmDelivery(o)}>
              {busy ? 'Confirming…' : 'Confirm Delivery'}
            </button>
            <div className="mut" style={{ fontSize: 11, textAlign: 'center', marginTop: 6 }}>Only tap once your parcel has arrived.</div>
          </>
        )}
      </div>
    );
  }

  // List view
  return (
    <div className="wrap" style={{ maxWidth: 620, paddingBlock: 20 }}>
      <h1 className="h2" style={{ marginBottom: 14 }}>My Orders</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {orders.map((o) => {
          const s = STATUS[o.orderStatus] || STATUS.confirmed;
          return (
            <div className="card" key={o.id} style={{ display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer' }} onClick={() => setSelected(o)}>
              <div className="img" style={{ width: 44, height: 44, flex: 'none' }}>
                {o.orderItems?.[0]?.products?.imageUrls?.[0]
                  ? <img src={o.orderItems[0].products.imageUrls[0]} alt="" />
                  : <span> </span>}
              </div>
              <div style={{ flex: 1 }}>
                <div className="h" style={{ fontSize: 13 }}>{shortId(o.id)}</div>
                <div className="sm mut">{qtyOf(o)} item{qtyOf(o) === 1 ? '' : 's'} · {money(o.totalAmount)}</div>
              </div>
              <span className={`badge ${s.cls}`}>{s.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

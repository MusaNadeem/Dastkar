// Screen 16 — Seller Orders. GET /api/orders/incoming; Mark as Shipped -> tracking prompt.
import { useEffect, useState } from 'react';
import { api } from '../../lib/apiClient.js';
import { money } from '../../lib/format.js';

const shortId = (id) => `#DK-${(id || '').slice(0, 6).toUpperCase()}`;
const BADGE = { confirmed: { label: 'New', cls: 'pend' }, shipped: { label: 'Shipped', cls: 'terra' }, delivered: { label: 'Delivered', cls: 'tag' } };

export default function SellerOrders() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState(null);
  const [shipFor, setShipFor] = useState(null);
  const [courier, setCourier] = useState('TCS');
  const [tracking, setTracking] = useState('');
  const [busy, setBusy] = useState(false);

  function load() { setError(null); api.get('/api/orders/incoming').then((r) => setOrders(r.orders)).catch((e) => setError(e.message)); }
  useEffect(load, []);

  async function confirmShip() {
    setBusy(true);
    try {
      await api.post(`/api/orders/${shipFor.id}/ship`, { trackingNumber: `${courier} ${tracking}`.trim() });
      setShipFor(null); setTracking(''); load();
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }

  if (error && !orders) return <div className="center"><div className="emptybox" style={{ color: '#a2513e' }}>!</div><div className="h">Couldn't load orders</div><button className="btn sm primary" onClick={load}>Retry</button></div>;
  if (!orders) return <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>{Array.from({ length: 2 }).map((_, i) => <div className="sk" key={i} style={{ height: 78 }} />)}</div>;
  if (orders.length === 0) return <div className="center"><div className="emptybox">⧉</div><div className="h">No orders yet</div><div className="sm mut">New orders from buyers will appear here.</div></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      {orders.map((o) => {
        const b = BADGE[o.orderStatus] || BADGE.confirmed;
        const qty = (o.items || []).reduce((n, i) => n + i.quantity, 0);
        return (
          <div className="card" key={o.id} style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="h" style={{ fontSize: 13 }}>{shortId(o.id)}</div>
              <span className={`badge ${b.cls}`}>{b.label}</span>
              <div style={{ flex: 1 }} />
              <div className="sm mut">{money(o.totalAmount)}</div>
            </div>
            <div className="sm mut">{qty} item{qty === 1 ? '' : 's'} · ship to {o.shippingAddress?.city || '—'}</div>
            {o.orderStatus === 'confirmed' && <button className="btn sm primary block" onClick={() => setShipFor(o)}>Mark as Shipped</button>}
            {o.trackingNumber && <div className="sm">Tracking · {o.trackingNumber}</div>}
          </div>
        );
      })}

      {shipFor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(42,42,40,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 90, padding: 16 }} onClick={() => setShipFor(null)}>
          <div className="card" style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 10 }} onClick={(e) => e.stopPropagation()}>
            <div className="h">Mark {shortId(shipFor.id)} shipped</div>
            <div className="fg"><label className="flbl">Courier</label>
              <select className="field" value={courier} onChange={(e) => setCourier(e.target.value)}>
                <option>TCS</option><option>Leopards</option><option>PostEx</option>
              </select>
            </div>
            <div className="fg"><label className="flbl">Tracking number *</label><input className="field" value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="KA-88213047" /></div>
            <button className="btn block primary" disabled={!tracking.trim() || busy} onClick={confirmShip}>{busy ? 'Confirming…' : 'Confirm shipment'}</button>
            <button className="btn block" onClick={() => setShipFor(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Screen 08 — Checkout. Shipping form + payment method -> POST /api/orders.
// COD -> confirmation; Digital -> simulated payment screen.
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../lib/apiClient.js';
import { track } from '../lib/analytics.js';
import { useAuthCtx } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { money } from '../lib/format.js';

export default function Checkout() {
  const { session, loadingSession } = useAuthCtx();
  const { items, total, clear } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => { track('checkout_started', { itemCount: items.length, total }); }, []); // eslint-disable-line
  const [addr, setAddr] = useState({ fullName: '', phone: '', line1: '', city: '', postalCode: '' });
  const [method, setMethod] = useState('cod');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(location.state?.paymentFailed ? 'Payment failed, please try again.' : null);

  if (loadingSession) return <div className="center">Loading…</div>;
  if (!session) {
    return (
      <div className="center">
        <div className="emptybox">◍</div>
        <div className="h">Sign in to check out</div>
        <div className="sm mut">You need an account to place an order.</div>
        <button className="btn sm primary" onClick={() => navigate('/login')}>Continue with Google</button>
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <div className="center">
        <div className="emptybox">▤</div>
        <div className="h">Your cart is empty</div>
        <button className="btn sm primary" onClick={() => navigate('/catalog')}>Browse the marketplace</button>
      </div>
    );
  }

  const set = (k) => (e) => setAddr({ ...addr, [k]: e.target.value });
  const valid = addr.fullName.trim() && addr.phone.trim().length >= 6 && addr.line1.trim() && addr.city.trim();

  async function placeOrder() {
    setErr(null);
    setBusy(true);
    try {
      const body = {
        items: items.map((i) => ({ productId: i.productId, quantity: i.qty })),
        shippingAddress: {
          fullName: addr.fullName.trim(),
          phone: addr.phone.trim(),
          line1: addr.line1.trim(),
          city: addr.city.trim(),
          postalCode: addr.postalCode.trim() || undefined,
        },
        paymentMethod: method,
      };
      const { order } = await api.post('/api/orders', body);
      if (method === 'cod') {
        clear();
        navigate('/order-confirmed', { replace: true, state: { order } });
      } else {
        navigate(`/pay/${order.id}`, { state: { order } });
      }
    } catch (e) {
      setErr(e.message);
      setBusy(false);
    }
  }

  return (
    <div className="wrap" style={{ maxWidth: 720, paddingBlock: 20 }}>
      <h1 className="h2" style={{ marginBottom: 14 }}>Checkout</h1>
      {err && <div className="card" style={{ borderColor: '#e0b6a9', background: '#faf3f0', marginBottom: 12 }}><span className="sm accent">{err}</span></div>}

      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'minmax(0,1fr)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="flbl">Shipping address</div>
          <input className="field" placeholder="Full name *" value={addr.fullName} onChange={set('fullName')} />
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="field" placeholder="Phone *" value={addr.phone} onChange={set('phone')} />
            <input className="field" placeholder="City *" value={addr.city} onChange={set('city')} />
          </div>
          <textarea className="field" placeholder="Street address *" value={addr.line1} onChange={set('line1')} />
          <input className="field" placeholder="Postal code" value={addr.postalCode} onChange={set('postalCode')} style={{ maxWidth: 160 }} />

          <div className="flbl" style={{ marginTop: 6 }}>Payment method</div>
          <div className={`radio ${method === 'cod' ? 'on' : ''}`} onClick={() => setMethod('cod')}>
            <div className="dotr" />
            <div><div className="sm" style={{ color: 'var(--ink)' }}><b>Cash on Delivery</b></div><div className="mut">Pay when it arrives</div></div>
          </div>
          <div className={`radio ${method === 'simulated_digital' ? 'on' : ''}`} onClick={() => setMethod('simulated_digital')}>
            <div className="dotr" />
            <div><div className="sm" style={{ color: 'var(--ink)' }}><b>Digital payment</b></div><div className="mut">Simulated gateway (MVP)</div></div>
          </div>
        </div>

        <div className="card">
          <b className="sm">Order summary</b>
          <div className="divide" style={{ margin: '8px 0' }} />
          {items.map((i) => (
            <div key={i.productId} style={{ display: 'flex', justifyContent: 'space-between' }} className="sm">
              <span>{i.title}{i.qty > 1 ? ` ×${i.qty}` : ''}</span>
              <span>{money(i.price * i.qty)}</span>
            </div>
          ))}
          <div className="divide" style={{ margin: '8px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><b>Total</b><b className="price">{money(total)}</b></div>
          <button className="btn block primary" style={{ marginTop: 12 }} disabled={!valid || busy} onClick={placeOrder}>
            {busy ? 'Placing…' : 'Place Order'}
          </button>
          {!valid && <div className="mut" style={{ marginTop: 6, textAlign: 'center' }}>Fill name, phone, address, and city.</div>}
        </div>
      </div>
    </div>
  );
}

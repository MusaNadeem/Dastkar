// Screen 10 — Order confirmation. Reads the just-placed order from router state.
import { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { money } from '../lib/format.js';
import { track } from '../lib/analytics.js';

const shortId = (id) => `#DK-${(id || '').slice(0, 6).toUpperCase()}`;

export default function OrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;
  useEffect(() => {
    if (order) track('order_completed', { orderId: order.id, total: order.totalAmount, method: order.paymentMethod });
  }, [order]);
  if (!order) return <Navigate to="/orders" replace />;

  const method = order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Digital payment';

  return (
    <div className="center">
      <div className="avatar" style={{ width: 60, height: 60, background: 'var(--accent-soft)', color: 'var(--accent)', fontSize: 24 }}>✓</div>
      <div className="h2">Order confirmed</div>
      <div className="sm mut">{shortId(order.id)} · placed just now</div>
      <div className="card" style={{ width: '100%', maxWidth: 320, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }} className="sm"><span>Total</span><b>{money(order.totalAmount)}</b></div>
        <div className="sm mut">{method}</div>
        <div className="sm mut">Estimated delivery 3–5 days</div>
      </div>
      <button className="btn primary" style={{ minWidth: 220 }} onClick={() => navigate('/orders')}>Track your order</button>
      <button className="btn ghost" onClick={() => navigate('/catalog')}>Continue shopping</button>
    </div>
  );
}

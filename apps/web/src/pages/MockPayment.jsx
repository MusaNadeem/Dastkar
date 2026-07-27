// Screen 09 — Simulated payment. Mock gateway -> POST /api/orders/:id/pay { outcome }.
import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/apiClient.js';
import { useCart } from '../context/CartContext.jsx';
import { money } from '../lib/format.js';
import '../styles/app.css';

export default function MockPayment() {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { clear } = useCart();
  const [busy, setBusy] = useState(false);
  const amount = location.state?.order?.totalAmount;

  async function pay(outcome) {
    setBusy(true);
    try {
      const { order, paid } = await api.post(`/api/orders/${orderId}/pay`, { outcome });
      if (paid) {
        clear();
        navigate('/order-confirmed', { replace: true, state: { order } });
      } else {
        navigate('/checkout', { replace: true, state: { paymentFailed: true } });
      }
    } catch {
      navigate('/checkout', { replace: true, state: { paymentFailed: true } });
    }
  }

  return (
    <div className="dk" style={{ minHeight: '70vh' }}>
      <div style={{ background: '#2a2a28', textAlign: 'center', padding: '14px' }}>
        <span className="logo" style={{ color: '#fff' }}>Secure Pay <span className="mut" style={{ fontSize: 10 }}>(demo)</span></span>
      </div>
      <div className="center">
        <span className="badge tag">SIMULATED GATEWAY · MVP</span>
        <div className="sm mut">Amount due</div>
        <div className="price" style={{ fontSize: 28 }}>{amount != null ? money(amount) : '—'}</div>
        <div className="sm mut" style={{ maxWidth: 220 }}>This is a mock screen. Choose an outcome to continue.</div>
        <button className="btn primary" style={{ minWidth: 220 }} disabled={busy} onClick={() => pay('success')}>✓ Simulate Success</button>
        <button className="btn" style={{ minWidth: 220, color: '#a2513e', borderColor: '#e0b6a9' }} disabled={busy} onClick={() => pay('fail')}>✕ Simulate Failure</button>
      </div>
    </div>
  );
}

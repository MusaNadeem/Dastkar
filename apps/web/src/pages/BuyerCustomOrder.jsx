// Screen 13 — Buyer's custom order detail. Full commission lifecycle.
// Reads from /api/custom-orders/mine; acts via deposit / revision / balance endpoints.
import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/apiClient.js';
import { useAuthCtx } from '../context/AuthContext.jsx';
import { money } from '../lib/format.js';

const shortId = (id) => `#CM-${(id || '').slice(0, 6).toUpperCase()}`;
const STAGE = {
  pending: { label: 'Awaiting quote', cls: 'tag' },
  quoted: { label: 'Quote received', cls: 'terra' },
  deposit_paid: { label: 'Deposit paid', cls: 'pend' },
  in_progress: { label: 'In progress', cls: 'pend' },
  completed: { label: 'Completed', cls: 'ok' },
  shipped: { label: 'Shipped', cls: 'terra' },
  declined: { label: 'Declined', cls: 'tag' },
};

function PhotoRow({ label, urls }) {
  if (!urls?.length) return null;
  return (
    <>
      <div className="flbl">{label}</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {urls.map((u, i) => <div key={i} className="img" style={{ width: 80, height: 80 }}><img src={u} alt="" /></div>)}
      </div>
    </>
  );
}

export default function BuyerCustomOrder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session, loadingSession } = useAuthCtx();
  const [req, setReq] = useState(null);
  const [error, setError] = useState(null);
  const [payMode, setPayMode] = useState(null); // 'deposit' | 'balance'
  const [busy, setBusy] = useState(false);
  const [addr, setAddr] = useState({ fullName: '', phone: '', line1: '', city: '' });

  function load() {
    setError(null);
    api.get('/api/custom-orders/mine')
      .then((r) => { const found = r.requests.find((x) => x.id === id); if (!found) setError('Not found'); else setReq(found); })
      .catch((e) => setError(e.message));
  }
  useEffect(() => { if (session) load(); }, [session, id]);

  if (loadingSession) return <div className="center">Loading…</div>;
  if (!session) return <Navigate to="/login" replace />;
  if (error) return <div className="center"><div className="emptybox" style={{ color: '#a2513e' }}>!</div><div className="h">Couldn't load this request</div><button className="btn sm primary" onClick={load}>Retry</button></div>;
  if (!req) return <div className="wrap" style={{ paddingBlock: 20, maxWidth: 520 }}><div className="sk" style={{ height: 22, width: '50%' }} /><div className="sk" style={{ height: 90, marginTop: 12 }} /></div>;

  const stage = STAGE[req.status] || STAGE.pending;
  const deposit = req.quotedPrice ? Math.round(req.quotedPrice * 0.4) : 0;
  const balance = req.quotedPrice ? req.quotedPrice - (req.depositAmount || deposit) : 0;
  const addrValid = addr.fullName.trim() && addr.phone.trim().length >= 6 && addr.line1.trim() && addr.city.trim();

  async function payDeposit(outcome) {
    setBusy(true);
    try {
      await api.post(`/api/custom-orders/${id}/deposit`, { outcome, shippingAddress: { ...addr } });
      setPayMode(null); load();
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  async function payBalance(outcome) {
    setBusy(true);
    try {
      await api.post(`/api/custom-orders/${id}/balance`, { outcome });
      setPayMode(null); load();
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  async function requestRevision() {
    setBusy(true);
    try { await api.post(`/api/custom-orders/${id}/revision`, {}); load(); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  }

  const PayPanel = ({ amount, onPay }) => (
    <div className="card" style={{ background: '#2a2a28', color: '#fff', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', textAlign: 'center' }}>
      <span className="badge tag">SIMULATED GATEWAY · MVP</span>
      <div className="sm" style={{ color: '#cfccc5' }}>Amount due</div>
      <div className="price" style={{ fontSize: 22, color: '#fff' }}>{money(amount)}</div>
      <div style={{ display: 'flex', gap: 8, width: '100%' }}>
        <button className="btn primary" style={{ flex: 1 }} disabled={busy} onClick={() => onPay('success')}>✓ Success</button>
        <button className="btn" style={{ flex: 1, color: '#a2513e', borderColor: '#e0b6a9' }} disabled={busy} onClick={() => onPay('fail')}>✕ Fail</button>
      </div>
    </div>
  );

  return (
    <div className="wrap" style={{ maxWidth: 560, paddingBlock: 20 }}>
      <div className="navlink" style={{ marginBottom: 10 }} onClick={() => navigate('/orders')}>‹ Orders</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <h1 className="h2">Custom {shortId(req.id)}</h1>
        <span className={`badge ${stage.cls}`}>{stage.label}</span>
      </div>

      <p className="sm" style={{ marginBottom: 12, lineHeight: 1.6 }}>{req.description}</p>
      {req.referenceImageUrls?.length > 0 && <div style={{ marginBottom: 12 }}><PhotoRow label="Your references" urls={req.referenceImageUrls} /></div>}

      {req.status === 'pending' && (
        <div className="card"><div className="sm mut">The maker will review your request and send a quote soon.</div></div>
      )}

      {req.status === 'quoted' && (
        <>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
            <div className="sm mut">Seller's quote</div>
            <div className="price" style={{ fontSize: 20 }}>{money(req.quotedPrice)}</div>
            <div className="sm">Deposit due now (40%) · <b>{money(deposit)}</b></div>
            <div className="sm mut">Balance {money(req.quotedPrice - deposit)} on completion</div>
          </div>
          {payMode === 'deposit' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="flbl">Delivery address</div>
              <input className="field" placeholder="Full name *" value={addr.fullName} onChange={(e) => setAddr({ ...addr, fullName: e.target.value })} />
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="field" placeholder="Phone *" value={addr.phone} onChange={(e) => setAddr({ ...addr, phone: e.target.value })} />
                <input className="field" placeholder="City *" value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} />
              </div>
              <textarea className="field" placeholder="Street address *" value={addr.line1} onChange={(e) => setAddr({ ...addr, line1: e.target.value })} />
              {addrValid ? <PayPanel amount={deposit} onPay={payDeposit} /> : <div className="mut">Fill your delivery address to pay the deposit.</div>}
              <button className="btn" onClick={() => setPayMode(null)}>Cancel</button>
            </div>
          ) : (
            <button className="btn block primary" onClick={() => setPayMode('deposit')}>Approve &amp; Pay Deposit</button>
          )}
        </>
      )}

      {(req.status === 'deposit_paid' || req.status === 'in_progress') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="sm mut">Deposit paid · {money(req.depositAmount)} ✓</div>
          <PhotoRow label="Progress photos" urls={req.progressImageUrls} />
          <PhotoRow label="Final photos" urls={req.finalImageUrls} />
          {req.finalImageUrls?.length > 0 ? (
            <>
              <div className="card"><div className="sm">Balance due · <b>{money(balance)}</b></div><div className="mut" style={{ fontSize: 11 }}>Revisions used: {req.revisionCount} of 2</div></div>
              {payMode === 'balance' ? (
                <><PayPanel amount={balance} onPay={payBalance} /><button className="btn" onClick={() => setPayMode(null)}>Cancel</button></>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn primary" style={{ flex: 1 }} onClick={() => setPayMode('balance')}>Approve &amp; Pay Balance</button>
                  {req.revisionCount < 2 && <button className="btn" style={{ flex: 1 }} disabled={busy} onClick={requestRevision}>Request Revision</button>}
                </div>
              )}
            </>
          ) : (
            <button className="btn block" style={{ opacity: 0.6 }} disabled>Awaiting final photos…</button>
          )}
        </div>
      )}

      {(req.status === 'completed' || req.status === 'shipped') && (
        <div className="card"><div className="sm">Balance paid — your commission is {req.status === 'shipped' ? 'on its way. Track it in My Orders.' : 'being prepared for shipping.'}</div></div>
      )}
      {req.status === 'declined' && <div className="card"><div className="sm mut">This request was declined by the maker.</div></div>}
    </div>
  );
}

// Screen 17 — Seller Custom Requests. Accept-with-quote / decline, upload photos, ship.
import { useEffect, useState } from 'react';
import { api } from '../../lib/apiClient.js';
import { uploadImage } from '../../lib/upload.js';
import { money } from '../../lib/format.js';

const shortId = (id) => `#CM-${(id || '').slice(0, 6).toUpperCase()}`;
const BADGE = {
  pending: { label: 'New request', cls: 'pend' },
  quoted: { label: 'Quote sent', cls: 'terra' },
  deposit_paid: { label: 'Deposit paid', cls: 'pend' },
  in_progress: { label: 'In progress', cls: 'pend' },
  completed: { label: 'Awaiting shipment', cls: 'terra' },
  shipped: { label: 'Shipped', cls: 'tag' },
  declined: { label: 'Declined', cls: 'tag' },
};

function Photos({ label, urls, onAdd, busy }) {
  return (
    <div>
      <div className="flbl" style={{ marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
        {(urls || []).map((u, i) => <div key={i} className="img" style={{ width: 52, height: 52 }}><img src={u} alt="" /></div>)}
        {onAdd && (
          <label className="img" style={{ width: 52, height: 52, cursor: 'pointer' }}>
            <span>{busy ? '…' : '+'}</span>
            <input type="file" accept="image/*" multiple hidden onChange={onAdd} />
          </label>
        )}
      </div>
    </div>
  );
}

export default function SellerCustomRequests() {
  const [reqs, setReqs] = useState(null);
  const [error, setError] = useState(null);
  const [quote, setQuote] = useState({}); // id -> price string
  const [track, setTrack] = useState({}); // id -> tracking string
  const [busyId, setBusyId] = useState(null);

  function load() { setError(null); api.get('/api/custom-orders/incoming').then((r) => setReqs(r.requests)).catch((e) => setError(e.message)); }
  useEffect(load, []);

  const act = async (id, fn) => { setBusyId(id); try { await fn(); load(); } catch (e) { setError(e.message); } finally { setBusyId(null); } };
  const sendQuote = (id) => act(id, () => api.post(`/api/custom-orders/${id}/quote`, { quotedPrice: Number(quote[id]) }));
  const decline = (id) => act(id, () => api.post(`/api/custom-orders/${id}/decline`, {}));
  const ship = (id) => act(id, () => api.post(`/api/custom-orders/${id}/ship`, { trackingNumber: track[id] }));
  async function addPhotos(id, type, e) {
    const files = [...e.target.files]; if (!files.length) return;
    setBusyId(id);
    try { const urls = await Promise.all(files.map(uploadImage)); await api.post(`/api/custom-orders/${id}/photos`, { type, imageUrls: urls }); load(); }
    catch (ex) { setError(ex.message); } finally { setBusyId(null); }
  }

  if (error && !reqs) return <div className="center"><div className="emptybox" style={{ color: '#a2513e' }}>!</div><div className="h">Couldn't load requests</div><button className="btn sm primary" onClick={load}>Retry</button></div>;
  if (!reqs) return <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>{Array.from({ length: 2 }).map((_, i) => <div className="sk" key={i} style={{ height: 90 }} />)}</div>;
  if (reqs.length === 0) return <div className="center"><div className="emptybox">✎</div><div className="h">No custom requests</div><div className="sm mut" style={{ maxWidth: 200 }}>Enable custom orders on a product to receive these.</div></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {reqs.map((r) => {
        const b = BADGE[r.status] || BADGE.pending;
        const busy = busyId === r.id;
        const deposit = r.quotedPrice ? Math.round(r.quotedPrice * 0.4) : 0;
        return (
          <div className="card" key={r.id} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="h" style={{ fontSize: 13 }}>{shortId(r.id)}</div>
              <span className={`badge ${b.cls}`}>{b.label}</span>
            </div>
            <div className="sm">{r.description}</div>
            {r.budgetRange && <div className="sm mut">Budget: {r.budgetRange}</div>}
            {r.referenceImageUrls?.length > 0 && <Photos label="References" urls={r.referenceImageUrls} />}

            {r.status === 'pending' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                  <div className="fg" style={{ flex: 1 }}><label className="flbl">Your price (Rs)</label><input className="field" type="number" value={quote[r.id] || ''} onChange={(e) => setQuote({ ...quote, [r.id]: e.target.value })} /></div>
                  <button className="btn primary" disabled={!Number(quote[r.id]) || busy} onClick={() => sendQuote(r.id)}>Send quote</button>
                </div>
                {Number(quote[r.id]) > 0 && <div className="mut">Deposit (40%) {money(Math.round(Number(quote[r.id]) * 0.4))} · balance on completion</div>}
                <button className="btn sm" disabled={busy} onClick={() => decline(r.id)}>Decline</button>
              </div>
            )}
            {r.status === 'quoted' && <div className="sm mut">Quote sent · {money(r.quotedPrice)} · awaiting deposit (deposit {money(deposit)})</div>}

            {(r.status === 'deposit_paid' || r.status === 'in_progress') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="sm mut">Deposit received · {money(r.depositAmount)} ✓</div>
                <Photos label="Progress photos" urls={r.progressImageUrls} onAdd={(e) => addPhotos(r.id, 'progress', e)} busy={busy} />
                <Photos label="Final photos" urls={r.finalImageUrls} onAdd={(e) => addPhotos(r.id, 'final', e)} busy={busy} />
                <div className="mut">Upload final photos, then the buyer approves and pays the balance.</div>
              </div>
            )}
            {r.status === 'completed' && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <div className="fg" style={{ flex: 1 }}><label className="flbl">Tracking number</label><input className="field" value={track[r.id] || ''} onChange={(e) => setTrack({ ...track, [r.id]: e.target.value })} placeholder="TCS KA-..." /></div>
                <button className="btn primary" disabled={!track[r.id]?.trim() || busy} onClick={() => ship(r.id)}>Mark as shipped</button>
              </div>
            )}
            {r.status === 'shipped' && <div className="sm mut">Shipped ✓</div>}
          </div>
        );
      })}
    </div>
  );
}

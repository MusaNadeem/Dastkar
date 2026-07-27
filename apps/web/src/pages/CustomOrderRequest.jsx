// Screen 12 — Request Custom Order. POST /api/custom-orders. Reached from product detail.
import { useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/apiClient.js';
import { uploadImage } from '../lib/upload.js';
import { useAuthCtx } from '../context/AuthContext.jsx';

export default function CustomOrderRequest() {
  const { sellerId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { session, loadingSession } = useAuthCtx();
  const shopName = location.state?.shopName || 'this maker';
  const [desc, setDesc] = useState('');
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  if (loadingSession) return <div className="center">Loading…</div>;
  if (!session) return <Navigate to="/login" replace />;

  async function onPick(e) {
    const files = [...e.target.files].slice(0, 3 - images.length);
    if (!files.length) return;
    setUploading(true); setErr(null);
    try {
      const urls = await Promise.all(files.map(uploadImage));
      setImages((prev) => [...prev, ...urls].slice(0, 3));
    } catch (ex) { setErr(ex.message); } finally { setUploading(false); }
  }

  const valid = desc.trim() && min && max && Number(max) >= Number(min);

  async function submit() {
    setBusy(true); setErr(null);
    try {
      const budgetRange = `Rs ${Number(min).toLocaleString()} - ${Number(max).toLocaleString()}`;
      const { request } = await api.post('/api/custom-orders', { sellerId, description: desc.trim(), budgetRange, referenceImageUrls: images });
      navigate(`/custom/${request.id}`, { replace: true });
    } catch (e) { setErr(e.message); setBusy(false); }
  }

  return (
    <div className="wrap" style={{ maxWidth: 560, paddingBlock: 20 }}>
      <h1 className="h2" style={{ marginBottom: 4 }}>Request a custom order</h1>
      <div className="sm mut" style={{ marginBottom: 14 }}>To <b>{shopName}</b> · they'll reply with a quote</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="fg">
          <label className="flbl">What would you like made? *</label>
          <textarea className="field" placeholder="Describe size, colours, text, deadline…" value={desc} onChange={(e) => setDesc(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="fg" style={{ flex: 1 }}><label className="flbl">Budget min (Rs) *</label><input className="field" type="number" value={min} onChange={(e) => setMin(e.target.value)} /></div>
          <div className="fg" style={{ flex: 1 }}><label className="flbl">Budget max (Rs) *</label><input className="field" type="number" value={max} onChange={(e) => setMax(e.target.value)} /></div>
        </div>
        <div className="fg">
          <label className="flbl">Reference images (up to 3)</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {images.map((src, i) => <div key={i} className="img" style={{ width: 60, height: 60, flex: 'none' }}><img src={src} alt="" /></div>)}
            {images.length < 3 && (
              <label className="img" style={{ width: 60, height: 60, flex: 'none', cursor: 'pointer' }}>
                <span>{uploading ? '…' : '+'}</span>
                <input type="file" accept="image/*" multiple hidden onChange={onPick} />
              </label>
            )}
          </div>
        </div>
        {err && <div className="sm accent">{err}</div>}
        <div><button className="btn primary" style={{ minWidth: 160 }} disabled={!valid || busy || uploading} onClick={submit}>{busy ? 'Sending…' : 'Send request'}</button></div>
      </div>
    </div>
  );
}

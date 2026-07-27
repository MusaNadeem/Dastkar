// Screen 15 — Add / Edit Product. POST or PATCH /api/products. Submits to Pending review.
import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/apiClient.js';
import { uploadImage } from '../lib/upload.js';
import { useAuthCtx } from '../context/AuthContext.jsx';

export default function AddEditProduct() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const { session, loadingSession, profile } = useAuthCtx();
  const [categories, setCategories] = useState([]);
  const [f, setF] = useState({ title: '', description: '', price: '', stock: '1', categoryId: '', customOrdersEnabled: false, imageUrls: [] });
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [ready, setReady] = useState(!editing);

  useEffect(() => {
    api.get('/api/categories').then((r) => setCategories(r.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!editing || !session) return;
    api.get('/api/products/mine').then((r) => {
      const p = r.products.find((x) => x.id === id);
      if (p) setF({ title: p.title, description: p.description || '', price: String(p.price), stock: String(p.stockQuantity), categoryId: p.categoryId || '', customOrdersEnabled: p.customOrdersEnabled, imageUrls: p.imageUrls || [] });
      setReady(true);
    }).catch(() => setReady(true));
  }, [editing, session, id]);

  if (loadingSession) return <div className="center">Loading…</div>;
  if (!session) return <Navigate to="/login" replace />;
  if (profile && profile.role !== 'seller') return <Navigate to="/catalog" replace />;
  if (!ready) return <div className="center">Loading…</div>;

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function onPick(e) {
    const files = [...e.target.files].slice(0, 5 - f.imageUrls.length);
    if (!files.length) return;
    setUploading(true); setErr(null);
    try {
      const urls = await Promise.all(files.map(uploadImage));
      setF((prev) => ({ ...prev, imageUrls: [...prev.imageUrls, ...urls].slice(0, 5) }));
    } catch (ex) { setErr(ex.message); } finally { setUploading(false); }
  }

  const valid = f.title.trim() && f.description.trim() && Number(f.price) > 0 && Number(f.stock) >= 0 && f.categoryId && f.imageUrls.length >= 1;

  async function submit() {
    setBusy(true); setErr(null);
    const body = {
      title: f.title.trim(), description: f.description.trim(), price: Number(f.price),
      stockQuantity: Number(f.stock), categoryId: f.categoryId, customOrdersEnabled: f.customOrdersEnabled, imageUrls: f.imageUrls,
    };
    try {
      if (editing) await api.patch(`/api/products/${id}`, body);
      else await api.post('/api/products', body);
      navigate('/seller', { replace: true });
    } catch (e) { setErr(e.message); setBusy(false); }
  }

  return (
    <div className="wrap" style={{ maxWidth: 600, paddingBlock: 20 }}>
      <h1 className="h2" style={{ marginBottom: 14 }}>{editing ? 'Edit product' : 'Add product'}</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="fg">
          <label className="flbl">Photos (up to 5) *</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {f.imageUrls.map((src, i) => (
              <div key={i} className="img" style={{ width: 64, height: 64, flex: 'none', position: 'relative' }}>
                <img src={src} alt="" />
                <span onClick={() => setF({ ...f, imageUrls: f.imageUrls.filter((_, j) => j !== i) })} style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,.6)', color: '#fff', borderRadius: 10, width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, cursor: 'pointer' }}>×</span>
              </div>
            ))}
            {f.imageUrls.length < 5 && (
              <label className="img" style={{ width: 64, height: 64, flex: 'none', cursor: 'pointer' }}>
                <span>{uploading ? '…' : '+'}</span>
                <input type="file" accept="image/*" multiple hidden onChange={onPick} />
              </label>
            )}
          </div>
        </div>
        <div className="fg"><label className="flbl">Title *</label><input className="field" value={f.title} onChange={set('title')} placeholder="Hand-lettered Ayat frame" /></div>
        <div className="fg"><label className="flbl">Description *</label><textarea className="field" value={f.description} onChange={set('description')} placeholder="Materials, size, care…" /></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="fg" style={{ flex: 1 }}><label className="flbl">Price (Rs) *</label><input className="field" type="number" value={f.price} onChange={set('price')} /></div>
          <div className="fg" style={{ flex: 1 }}><label className="flbl">Stock *</label><input className="field" type="number" value={f.stock} onChange={set('stock')} /></div>
          <div className="fg" style={{ flex: 1 }}>
            <label className="flbl">Category *</label>
            <select className="field" value={f.categoryId} onChange={set('categoryId')}>
              <option value="">Select…</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div className="radio" style={{ justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setF({ ...f, customOrdersEnabled: !f.customOrdersEnabled })}>
          <div><div className="sm" style={{ color: 'var(--ink)' }}><b>Accept custom orders</b></div><div className="mut" style={{ fontSize: 11 }}>Shows a "Request custom" button on the listing</div></div>
          <div style={{ width: 38, height: 22, borderRadius: 12, background: f.customOrdersEnabled ? 'var(--accent)' : '#c9c5bd', position: 'relative', flex: 'none', transition: 'background .15s' }}>
            <span style={{ position: 'absolute', top: 2, left: f.customOrdersEnabled ? 18 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left .15s' }} />
          </div>
        </div>
        {err && <div className="sm accent">{err}</div>}
        <div><button className="btn primary" style={{ minWidth: 170 }} disabled={!valid || busy || uploading} onClick={submit}>{busy ? 'Saving…' : 'Submit for review'}</button></div>
        {editing && <div className="mut">Editing re-submits the listing for review.</div>}
      </div>
    </div>
  );
}

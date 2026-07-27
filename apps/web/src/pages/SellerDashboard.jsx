// Screen 14 — Seller dashboard. Tabs: My Products / Orders / Custom / Payouts.
import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { api } from '../lib/apiClient.js';
import { useAuthCtx } from '../context/AuthContext.jsx';
import { money } from '../lib/format.js';
import SellerOrders from '../components/app/SellerOrders.jsx';
import SellerCustomRequests from '../components/app/SellerCustomRequests.jsx';

const TABS = ['My Products', 'Orders', 'Custom', 'Payouts'];

function productBadge(p) {
  if (p.status === 'pending_review') return { label: 'Pending review', cls: 'pend' };
  if (p.status === 'rejected') return { label: 'Rejected', cls: 'terra' };
  if (p.stockQuantity === 0) return { label: 'Sold out', cls: 'tag' };
  return { label: 'Live', cls: 'tag' };
}

function MyProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState(null);
  const [error, setError] = useState(null);
  function load() { setError(null); api.get('/api/products/mine').then((r) => setProducts(r.products)).catch((e) => setError(e.message)); }
  useEffect(load, []);

  if (error && !products) return <div className="center"><div className="emptybox" style={{ color: '#a2513e' }}>!</div><div className="h">Couldn't load products</div><button className="btn sm primary" onClick={load}>Retry</button></div>;
  if (!products) return <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>{Array.from({ length: 3 }).map((_, i) => <div className="sk" key={i} style={{ height: 58 }} />)}</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <button className="btn primary sm" style={{ alignSelf: 'flex-start' }} onClick={() => navigate('/seller/products/new')}>+ Add product</button>
      {products.length === 0 ? (
        <div className="center"><div className="emptybox">◱</div><div className="h">No products yet</div><div className="sm mut">List your first piece to open your shop.</div></div>
      ) : products.map((p) => {
        const b = productBadge(p);
        return (
          <div className="card" key={p.id} style={{ display: 'flex', gap: 11, alignItems: 'center' }}>
            <div className="img" style={{ width: 44, height: 44, flex: 'none' }}>{p.imageUrls?.[0] ? <img src={p.imageUrls[0]} alt="" /> : <span> </span>}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="h" style={{ fontSize: 13 }}>{p.title}</div>
              <div className="sm mut">{money(p.price)} · {p.stockQuantity} in stock</div>
            </div>
            <span className={`badge ${b.cls}`}>{b.label}</span>
            <button className="btn sm" onClick={() => navigate(`/seller/products/${p.id}/edit`)}>Edit</button>
          </div>
        );
      })}
    </div>
  );
}

export default function SellerDashboard() {
  const { session, loadingSession, profile, loadingProfile } = useAuthCtx();
  const [tab, setTab] = useState('My Products');

  if (loadingSession || loadingProfile) return <div className="center">Loading…</div>;
  if (!session) return <Navigate to="/login" replace />;
  if (profile && profile.role !== 'seller') return <Navigate to="/catalog" replace />;

  return (
    <div className="wrap" style={{ paddingBlock: 18, maxWidth: 760 }}>
      <div className="chiprow" style={{ marginBottom: 16 }}>
        {TABS.map((t) => <span key={t} className={`chip ${tab === t ? 'on' : ''}`} onClick={() => setTab(t)}>{t}</span>)}
      </div>
      {tab === 'My Products' && <MyProducts />}
      {tab === 'Orders' && <SellerOrders />}
      {tab === 'Custom' && <SellerCustomRequests />}
      {tab === 'Payouts' && (
        <div className="center"><div className="emptybox">₨</div><div className="h">Payouts coming soon</div><div className="sm mut" style={{ maxWidth: 220 }}>Earnings tracking and bank transfers arrive after MVP. For now, settle offline.</div></div>
      )}
    </div>
  );
}

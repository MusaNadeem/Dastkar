// Screens 18-21 — Admin panel. Tabs: Listings / IP Reports / Sellers / Analytics.
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { api } from '../lib/apiClient.js';
import { useAuthCtx } from '../context/AuthContext.jsx';
import { money } from '../lib/format.js';

const TABS = ['Listings', 'IP Reports', 'Sellers', 'Analytics'];

function useList(path) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const load = () => { setError(null); api.get(path).then(setData).catch((e) => setError(e.message)); };
  useEffect(load, [path]);
  return { data, setData, error, load };
}

// 18 — Listing approval queue
function Listings() {
  const { data, error, load } = useList('/api/admin/products/pending');
  const [busy, setBusy] = useState(null);
  const act = async (id, action) => { setBusy(id); try { await api.post(`/api/admin/products/${id}/${action}`, {}); load(); } finally { setBusy(null); } };
  if (error) return <Retry onClick={load} msg="Couldn't load the queue" />;
  if (!data) return <Skels h={104} />;
  if (data.products.length === 0) return <Empty icon="✓" title="Queue is clear" sub="No listings waiting for review." />;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.products.map((p) => (
        <div className="card" key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <div className="img" style={{ width: 56, height: 56, flex: 'none' }}>{p.imageUrls?.[0] ? <img src={p.imageUrls[0]} alt="" /> : <span> </span>}</div>
            <div style={{ flex: 1 }}>
              <div className="h" style={{ fontSize: 13 }}>{p.title}</div>
              <div className="sm mut">{p.shops?.name} · {money(p.price)}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn sm primary" style={{ flex: 1 }} disabled={busy === p.id} onClick={() => act(p.id, 'approve')}>Approve</button>
            <button className="btn sm" style={{ flex: 1, color: '#a2513e', borderColor: '#e0b6a9' }} disabled={busy === p.id} onClick={() => act(p.id, 'reject')}>Reject</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// 19 — IP report queue
function IpReports() {
  const { data, error, load } = useList('/api/ip-reports');
  const [busy, setBusy] = useState(null);
  const act = async (id, action) => { setBusy(id); try { await api.post(`/api/ip-reports/${id}/${action}`, {}); load(); } finally { setBusy(null); } };
  if (error) return <Retry onClick={load} msg="Couldn't load reports" />;
  if (!data) return <Skels h={120} />;
  const open = data.reports.filter((r) => r.status === 'open');
  if (open.length === 0) return <Empty icon="⚑" title="No open reports" sub="IP complaints from buyers or makers land here." />;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {open.map((r) => {
        const shop = r.products?.shops;
        return (
          <div className="card" key={r.id} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="h" style={{ fontSize: 13 }}>"{r.reason}"</div>
            <div className="sm mut">Reported: {r.products?.title || 'product'} · {shop?.name || ''}</div>
            <div style={{ display: 'flex', gap: 5 }}>
              <span className="badge tag">Strikes {shop?.strikeCount ?? 0}/3</span>
              {r.disputed && <span className="badge terra">Disputed</span>}
            </div>
            <div className="sm mut">By {r.reporterName} · {r.reporterEmail}{r.evidenceUrl ? ' · evidence attached' : ''}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn sm primary" style={{ flex: 1 }} disabled={busy === r.id} onClick={() => act(r.id, 'takedown')}>Takedown</button>
              <button className="btn sm" style={{ flex: 1 }} disabled={busy === r.id} onClick={() => act(r.id, 'dismiss')}>Dismiss</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 21 — Seller overview
const SHOP_BADGE = { active: { label: 'Active', style: { background: '#dbe6db', color: '#436a43' } }, suspended: { label: 'Suspended', cls: 'pend' }, banned: { label: 'Banned', style: { background: '#eddad4', color: '#a2513e' } } };
function Sellers() {
  const { data, error, load } = useList('/api/admin/shops');
  const [busy, setBusy] = useState(null);
  const setStatus = async (id, status) => { setBusy(id); try { await api.post(`/api/admin/shops/${id}/status`, { status }); load(); } finally { setBusy(null); } };
  if (error) return <Retry onClick={load} msg="Couldn't load sellers" />;
  if (!data) return <Skels h={54} />;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      {data.shops.map((s) => {
        const b = SHOP_BADGE[s.status] || SHOP_BADGE.active;
        return (
          <div className="card" key={s.id} style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 140 }}>
              <div className="h" style={{ fontSize: 13 }}>{s.name}</div>
              <div className="sm mut">{s.users?.email} · Strikes {s.strikeCount}/3</div>
            </div>
            <span className={`badge ${b.cls || ''}`} style={b.style}>{b.label}</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {s.status === 'active' && <button className="btn sm" disabled={busy === s.id} onClick={() => setStatus(s.id, 'suspended')}>Suspend</button>}
              {s.status !== 'active' && <button className="btn sm" disabled={busy === s.id} onClick={() => setStatus(s.id, 'active')}>Reinstate</button>}
              {s.status !== 'banned' && <button className="btn sm" style={{ color: '#a2513e', borderColor: '#e0b6a9' }} disabled={busy === s.id} onClick={() => setStatus(s.id, 'banned')}>Ban</button>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 20 — Analytics
function Analytics() {
  const { data, error, load } = useList('/api/admin/analytics');
  if (error) return <Retry onClick={load} msg="Couldn't load analytics" />;
  if (!data) return <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>{Array.from({ length: 4 }).map((_, i) => <div className="sk" key={i} style={{ height: 64 }} />)}</div>;
  const tiles = [
    { label: 'Sellers', value: data.sellers },
    { label: 'Products', value: data.products },
    { label: 'Orders', value: data.orders },
    { label: 'GMV', value: money(data.gmv), accent: true },
  ];
  return (
    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
      {tiles.map((t) => (
        <div className="card" key={t.label} style={{ display: 'flex', flexDirection: 'column', gap: 4, borderColor: t.accent ? 'var(--accent)' : undefined }}>
          <div className="sm mut">{t.label}</div>
          <div className="price" style={{ fontSize: 24, color: t.accent ? 'var(--accent)' : undefined }}>{t.value}</div>
        </div>
      ))}
    </div>
  );
}

const Skels = ({ h }) => <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{Array.from({ length: 2 }).map((_, i) => <div className="sk" key={i} style={{ height: h }} />)}</div>;
const Empty = ({ icon, title, sub }) => <div className="center"><div className="emptybox">{icon}</div><div className="h">{title}</div><div className="sm mut" style={{ maxWidth: 200 }}>{sub}</div></div>;
const Retry = ({ onClick, msg }) => <div className="center"><div className="emptybox" style={{ color: '#a2513e' }}>!</div><div className="h">{msg}</div><button className="btn sm primary" onClick={onClick}>Retry</button></div>;

export default function AdminPanel() {
  const { session, loadingSession, profile, loadingProfile } = useAuthCtx();
  const [tab, setTab] = useState('Listings');
  if (loadingSession || loadingProfile) return <div className="center">Loading…</div>;
  if (!session) return <Navigate to="/login" replace />;
  if (profile && profile.role !== 'admin') return <Navigate to="/catalog" replace />;

  return (
    <div className="wrap" style={{ paddingBlock: 18, maxWidth: 820 }}>
      <div className="chiprow" style={{ marginBottom: 16 }}>
        {TABS.map((t) => <span key={t} className={`chip ${tab === t ? 'on' : ''}`} onClick={() => setTab(t)}>{t}</span>)}
      </div>
      {tab === 'Listings' && <Listings />}
      {tab === 'IP Reports' && <IpReports />}
      {tab === 'Sellers' && <Sellers />}
      {tab === 'Analytics' && <Analytics />}
    </div>
  );
}

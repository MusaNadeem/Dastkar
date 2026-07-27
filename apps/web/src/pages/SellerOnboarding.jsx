// Screen 03 — Seller onboarding. Shop profile + required IP declaration -> POST /api/shops.
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { api } from '../lib/apiClient.js';
import { useAuthCtx } from '../context/AuthContext.jsx';

export default function SellerOnboarding() {
  const { session, loadingSession, profile } = useAuthCtx();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [ip, setIp] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  if (loadingSession) return <div className="center">Loading…</div>;
  if (!session) return <Navigate to="/login" replace />;
  if (profile && profile.role !== 'seller') return <Navigate to="/catalog" replace />;

  async function submit() {
    setErr(null);
    setBusy(true);
    try {
      await api.post('/api/shops', { name: name.trim(), bio: bio.trim() || undefined, ipDeclarationAccepted: ip });
      navigate('/account', { replace: true });
    } catch (e) {
      setErr(e.message);
      setBusy(false);
    }
  }

  const valid = name.trim() && ip;

  return (
    <div className="wrap" style={{ maxWidth: 560, paddingBlock: 24 }}>
      <h1 className="h2" style={{ marginBottom: 16 }}>Set up your shop</h1>

      <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
          <div className="avatar" style={{ width: 80, height: 80, fontSize: 24 }}>+</div>
          <button className="btn sm" onClick={() => setErr('Image upload comes in a later update')}>Upload photo</button>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="fg">
            <label className="flbl">Shop name *</label>
            <input className="field" placeholder="e.g. Noor Calligraphy" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="fg">
            <label className="flbl">Bio</label>
            <textarea className="field" placeholder="Tell buyers about your craft…" value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>
          <div className={`radio ${ip ? 'on' : ''}`} style={{ alignItems: 'flex-start' }} onClick={() => setIp(!ip)}>
            <div className={`chk ${ip ? 'on' : ''}`}>{ip ? '✓' : ''}</div>
            <div className="sm" style={{ color: '#4a4843' }}>
              I declare everything I list is my own <b>original work.</b> <span className="accent">(required)</span>
            </div>
          </div>
          {err && <div className="sm accent">{err}</div>}
          <div>
            <button className="btn primary" style={{ minWidth: 160 }} disabled={!valid || busy} onClick={submit}>
              {busy ? 'Creating…' : 'Create shop'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Screen 02 — Role selection (first login only). Irreversible in MVP.
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { api } from '../lib/apiClient.js';
import { useAuthCtx } from '../context/AuthContext.jsx';
import '../styles/app.css';

const OPTIONS = [
  { role: 'buyer', title: "I'm here to buy", sub: 'Browse and order handmade pieces.' },
  { role: 'seller', title: 'I want to sell my work', sub: 'Open a shop and list your craft.' },
];

export default function RoleSelect() {
  const { session, loadingSession, hasProfile, loadingProfile, refreshProfile } = useAuthCtx();
  const [choice, setChoice] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  if (loadingSession) return <div className="dk"><div className="center">Loading…</div></div>;
  if (!session) return <Navigate to="/login" replace />;
  if (!loadingProfile && hasProfile) return <Navigate to="/account" replace />;

  async function submit() {
    if (!choice) return;
    setBusy(true);
    setErr(null);
    try {
      await api.post('/api/users/role', { role: choice });
      await refreshProfile();
      navigate(choice === 'seller' ? '/sell/onboarding' : '/catalog', { replace: true });
    } catch (e) {
      setErr(e.message);
      setBusy(false);
    }
  }

  return (
    <div className="dk">
      <div className="wrap" style={{ maxWidth: 520, paddingBlock: 48 }}>
        <div className="h2" style={{ textAlign: 'center', marginBottom: 18 }}>Welcome — how will you use Dastkar?</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {OPTIONS.map((o) => (
            <div
              key={o.role}
              className="card"
              onClick={() => setChoice(o.role)}
              style={{ cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'flex-start', borderColor: choice === o.role ? 'var(--accent)' : undefined, borderWidth: choice === o.role ? 2 : 1 }}
            >
              <div className="dotr" style={choice === o.role ? { borderColor: 'var(--accent)', background: 'radial-gradient(var(--accent) 42%, transparent 46%)' } : undefined} />
              <div>
                <div className="h">{o.title}</div>
                <div className="sm">{o.sub}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <button className="btn primary" style={{ minWidth: 180 }} disabled={!choice || busy} onClick={submit}>
            {busy ? 'Setting up…' : 'Continue'}
          </button>
        </div>
        <div className="mut" style={{ textAlign: 'center', marginTop: 10 }}>You can't switch roles later in this version.</div>
        {err && <div className="sm" style={{ color: 'var(--accent-ink)', textAlign: 'center', marginTop: 8 }}>{err}</div>}
      </div>
    </div>
  );
}

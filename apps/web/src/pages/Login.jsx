// Screen 01 — Login. Google-only.
import { Navigate } from 'react-router-dom';
import { useAuthCtx } from '../context/AuthContext.jsx';
import { img } from '../lib/img.js';
import '../styles/app.css';

export default function Login() {
  const { session, loadingSession, signInWithGoogle } = useAuthCtx();
  if (loadingSession) return <div className="dk"><div className="center">Loading…</div></div>;
  if (session) return <Navigate to="/account" replace />;

  return (
    <div className="dk">
      <div className="center" style={{ minHeight: '100vh' }}>
        <div className="logo" style={{ fontSize: 30 }}>Dast<span className="dot">·</span>kar</div>
        <div className="sm" style={{ maxWidth: 240 }}>Handmade by Pakistan's independent makers.</div>
        <div className="img" style={{ width: 220, height: 150, margin: '12px 0' }}>
          <img src={img('dastkar-login-handicraft', 440, 300)} alt="Handmade craft by a Pakistani maker" />
        </div>
        <button className="btn primary" style={{ minWidth: 240 }} onClick={signInWithGoogle}>◉&nbsp; Continue with Google</button>
        <div className="mut" style={{ maxWidth: 230 }}>By continuing you agree to the Terms &amp; Privacy Policy.</div>
      </div>
    </div>
  );
}

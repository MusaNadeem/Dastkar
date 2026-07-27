// Minimal authed page proving the full loop: Google session -> JWT -> backend /me.
import { Navigate } from 'react-router-dom';
import { useAuthCtx } from '../context/AuthContext.jsx';

const wrap = { maxWidth: 560, margin: '64px auto', padding: 24, fontFamily: 'sans-serif' };
const btn = { padding: '10px 16px', fontSize: 15, cursor: 'pointer', marginTop: 16 };

export default function Account() {
  const { session, loadingSession, profile, hasProfile, loadingProfile, signOut } = useAuthCtx();

  if (loadingSession || loadingProfile) return <p style={wrap}>Loading...</p>;
  if (!session) return <Navigate to="/login" replace />;
  if (!hasProfile) return <Navigate to="/role" replace />;

  return (
    <div style={wrap}>
      <h1>Signed in</h1>
      <p>Role: <b>{profile?.role}</b></p>
      <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 6, overflow: 'auto' }}>
        {JSON.stringify(profile, null, 2)}
      </pre>
      <button style={btn} onClick={signOut}>Sign out</button>
    </div>
  );
}

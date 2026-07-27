// Role-adaptive shell (wireframe screen G): top nav swaps items by role; footer constant.
// Wraps every app screen in .dk so the warm theme applies. Landing page is untouched.
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuthCtx } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import '../../styles/app.css';

const FOOTER = [
  { title: 'Categories', links: [['Calligraphy', '/catalog'], ['Fine Art', '/catalog'], ['Crafts', '/catalog'], ['Jewelry', '/catalog'], ['Home Decor', '/catalog']] },
  { title: 'Legal', links: [['Terms', '/legal/terms'], ['Privacy', '/legal/privacy'], ['IP Policy', '/legal/ip'], ['Refunds', '/legal/refunds']] },
];

function Logo() {
  return (
    <Link to="/catalog" className="logo">Dast<span className="dot">·</span>kar</Link>
  );
}

export default function AppShell() {
  const { session, profile, signOut } = useAuthCtx();
  const { count } = useCart();
  const navigate = useNavigate();
  const role = profile?.role;

  const roleBadge = role && (
    <span className={`badge ${role === 'admin' ? 'terra' : 'tag'}`}>{role}</span>
  );

  return (
    <div className="dk">
      <header className="topnav">
        <div className="wrap topnav-in">
          <Logo />
          {roleBadge}
          <div className="navsp" />

          {(!role || role === 'buyer') && (
            <>
              <Link className="navlink" to="/catalog">Browse</Link>
              <Link className="navlink" to="/cart">Cart{count > 0 ? ` (${count})` : ''}</Link>
              {session ? (
                <Link className="navlink" to="/orders">Orders</Link>
              ) : null}
            </>
          )}
          {role === 'seller' && (
            <>
              <Link className="navlink" to="/catalog">Browse</Link>
              <Link className="navlink" to="/seller">Dashboard</Link>
            </>
          )}
          {role === 'admin' && (
            <>
              <Link className="navlink" to="/catalog">Browse</Link>
              <Link className="navlink" to="/admin">Admin</Link>
            </>
          )}

          {session ? (
            <Link className="navlink" to="/account">Account</Link>
          ) : (
            <Link className="btn sm primary" to="/login">Sign in</Link>
          )}
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="foot">
        <div className="wrap foot-in">
          <div className="col" style={{ minWidth: 160 }}>
            <div className="logo" style={{ fontSize: 18, marginBottom: 8 }}>Dast<span className="dot">·</span>kar</div>
            <div className="mut" style={{ maxWidth: 220 }}>Handmade by Pakistan's independent makers.</div>
          </div>
          {FOOTER.map((c) => (
            <div className="col" key={c.title}>
              <b>{c.title}</b>
              {c.links.map(([label, to]) => <span key={label} onClick={() => navigate(to)}>{label}</span>)}
            </div>
          ))}
          {session && (
            <div className="col">
              <b>Account</b>
              <span onClick={() => signOut()}>Sign out</span>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}

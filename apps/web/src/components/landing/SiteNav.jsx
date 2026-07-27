import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BRAND } from '../../lib/brand.js';

const LINKS = [
  { label: 'Browse', href: '/catalog' },
  { label: 'How it works', href: '#how' },
  { label: 'Custom orders', href: '#custom' },
  { label: 'For makers', href: '#sell' },
];

// Section anchors stay as <a>; app routes use client-side <Link>.
function NavItem({ href, label, onClick, className }) {
  if (href.startsWith('/')) return <Link to={href} onClick={onClick} className={className}>{label}</Link>;
  return <a href={href} onClick={onClick} className={className}>{label}</a>;
}

export default function SiteNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="nav">
      <div className="container nav-inner">
        <a className="nav-logo" href="#top">{BRAND.name.slice(0, -3)}<b>{BRAND.name.slice(-3)}</b></a>

        <nav className="nav-links" aria-label="Primary">
          {LINKS.map((l) => <NavItem key={l.href} href={l.href} label={l.label} />)}
        </nav>

        <div className="nav-cta">
          <Link className="btn btn-secondary" to="/login">Sell your work</Link>
        </div>

        <button
          className="nav-toggle"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
      </div>

      {open && (
        <div className="container">
          <nav className="nav-mobile" aria-label="Mobile">
            {LINKS.map((l) => (
              <NavItem key={l.href} href={l.href} label={l.label} onClick={() => setOpen(false)} />
            ))}
            <Link className="btn btn-primary" to="/login" onClick={() => setOpen(false)}>Sell your work</Link>
          </nav>
        </div>
      )}
    </header>
  );
}

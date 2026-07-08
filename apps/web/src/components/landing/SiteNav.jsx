import { useState } from 'react';
import { BRAND } from '../../lib/brand.js';

const LINKS = [
  { label: 'Browse', href: '#categories' },
  { label: 'How it works', href: '#how' },
  { label: 'Custom orders', href: '#custom' },
  { label: 'For makers', href: '#sell' },
];

export default function SiteNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="nav">
      <div className="container nav-inner">
        <a className="nav-logo" href="#top">{BRAND.name.slice(0, -3)}<b>{BRAND.name.slice(-3)}</b></a>

        <nav className="nav-links" aria-label="Primary">
          {LINKS.map((l) => <a key={l.href} href={l.href}>{l.label}</a>)}
        </nav>

        <div className="nav-cta">
          <a className="btn btn-secondary" href="#sell">Sell your work</a>
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
              <a key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
            ))}
            <a className="btn btn-primary" href="#sell" onClick={() => setOpen(false)}>Sell your work</a>
          </nav>
        </div>
      )}
    </header>
  );
}

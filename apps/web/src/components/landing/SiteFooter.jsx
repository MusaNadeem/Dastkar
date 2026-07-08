import { BRAND } from '../../lib/brand.js';

const COLS = [
  { h: 'Marketplace', links: ['Browse', 'Categories', 'Custom orders', 'Featured makers'] },
  { h: 'For makers', links: ['Sell your work', 'How it works', 'Pricing', 'Maker guide'] },
  { h: 'Company', links: ['About', 'Contact', 'Careers'] },
  { h: 'Legal', links: ['Terms of Service', 'Privacy Policy', 'IP Policy', 'Refund Policy'] },
];

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="container footer-top">
        <div className="footer-brand">
          <a className="nav-logo" href="#top">{BRAND.name.slice(0, -3)}<b>{BRAND.name.slice(-3)}</b></a>
          <p>A curated marketplace for handmade and original work by independent Pakistani makers.</p>
        </div>
        {COLS.map((c) => (
          <nav className="footer-col" key={c.h} aria-label={c.h}>
            <h4>{c.h}</h4>
            {c.links.map((l) => <a key={l} href="#top">{l}</a>)}
          </nav>
        ))}
      </div>
      <div className="container footer-bottom">
        <span>© 2026 {BRAND.name}. Handmade in Pakistan.</span>
        <span>Lahore, Karachi, Islamabad</span>
      </div>
    </footer>
  );
}

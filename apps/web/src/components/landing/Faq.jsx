import { useState } from 'react';

const FAQS = [
  { q: 'What can I sell here?', a: 'Original handmade work that you made or hold the rights to sell: art, craft, calligraphy, jewelry, and home decor. Every seller signs an IP declaration at sign-up.' },
  { q: 'How do payments work?', a: 'Buyers pay cash on delivery or online at checkout. For digital payments, the amount is held until the order is confirmed shipped, so both sides are covered.' },
  { q: 'How do custom orders work?', a: 'You send a brief, the artist replies with a quote, and you approve it before work starts. You pay a deposit, follow progress photos, then pay the balance before it ships.' },
  { q: 'What does it cost to sell?', a: 'Listing is free. We take a commission of 10 to 15 percent only when you make a sale, and founding makers pay zero commission for their first six months.' },
  { q: 'What if someone copies my work?', a: 'Report the listing from its page. Valid claims are taken down quickly, and repeat offenders are removed under a three-strikes policy.' },
];

export default function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="section" id="faq">
      <div className="container faq-grid">
        <div>
          <span className="eyebrow">Questions</span>
          <h2 className="section-title" style={{ marginTop: '0.7rem' }}>Good to know.</h2>
        </div>
        <div className="faq-list">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className={`faq-item ${isOpen ? 'open' : ''}`}>
                <button
                  className="faq-q"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                >
                  {f.q}
                  <span className="faq-sign" aria-hidden="true" />
                </button>
                <div className="faq-a" role="region">
                  <p>{f.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

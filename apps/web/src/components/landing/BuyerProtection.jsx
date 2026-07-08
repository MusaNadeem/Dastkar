import Reveal from './Reveal.jsx';

const POINTS = [
  { k: '01', title: 'Payment held until it ships', body: 'Your money is not released to the seller until your order is confirmed on its way to you.' },
  { k: '02', title: 'Deposit-protected commissions', body: 'Custom work runs on a documented brief, quote, and progress photos, so disputes have a record.' },
  { k: '03', title: 'Report stolen work', body: 'Every listing has a report button. Valid claims are taken down fast, with a three-strikes policy for repeat offenders.' },
  { k: '04', title: 'Real tracking, one place', body: 'Order status and tracking numbers live on the order page, not scattered across chat threads.' },
];

export default function BuyerProtection() {
  return (
    <section className="section protect" id="protection">
      <div className="container protect-grid">
        <div className="protect-lead">
          <h2>Bought with confidence, sold with proof.</h2>
          <p className="muted">
            The trust that a WhatsApp sale runs on is invisible. Here it is built into every order.
          </p>
        </div>
        <div className="protect-list">
          {POINTS.map((p, i) => (
            <Reveal key={p.k} className="protect-item" delay={i * 70}>
              <h3><span className="k">{p.k}</span>{p.title}</h3>
              <p>{p.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

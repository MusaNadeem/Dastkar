import Reveal from './Reveal.jsx';

// Verb-noun labels, not "Step 1 / Step 2" (skill 9.F banned step labels).
const STEPS = [
  { n: '1', title: 'Discover', body: 'Find makers and original work by category, city, or a quick search. Every listing is reviewed before it appears.' },
  { n: '2', title: 'Order', body: 'Pay cash on delivery or online at checkout. Your payment is held until your order is on its way.' },
  { n: '3', title: 'Track', body: 'Follow each order from confirmed to shipped to delivered, all in one place. No status-chasing on WhatsApp.' },
];

export default function HowItWorks() {
  return (
    <section className="section" id="how">
      <div className="container steps-wrap">
        <div className="steps-head">
          <h2 className="section-title">Buying, without the back and forth.</h2>
        </div>
        <div className="steps">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} className="step" delay={i * 90}>
              <div className="step-num">{s.n}</div>
              <div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

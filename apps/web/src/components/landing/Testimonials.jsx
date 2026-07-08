import Reveal from './Reveal.jsx';
import { img } from '../../lib/img.js';

// Quotes <= 3 lines, attribution = name + role + city (skill 4.10). No em-dashes.
const QUOTES = [
  { body: 'I used to lose half my orders somewhere in my DMs. Now people check out in one go and I just make and ship.', name: 'Zahra Khalid', meta: 'Ceramicist, Lahore', seed: 'maker-zahra-ceramics' },
  { body: 'I commissioned a name plate in Nastaliq, watched the progress photos, approved it, and paid the balance. Nothing got lost.', name: 'Areeba Nadeem', meta: 'Buyer, Islamabad', seed: 'buyer-areeba' },
  { body: 'The custom flow has the awkward money conversation for me. I send a quote, they pay a deposit, and I start.', name: 'Bilal Qureshi', meta: 'Resin artist, Multan', seed: 'maker-bilal-resin' },
];

export default function Testimonials() {
  return (
    <section className="section" id="stories">
      <div className="container">
        <div className="quotes-head">
          <h2 className="section-title">Makers and buyers, in their words.</h2>
        </div>
        <div className="quotes-grid">
          {QUOTES.map((q, i) => (
            <Reveal key={q.name} className="quote" delay={i * 80}>
              <p className="quote-body">{q.body}</p>
              <div className="quote-attr">
                <img src={img(q.seed, 96, 96)} alt="" loading="lazy" />
                <div>
                  <div className="name">{q.name}</div>
                  <div className="meta">{q.meta}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

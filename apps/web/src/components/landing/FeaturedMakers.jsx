import Reveal from './Reveal.jsx';
import { img } from '../../lib/img.js';

// Real, locale-appropriate names (skill 9.D - no "Jane Doe"). Varied image ratios
// drive the masonry rhythm.
const MAKERS = [
  { name: 'Zahra Khalid', role: 'Ceramics & glaze', city: 'Lahore', seed: 'maker-zahra-ceramics', h: 620 },
  { name: 'Imran Sethi', role: 'Calligraphy', city: 'Karachi', seed: 'maker-imran-calligraphy', h: 460 },
  { name: 'Areeba Nadeem', role: 'Textile art', city: 'Islamabad', seed: 'maker-areeba-textile', h: 540 },
  { name: 'Bilal Qureshi', role: 'Resin & wood', city: 'Multan', seed: 'maker-bilal-resin', h: 500 },
  { name: 'Sana Rauf', role: 'Handmade jewelry', city: 'Lahore', seed: 'maker-sana-jewelry', h: 600 },
  { name: 'Hassan Raza', role: 'Miniature painting', city: 'Rawalpindi', seed: 'maker-hassan-miniature', h: 470 },
];

export default function FeaturedMakers() {
  return (
    <section className="section makers" id="makers">
      <div className="container">
        <div className="bento-head">
          <div>
            <h2 className="section-title">Makers worth following.</h2>
            <p className="muted" style={{ marginTop: '0.7rem', maxWidth: '46ch' }}>
              Independent artists building a real living from handmade work. Every shop is reviewed before it goes live.
            </p>
          </div>
        </div>

        <div className="makers-grid">
          {MAKERS.map((m, i) => (
            <Reveal key={m.name} className="maker" delay={(i % 3) * 90}>
              <article className="maker-card">
                <img src={img(m.seed, 640, m.h)} alt={`Work by ${m.name}`} loading="lazy" />
                <div className="maker-info">
                  <h3>{m.name}</h3>
                  <div className="role">{m.role}</div>
                  <div className="city">{m.city}</div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

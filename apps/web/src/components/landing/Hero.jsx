import { Link } from 'react-router-dom';
import Reveal from './Reveal.jsx';
import { img } from '../../lib/img.js';

// Hero discipline (skill 4.7): headline <= 2 lines, subtext <= 20 words,
// both CTAs visible, no eyebrow / trust-strip / tagline clutter, max 4 text elements.
export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="container hero-grid">
        <div className="hero-copy">
          <h1><em>Handmade</em> goods, straight from Pakistan's makers.</h1>
          <p className="hero-sub">
            Browse original art, craft, and calligraphy, or commission a custom piece.
            No DMs, no guesswork, no lost orders.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/catalog">Browse the marketplace</Link>
            <Link className="btn btn-secondary" to="/login">Sell your work</Link>
          </div>
        </div>

        <Reveal className="hero-media" delay={120}>
          <div className="frame">
            <img
              src={img('kaarigar-hero-ceramic-studio', 900, 1120)}
              alt="A maker's hands finishing a glazed ceramic bowl"
              loading="eager"
            />
          </div>
          <div className="frame small">
            <img
              src={img('kaarigar-hero-calligraphy-detail', 520, 700)}
              alt="Close detail of hand-lettered calligraphy on paper"
              loading="lazy"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

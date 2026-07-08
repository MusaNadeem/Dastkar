import Reveal from './Reveal.jsx';
import { img } from '../../lib/img.js';

// Exactly 6 cells for 6 categories (skill 4.7 bento cell-count rule). Backgrounds are
// real images, not white-on-white cards (bento background diversity).
const CATEGORIES = [
  { key: 'fine-art', name: 'Fine Art', blurb: 'Paintings, prints, and original works', cls: 'feature', seed: 'kaarigar-cat-fineart-oil', w: 900, h: 700 },
  { key: 'calligraphy', name: 'Calligraphy & Islamic Art', blurb: 'Nastaliq, thuluth, and modern script', cls: 'wide', seed: 'kaarigar-cat-calligraphy', w: 640, h: 420 },
  { key: 'jewelry', name: 'Jewelry', blurb: 'Handmade, meenakari, and silver', cls: 'wide', seed: 'kaarigar-cat-jewelry', w: 640, h: 420 },
  { key: 'crafts', name: 'Handmade Crafts', blurb: 'Resin, crochet, pottery, wood', cls: 'third', seed: 'kaarigar-cat-crafts-resin', w: 520, h: 360 },
  { key: 'decor', name: 'Home Decor', blurb: 'Textiles, lamps, and wall pieces', cls: 'third', seed: 'kaarigar-cat-homedecor', w: 520, h: 360 },
  { key: 'custom', name: 'Custom Orders', blurb: 'Commission something one of a kind', cls: 'third', seed: 'kaarigar-cat-custom', w: 520, h: 360 },
];

export default function CategoryBento() {
  return (
    <section className="section" id="categories">
      <div className="container">
        <div className="bento-head">
          <div>
            <span className="eyebrow">Browse by category</span>
            <h2 className="section-title" style={{ marginTop: '0.7rem' }}>Six ways in, one place to look.</h2>
          </div>
        </div>

        <Reveal className="bento">
          {CATEGORIES.map((c) => (
            <a key={c.key} className={`tile ${c.cls}`} href={`#categories`} aria-label={c.name}>
              <img src={img(c.seed, c.w, c.h)} alt="" loading="lazy" />
              <div className="tile-body">
                <h3>{c.name}</h3>
                <p>{c.blurb}</p>
              </div>
            </a>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

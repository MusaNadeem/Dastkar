import Reveal from './Reveal.jsx';
import { img } from '../../lib/img.js';

const FLOW = ['Describe it', 'Get a quote', 'Pay a deposit', 'Watch progress photos', 'Pay the balance', 'It ships'];

export default function CustomOrders() {
  return (
    <section className="section" id="custom">
      <div className="container custom-grid">
        <Reveal className="custom-media">
          <img src={img('kaarigar-custom-commission-portrait', 900, 720)} alt="An artist working on a commissioned portrait" loading="lazy" />
        </Reveal>
        <div className="custom-copy">
          <span className="eyebrow">Custom orders</span>
          <h2 style={{ marginTop: '0.7rem' }}>Commission something made only for you.</h2>
          <p>
            Describe what you want, get a quote from the artist, and approve before any work starts.
            Progress photos keep you in the loop, and the deposit protects you both.
          </p>
          <div className="custom-flow">
            {FLOW.map((f) => <span key={f}>{f}</span>)}
          </div>
          <a className="btn btn-primary" href="#categories">Browse the marketplace</a>
        </div>
      </div>
    </section>
  );
}

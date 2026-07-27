import { Link } from 'react-router-dom';

export default function FinalCta() {
  return (
    <section className="section final">
      <div className="container final-inner">
        <h2>Bring Pakistan's handmade online.</h2>
        <p>Whether you make it or you are looking for it, this is the place to start.</p>
        <div className="final-actions">
          <Link className="btn btn-invert" to="/catalog">Browse the marketplace</Link>
          <Link className="btn btn-ghost-invert" to="/login">Sell your work</Link>
        </div>
      </div>
    </section>
  );
}

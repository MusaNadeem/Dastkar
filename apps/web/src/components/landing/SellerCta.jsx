import { Link } from 'react-router-dom';
import { img } from '../../lib/img.js';

export default function SellerCta() {
  return (
    <section className="sell" id="sell">
      <img src={img('kaarigar-seller-workshop-hands', 1600, 900)} alt="A maker photographing finished work in a home studio" loading="lazy" />
      <div className="container">
        <div className="sell-inner">
          <h2>Turn your following into a real storefront.</h2>
          <p>
            List in minutes, manage every order from one dashboard, and get paid without chasing
            bank-transfer screenshots. Founding makers pay zero commission for the first six months.
          </p>
          <Link className="btn btn-invert" to="/login">Sell your work</Link>
        </div>
      </div>
    </section>
  );
}

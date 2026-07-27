// Screen 07 — Cart. Local cart state; server re-computes totals at checkout.
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { money } from '../lib/format.js';

export default function Cart() {
  const { items, setQty, remove, total } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="center">
        <div className="emptybox">▤</div>
        <div className="h">Your cart is empty</div>
        <div className="sm mut">Find something handmade to start.</div>
        <button className="btn sm primary" onClick={() => navigate('/catalog')}>Browse the marketplace</button>
      </div>
    );
  }

  return (
    <div className="wrap" style={{ paddingBlock: 20, maxWidth: 720 }}>
      <h1 className="h2" style={{ marginBottom: 16 }}>Your cart</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((i) => (
          <div className="card" key={i.productId} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div className="img" style={{ width: 64, height: 64, borderRadius: 8, flex: 'none' }}>
              {i.image ? <img src={i.image} alt="" /> : <span>photo</span>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="h" style={{ fontSize: 13 }}>{i.title}</div>
              <div className="sm mut">{i.shopName}</div>
              <div className="price" style={{ marginTop: 4 }}>{money(i.price)}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
              <div className="chiprow" style={{ flexWrap: 'nowrap' }}>
                <span className="chip" onClick={() => setQty(i.productId, i.qty - 1)}>−</span>
                <span className="chip on" style={{ minWidth: 34, justifyContent: 'center' }}>{i.qty}</span>
                <span className="chip" onClick={() => setQty(i.productId, i.qty + 1)}>+</span>
              </div>
              <span className="ghost btn sm" style={{ height: 'auto', padding: 0 }} onClick={() => remove(i.productId)}>Remove</span>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span className="sm">Subtotal</span>
          <span className="price">{money(total)}</span>
        </div>
        <div className="mut" style={{ marginBottom: 12 }}>Shipping calculated at checkout.</div>
        <button className="btn block primary" onClick={() => navigate('/checkout')}>Proceed to checkout</button>
      </div>
    </div>
  );
}

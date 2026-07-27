// Screen 06 — Public shop page. GET /api/shops/:id -> { shop, products }.
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/apiClient.js';
import { money } from '../lib/format.js';
import { img } from '../lib/img.js';

const initials = (name) => (name || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

export default function Shop() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function load() {
    setLoading(true);
    setError(null);
    api.get(`/api/shops/${id}`).then(setData).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }
  useEffect(load, [id]);

  if (loading) {
    return (
      <div className="wrap" style={{ paddingBlock: 20, maxWidth: 760 }}>
        <div className="sk" style={{ height: 90 }} />
        <div className="sk" style={{ height: 16, width: '40%', margin: '14px 0' }} />
        <div className="grid cards">{Array.from({ length: 4 }).map((_, i) => <div className="sk" key={i} style={{ height: 120 }} />)}</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="center">
        <div className="emptybox" style={{ color: '#a2513e' }}>!</div>
        <div className="h">Couldn't load this shop</div>
        <button className="btn sm primary" onClick={load}>Retry</button>
      </div>
    );
  }

  const { shop, products } = data;
  return (
    <div className="wrap" style={{ paddingBlock: 20, maxWidth: 820 }}>
      <div className="img" style={{ height: 150 }}>
        <img src={img(`shop-banner-workshop-${shop.id}`, 1400, 350)} alt={`${shop.name} workshop`} />
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, marginTop: -34, padding: '0 4px', marginBottom: 12 }}>
        <div className="avatar" style={{ width: 66, height: 66, border: '3px solid var(--surface)' }}>
          {shop.profileImageUrl ? <img src={shop.profileImageUrl} alt="" /> : initials(shop.name)}
        </div>
        <div style={{ paddingBottom: 4 }}>
          <div className="h2">{shop.name}</div>
          <div className="sm mut">{shop.status === 'active' ? 'Handmade to order' : shop.status}</div>
        </div>
      </div>
      {shop.bio && <p className="sm" style={{ marginBottom: 16, lineHeight: 1.6 }}>{shop.bio}</p>}

      {products.length === 0 ? (
        <div className="center">
          <div className="emptybox">◱</div>
          <div className="sm mut" style={{ maxWidth: 220 }}>This maker hasn't listed anything yet. Check back soon.</div>
        </div>
      ) : (
        <div className="grid cards">
          {products.map((p) => (
            <div className="pcard" key={p.id} onClick={() => navigate(`/product/${p.id}`)}>
              <div className="img">{p.imageUrls?.[0] ? <img src={p.imageUrls[0]} alt={p.title} /> : <span>photo</span>}</div>
              <div className="meta">
                <div className="h" style={{ fontSize: 13 }}>{p.title}</div>
                <div className="price">{money(p.price)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

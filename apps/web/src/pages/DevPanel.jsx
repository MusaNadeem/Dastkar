// Plain backend test harness (no styling system, no design skill). Exercises every
// Sprint 1 endpoint as buyer/seller/admin via dev-auth. Route: /dev
import { useEffect, useState } from 'react';
import { devFetch } from '../lib/devApi.js';

const box = { border: '1px solid #ccc', borderRadius: 6, padding: 12, marginBottom: 12 };
const row = { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 8 };
const mono = { fontFamily: 'monospace', fontSize: 13 };

export default function DevPanel() {
  const [users, setUsers] = useState([]);
  const [actAs, setActAs] = useState('');
  const [resp, setResp] = useState(null);
  const [loading, setLoading] = useState(false);

  // form state
  const [role, setRole] = useState('seller');
  const [shop, setShop] = useState({ name: 'My Test Shop', bio: 'Handmade things', ip: true });
  const [product, setProduct] = useState({ title: 'Test Vase', price: '2500', description: 'A blue vase', stock: '3', custom: false });
  const [productId, setProductId] = useState('');
  const [patchPrice, setPatchPrice] = useState('3000');
  const [shopId, setShopId] = useState('');

  async function run(label, promise) {
    setLoading(true);
    const result = await promise;
    setResp({ label, ...result });
    setLoading(false);
    return result;
  }

  async function loadUsers() {
    const r = await run('GET /api/dev/users', devFetch('/api/dev/users'));
    if (r.ok && r.data.users) {
      setUsers(r.data.users);
      const seller = r.data.users.find((u) => u.role === 'seller');
      if (seller && !actAs) setActAs(seller.id);
    }
  }

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = users.find((u) => u.id === actAs);

  return (
    <div style={{ maxWidth: 900, margin: '24px auto', padding: 16, fontFamily: 'sans-serif' }}>
      <h1>Backend Test Panel</h1>
      <p style={{ color: '#555' }}>
        Requires the API running with <code>ALLOW_DEV_AUTH=true</code> and seeded users
        (<code>npm run seed:dev</code>). Every call is sent as the selected user.
      </p>

      <div style={box}>
        <div style={row}>
          <button onClick={loadUsers}>Reload users</button>
          <button onClick={() => run('GET /health', devFetch('/health'))}>GET /health</button>
        </div>
        <div style={row}>
          <label><b>Act as:</b></label>
          <select value={actAs} onChange={(e) => setActAs(e.target.value)}>
            <option value="">(none / unauthenticated)</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.role} — {u.email}</option>
            ))}
          </select>
          {current && <span style={mono}>{current.id}</span>}
        </div>
      </div>

      <div style={box}>
        <h3>Users</h3>
        <div style={row}>
          <button onClick={() => run('GET /api/users/me', devFetch('/api/users/me', { actAs }))}>GET /me</button>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="buyer">buyer</option>
            <option value="seller">seller</option>
          </select>
          <button onClick={() => run('POST /api/users/role', devFetch('/api/users/role', { method: 'POST', actAs, body: { role } }))}>
            POST /role
          </button>
        </div>
      </div>

      <div style={box}>
        <h3>Shops (seller)</h3>
        <div style={row}>
          <input placeholder="name" value={shop.name} onChange={(e) => setShop({ ...shop, name: e.target.value })} />
          <input placeholder="bio" value={shop.bio} onChange={(e) => setShop({ ...shop, bio: e.target.value })} />
          <label><input type="checkbox" checked={shop.ip} onChange={(e) => setShop({ ...shop, ip: e.target.checked })} /> IP declaration</label>
          <button onClick={() => run('POST /api/shops', devFetch('/api/shops', { method: 'POST', actAs, body: { name: shop.name, bio: shop.bio, ipDeclarationAccepted: shop.ip } }))}>
            POST /shops
          </button>
        </div>
        <div style={row}>
          <button onClick={() => run('GET /api/shops/mine', devFetch('/api/shops/mine', { actAs }))}>GET /shops/mine</button>
          <input placeholder="shop id" value={shopId} onChange={(e) => setShopId(e.target.value)} style={{ width: 300 }} />
          <button onClick={() => run('GET /api/shops/:id', devFetch(`/api/shops/${shopId}`))}>GET /shops/:id (public)</button>
        </div>
      </div>

      <div style={box}>
        <h3>Products</h3>
        <div style={row}>
          <input placeholder="title" value={product.title} onChange={(e) => setProduct({ ...product, title: e.target.value })} />
          <input placeholder="price" value={product.price} onChange={(e) => setProduct({ ...product, price: e.target.value })} style={{ width: 90 }} />
          <input placeholder="stock" value={product.stock} onChange={(e) => setProduct({ ...product, stock: e.target.value })} style={{ width: 70 }} />
          <label><input type="checkbox" checked={product.custom} onChange={(e) => setProduct({ ...product, custom: e.target.checked })} /> custom orders</label>
        </div>
        <div style={row}>
          <button onClick={() => run('POST /api/products', devFetch('/api/products', { method: 'POST', actAs, body: { title: product.title, description: product.description, price: Number(product.price), stockQuantity: Number(product.stock), customOrdersEnabled: product.custom } }))}>
            POST /products (seller)
          </button>
          <button onClick={() => run('GET /api/products/mine', devFetch('/api/products/mine', { actAs }))}>GET /products/mine</button>
          <button onClick={() => run('GET /api/products', devFetch('/api/products'))}>GET /products (public)</button>
        </div>
        <div style={row}>
          <input placeholder="product id" value={productId} onChange={(e) => setProductId(e.target.value)} style={{ width: 300 }} />
          <button onClick={() => run('GET /api/products/:id', devFetch(`/api/products/${productId}`))}>GET :id</button>
          <input placeholder="new price" value={patchPrice} onChange={(e) => setPatchPrice(e.target.value)} style={{ width: 90 }} />
          <button onClick={() => run('PATCH /api/products/:id', devFetch(`/api/products/${productId}`, { method: 'PATCH', actAs, body: { price: Number(patchPrice) } }))}>PATCH :id</button>
          <button onClick={() => run('DELETE /api/products/:id', devFetch(`/api/products/${productId}`, { method: 'DELETE', actAs }))}>DELETE :id</button>
        </div>
      </div>

      <div style={box}>
        <h3>Admin</h3>
        <div style={row}>
          <button onClick={() => run('GET /api/admin/products/pending', devFetch('/api/admin/products/pending', { actAs }))}>GET pending</button>
          <input placeholder="product id" value={productId} onChange={(e) => setProductId(e.target.value)} style={{ width: 300 }} />
          <button onClick={() => run('POST approve', devFetch(`/api/admin/products/${productId}/approve`, { method: 'POST', actAs }))}>Approve</button>
          <button onClick={() => run('POST reject', devFetch(`/api/admin/products/${productId}/reject`, { method: 'POST', actAs }))}>Reject</button>
        </div>
      </div>

      <div style={box}>
        <h3>Response {loading && '(loading...)'}</h3>
        {resp && (
          <div>
            <div style={mono}>
              <b>{resp.label}</b> — status{' '}
              <span style={{ color: resp.ok ? 'green' : 'crimson' }}>{resp.status}</span>
            </div>
            <pre style={{ ...mono, background: '#f5f5f5', padding: 10, overflow: 'auto', maxHeight: 320 }}>
              {JSON.stringify(resp.data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

// Screen 04 — Catalog / Browse. Wired to GET /api/products + /api/categories.
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/apiClient.js';
import { money } from '../lib/format.js';

const SORTS = [
  { v: 'newest', label: 'Newest' },
  { v: 'price_asc', label: 'Price: low to high' },
  { v: 'price_desc', label: 'Price: high to low' },
];

function ProductCard({ p, onClick }) {
  return (
    <div className="pcard" onClick={onClick}>
      <div className="img">
        {p.imageUrls?.[0] ? <img src={p.imageUrls[0]} alt={p.title} /> : <span>photo</span>}
      </div>
      <div className="meta">
        <div className="h" style={{ fontSize: 13, lineHeight: 1.3 }}>{p.title}</div>
        <div className="price">{money(p.price)}</div>
        <div className="sm mut">{p.shops?.name}</div>
      </div>
    </div>
  );
}

function Skeletons() {
  return (
    <div className="grid cards">
      {Array.from({ length: 8 }).map((_, i) => (
        <div className="pcard" key={i}>
          <div className="sk" style={{ aspectRatio: '4 / 3' }} />
          <div className="meta">
            <div className="sk" style={{ height: 10 }} />
            <div className="sk" style={{ height: 13, width: '50%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Catalog() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [q, setQ] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const debounce = useRef();

  useEffect(() => {
    api.get('/api/categories').then((r) => setCategories(r.categories)).catch(() => {});
  }, []);

  function load() {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (categoryId) params.set('categoryId', categoryId);
    params.set('sort', sort);
    params.set('page', String(page));
    api
      .get(`/api/products?${params.toString()}`)
      .then((r) => setData(r))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  // Debounce keyword; refetch on any filter change.
  useEffect(() => {
    clearTimeout(debounce.current);
    debounce.current = setTimeout(load, q ? 350 : 0);
    return () => clearTimeout(debounce.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, categoryId, sort, page]);

  const clearFilters = () => {
    setQ('');
    setCategoryId('');
    setSort('newest');
    setPage(1);
  };

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="wrap" style={{ paddingBlock: 20 }}>
      <input
        className="field"
        placeholder="Search calligraphy, resin, jewelry…"
        value={q}
        onChange={(e) => { setPage(1); setQ(e.target.value); }}
        style={{ marginBottom: 12 }}
      />

      <div className="chiprow" style={{ marginBottom: 8 }}>
        <span className={`chip ${!categoryId ? 'on' : ''}`} onClick={() => { setPage(1); setCategoryId(''); }}>All</span>
        {categories.map((c) => (
          <span
            key={c.id}
            className={`chip ${categoryId === c.id ? 'on' : ''}`}
            onClick={() => { setPage(1); setCategoryId(c.id); }}
          >
            {c.name}
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '10px 0 16px', flexWrap: 'wrap', gap: 8 }}>
        <span className="mut">{data ? `${data.total} piece${data.total === 1 ? '' : 's'}` : ' '}</span>
        <label className="sm" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          Sort
          <select className="field" style={{ width: 'auto', minHeight: 34 }} value={sort} onChange={(e) => { setPage(1); setSort(e.target.value); }}>
            {SORTS.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}
          </select>
        </label>
      </div>

      {loading && <Skeletons />}

      {!loading && error && (
        <div className="center">
          <div className="emptybox" style={{ color: '#a2513e' }}>!</div>
          <div className="h">Couldn't load the catalog</div>
          <div className="sm mut" style={{ maxWidth: 240 }}>{error}</div>
          <button className="btn sm primary" onClick={load}>Retry</button>
        </div>
      )}

      {!loading && !error && data && data.products.length === 0 && (
        <div className="center">
          <div className="emptybox">∅</div>
          <div className="h">No pieces match your search</div>
          <div className="sm mut" style={{ maxWidth: 240 }}>Try fewer filters or a different keyword.</div>
          <button className="btn sm" onClick={clearFilters}>Clear filters</button>
        </div>
      )}

      {!loading && !error && data && data.products.length > 0 && (
        <>
          <div className="grid cards">
            {data.products.map((p) => (
              <ProductCard key={p.id} p={p} onClick={() => navigate(`/product/${p.id}`)} />
            ))}
          </div>
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 20 }}>
              {Array.from({ length: totalPages }).map((_, i) => (
                <span key={i} className={`chip ${page === i + 1 ? 'on' : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</span>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

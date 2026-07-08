// Minimal fetch wrapper for the backend test panel. Sends the dev-auth header so the
// API treats the request as the selected seeded user (buyer/seller/admin).
const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export async function devFetch(path, { method = 'GET', body, actAs } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (actAs) headers['x-dev-user-id'] = actAs;
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    return { status: 0, ok: false, data: { error: `Network error: ${err.message}. Is the API running on ${BASE}?` } };
  }
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, ok: res.ok, data };
}

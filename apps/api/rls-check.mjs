// Verifies RLS by hitting the DB directly with the PUBLISHABLE (anon) key, no login.
// Denied reads return 0 rows (not an error); denied writes return an error.
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';
if (!globalThis.WebSocket) globalThis.WebSocket = WebSocket;

const anon = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: false },
});

async function read(label, q) {
  const { data, error } = await q;
  console.log(`${label.padEnd(46)} rows=${Array.isArray(data) ? data.length : 'n/a'}  err=${error?.message || 'none'}`);
}

console.log('=== ANON (publishable key, not logged in) — direct DB reads ===');
await read('categories (want: readable)', anon.from('categories').select('name'));
await read('approved products (want: >=1)', anon.from('products').select('id').eq('status', 'approved'));
await read('all products (want: only approved)', anon.from('products').select('id,status'));
await read('active shops (want: readable)', anon.from('shops').select('id').eq('status', 'active'));
await read('users (want: 0 = blocked)', anon.from('users').select('id'));
await read('orders (want: 0 = blocked)', anon.from('orders').select('id'));
await read('ip_reports (want: 0 = blocked)', anon.from('ip_reports').select('id'));

const ins = await anon.from('products').insert({ shop_id: '00000000-0000-0000-0000-000000000000', title: 'x', price: 1 });
console.log(`anon insert product (want: blocked)          err=${ins.error?.message || 'NO ERROR -- BAD'}`);
process.exit(0);

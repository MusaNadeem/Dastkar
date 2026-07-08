// Seeds three test users (buyer / seller / admin) plus a shop for the seller, so the
// backend can be exercised end-to-end via dev-auth before Google OAuth is wired.
// Idempotent: safe to run repeatedly. Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
import 'dotenv/config';
import { supabaseAdmin, SUPABASE_CONFIGURED } from './client.js';

if (!SUPABASE_CONFIGURED) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in apps/api/.env');
  process.exit(1);
}

const SEED = [
  { email: 'buyer@dev.local', role: 'buyer', fullName: 'Dev Buyer' },
  { email: 'seller@dev.local', role: 'seller', fullName: 'Dev Seller' },
  { email: 'admin@dev.local', role: 'admin', fullName: 'Dev Admin' },
];
const PASSWORD = 'devpassword123';

async function findAuthUserByEmail(email) {
  // Paginate through auth users to find an existing one.
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const found = data.users.find((u) => u.email === email);
    if (found) return found;
    if (data.users.length < 200) break;
  }
  return null;
}

async function ensureUser({ email, role, fullName }) {
  let authUser = await findAuthUserByEmail(email);
  if (!authUser) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: PASSWORD,
      email_confirm: true,
    });
    if (error) throw error;
    authUser = data.user;
  }

  const { error } = await supabaseAdmin
    .from('users')
    .upsert({ id: authUser.id, email, full_name: fullName, role }, { onConflict: 'id' });
  if (error) throw error;

  return { id: authUser.id, email, role };
}

async function ensureSellerShop(sellerId) {
  const { data: existing } = await supabaseAdmin
    .from('shops')
    .select('id')
    .eq('user_id', sellerId)
    .maybeSingle();
  if (existing) return existing.id;

  const { data, error } = await supabaseAdmin
    .from('shops')
    .insert({
      user_id: sellerId,
      name: 'Dev Craft Shop',
      bio: 'Seeded shop for backend testing.',
      ip_declaration_accepted: true,
    })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

async function main() {
  const results = [];
  for (const spec of SEED) results.push(await ensureUser(spec));

  const seller = results.find((u) => u.role === 'seller');
  const shopId = await ensureSellerShop(seller.id);

  console.log('\nSeeded dev users (use these ids in the x-dev-user-id header):');
  for (const u of results) console.log(`  ${u.role.padEnd(6)}  ${u.id}  ${u.email}`);
  console.log(`\nSeller shop id: ${shopId}`);
  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

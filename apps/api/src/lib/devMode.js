// Dev-auth is a TESTING aid only: it lets the API accept an `x-dev-user-id` header
// instead of a real Supabase Google JWT, so the backend can be exercised before OAuth
// is wired. It is hard-gated: never active in production, and only when explicitly
// enabled via ALLOW_DEV_AUTH=true.
export const isDevAuth = () =>
  process.env.NODE_ENV !== 'production' && process.env.ALLOW_DEV_AUTH === 'true';

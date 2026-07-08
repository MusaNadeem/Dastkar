// Single source of truth for role checks (CLAUDE.md §7 — do not scatter role checks).
// Usage: router.post('/', requireAuth, requireRole('seller'), handler)
export function requireRole(...allowed) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }
    next();
  };
}

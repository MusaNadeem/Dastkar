// Audit log for money-adjacent mutations (CLAUDE.md §7). Every change to orders / payouts /
// custom_order_requests must call this with enough detail to reconstruct what happened —
// this is the record dispute resolution relies on later.
// MVP: console log + (optional) an audit_log table added via a later migration.
export async function logMoneyEvent({ entity, entityId, action, amount, actorId, detail }) {
  const entry = {
    at: new Date().toISOString(),
    entity,
    entityId,
    action,
    amount,
    actorId,
    detail: detail ?? {},
  };
  console.log('[audit]', JSON.stringify(entry));
  // TODO: persist to public.audit_log (add migration) so it survives restarts.
  return entry;
}

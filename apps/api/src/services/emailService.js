// Single swappable email entry point (CLAUDE.md §2). Everything calls sendEmail().
// MVP: console.log stub. Swap the body for Resend/Supabase without touching callers.
export async function sendEmail({ to, subject, body }) {
  if (!process.env.EMAIL_PROVIDER_API_KEY) {
    console.log(`[email:stub] to=${to} subject="${subject}"\n${body}`);
    return { delivered: false, stubbed: true };
  }
  // TODO (Sprint 6): wire real provider here.
  return { delivered: true };
}

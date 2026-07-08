// Simulated payment (CLAUDE.md Locked Decisions). Webhook-SHAPED on purpose: the state
// transitions here must match what a real Safepay callback will do post-MVP, so the swap
// touches only this file. No real money, no external calls.
import { logMoneyEvent } from './auditService.js';

// outcome: 'success' | 'fail' — driven by the mock Success/Fail buttons on the frontend.
export async function charge({ orderId, amount, outcome, actorId }) {
  const paid = outcome === 'success';
  await logMoneyEvent({
    entity: 'orders',
    entityId: orderId,
    action: paid ? 'payment_succeeded' : 'payment_failed',
    amount,
    actorId,
    detail: { simulated: true },
  });
  return { paid, paymentStatus: paid ? 'paid' : 'failed' };
}

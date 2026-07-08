// Order lifecycle: checkout, simulated payment, fulfillment, delivery. Sprint 3.
// Money-adjacent — every mutation must call auditService.logMoneyEvent.
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

router.post('/', requireAuth, (_req, res) => res.status(501).json({ error: 'Not implemented' }));            // checkout (COD/simulated)
router.post('/:id/pay', requireAuth, (_req, res) => res.status(501).json({ error: 'Not implemented' }));     // simulated success/fail
router.get('/mine', requireAuth, (_req, res) => res.status(501).json({ error: 'Not implemented' }));         // buyer orders
router.get('/incoming', requireAuth, requireRole('seller'), (_req, res) => res.status(501).json({ error: 'Not implemented' })); // seller orders
router.post('/:id/ship', requireAuth, requireRole('seller'), (_req, res) => res.status(501).json({ error: 'Not implemented' })); // tracking number
router.post('/:id/deliver', requireAuth, (_req, res) => res.status(501).json({ error: 'Not implemented' })); // buyer confirm

export default router;

// Custom order lifecycle: request → quote → deposit → progress → revision(≤2) → balance. Sprint 4.
// Money-adjacent — audit every state transition.
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

router.post('/', requireAuth, (_req, res) => res.status(501).json({ error: 'Not implemented' }));                 // buyer request
router.get('/incoming', requireAuth, requireRole('seller'), (_req, res) => res.status(501).json({ error: 'Not implemented' }));
router.post('/:id/quote', requireAuth, requireRole('seller'), (_req, res) => res.status(501).json({ error: 'Not implemented' }));
router.post('/:id/decline', requireAuth, requireRole('seller'), (_req, res) => res.status(501).json({ error: 'Not implemented' }));
router.post('/:id/deposit', requireAuth, (_req, res) => res.status(501).json({ error: 'Not implemented' }));      // approve + pay deposit
router.post('/:id/photos', requireAuth, requireRole('seller'), (_req, res) => res.status(501).json({ error: 'Not implemented' })); // progress/final
router.post('/:id/revision', requireAuth, (_req, res) => res.status(501).json({ error: 'Not implemented' }));     // max 2 rounds
router.post('/:id/balance', requireAuth, (_req, res) => res.status(501).json({ error: 'Not implemented' }));      // pay balance

export default router;

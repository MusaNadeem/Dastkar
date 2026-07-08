// IP reporting + admin takedown / three-strikes / counter-notice. Sprint 5.
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

router.post('/', (_req, res) => res.status(501).json({ error: 'Not implemented' }));                              // public: file a report
router.get('/', requireAuth, requireRole('admin'), (_req, res) => res.status(501).json({ error: 'Not implemented' }));            // admin queue
router.post('/:id/takedown', requireAuth, requireRole('admin'), (_req, res) => res.status(501).json({ error: 'Not implemented' })); // hide + strike++
router.post('/:id/dismiss', requireAuth, requireRole('admin'), (_req, res) => res.status(501).json({ error: 'Not implemented' }));
router.post('/:id/counter-notice', requireAuth, requireRole('seller'), (_req, res) => res.status(501).json({ error: 'Not implemented' }));

export default router;

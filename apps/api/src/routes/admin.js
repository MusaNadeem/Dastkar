// Admin routes. Sprint 1 (listing approval). Sprint 5 items remain stubs below.
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { pendingProducts, approveProduct, rejectProduct } from '../controllers/adminController.js';

const router = Router();
router.use(requireAuth, requireRole('admin'));

router.get('/products/pending', asyncHandler(pendingProducts));
router.post('/products/:id/approve', asyncHandler(approveProduct));
router.post('/products/:id/reject', asyncHandler(rejectProduct));

// Sprint 5 (not yet implemented):
router.get('/analytics', (_req, res) => res.status(501).json({ error: 'Not implemented' }));
router.get('/shops', (_req, res) => res.status(501).json({ error: 'Not implemented' }));
router.post('/shops/:id/status', (_req, res) => res.status(501).json({ error: 'Not implemented' }));

export default router;

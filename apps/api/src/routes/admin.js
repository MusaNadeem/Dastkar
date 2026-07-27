// Admin routes. Sprint 1 (listing approval) + Sprint 5 (analytics, seller overview).
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import {
  pendingProducts,
  approveProduct,
  rejectProduct,
  analytics,
  listShops,
  setShopStatus,
} from '../controllers/adminController.js';

const router = Router();
router.use(requireAuth, requireRole('admin'));

router.get('/products/pending', asyncHandler(pendingProducts));
router.post('/products/:id/approve', asyncHandler(approveProduct));
router.post('/products/:id/reject', asyncHandler(rejectProduct));

router.get('/analytics', asyncHandler(analytics));
router.get('/shops', asyncHandler(listShops));
router.post('/shops/:id/status', asyncHandler(setShopStatus));

export default router;

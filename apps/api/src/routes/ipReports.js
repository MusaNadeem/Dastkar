// IP reporting + admin takedown / three-strikes / counter-notice. Sprint 5.
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import {
  createReport,
  listReports,
  takedown,
  dismiss,
  counterNotice,
} from '../controllers/ipReportController.js';

const router = Router();

router.post('/', asyncHandler(createReport)); // public: anyone can file a report
router.get('/', requireAuth, requireRole('admin'), asyncHandler(listReports));
router.post('/:id/takedown', requireAuth, requireRole('admin'), asyncHandler(takedown));
router.post('/:id/dismiss', requireAuth, requireRole('admin'), asyncHandler(dismiss));
router.post('/:id/counter-notice', requireAuth, requireRole('seller'), asyncHandler(counterNotice));

export default router;

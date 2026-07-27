// Custom order lifecycle: request -> quote -> deposit -> progress/final photos ->
// revision(<=2) -> balance -> completed -> shipped. Sprint 4. Money-adjacent, audited.
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import {
  createRequest,
  myRequests,
  incomingRequests,
  quote,
  decline,
  payDeposit,
  uploadPhotos,
  requestRevision,
  payBalance,
  shipCustom,
} from '../controllers/customOrderController.js';

const router = Router();

router.post('/', requireAuth, asyncHandler(createRequest)); // buyer request
router.get('/mine', requireAuth, asyncHandler(myRequests)); // buyer view
router.get('/incoming', requireAuth, requireRole('seller'), asyncHandler(incomingRequests)); // seller view

router.post('/:id/quote', requireAuth, requireRole('seller'), asyncHandler(quote));
router.post('/:id/decline', requireAuth, requireRole('seller'), asyncHandler(decline));
router.post('/:id/deposit', requireAuth, asyncHandler(payDeposit)); // buyer approve + deposit
router.post('/:id/photos', requireAuth, requireRole('seller'), asyncHandler(uploadPhotos)); // progress/final
router.post('/:id/revision', requireAuth, asyncHandler(requestRevision)); // buyer, max 2
router.post('/:id/balance', requireAuth, asyncHandler(payBalance)); // buyer approve final + balance
router.post('/:id/ship', requireAuth, requireRole('seller'), asyncHandler(shipCustom));

export default router;

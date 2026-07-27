// Order lifecycle: checkout, simulated payment, fulfillment, delivery. Sprint 3.
// Money-adjacent — every mutation logs an audit event (see orderController).
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import {
  createOrder,
  payOrder,
  myOrders,
  incomingOrders,
  shipOrder,
  deliverOrder,
} from '../controllers/orderController.js';

const router = Router();

router.post('/', requireAuth, asyncHandler(createOrder)); // checkout (COD or simulated)
router.get('/mine', requireAuth, asyncHandler(myOrders)); // buyer orders
router.get('/incoming', requireAuth, requireRole('seller'), asyncHandler(incomingOrders)); // seller orders
router.post('/:id/pay', requireAuth, asyncHandler(payOrder)); // simulated success/fail
router.post('/:id/ship', requireAuth, requireRole('seller'), asyncHandler(shipOrder)); // tracking number
router.post('/:id/deliver', requireAuth, asyncHandler(deliverOrder)); // buyer confirm

export default router;

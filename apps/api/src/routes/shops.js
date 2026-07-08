// Shop routes. Sprint 1.
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { createShop, myShop, getShop } from '../controllers/shopController.js';

const router = Router();

router.post('/', requireAuth, requireRole('seller'), asyncHandler(createShop));
router.get('/mine', requireAuth, requireRole('seller'), asyncHandler(myShop));
router.get('/:id', asyncHandler(getShop)); // public

export default router;

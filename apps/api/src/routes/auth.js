// User/role routes. Sprint 1.
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { me, setRole } from '../controllers/userController.js';

const router = Router();

router.get('/me', requireAuth, asyncHandler(me));
router.post('/role', requireAuth, asyncHandler(setRole));

export default router;

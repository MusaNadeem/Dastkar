// Dev-only helper routes (gated inside the controller). Testing aid, not production.
import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler.js';
import { listDevUsers } from '../controllers/devController.js';

const router = Router();
router.get('/users', asyncHandler(listDevUsers));

export default router;

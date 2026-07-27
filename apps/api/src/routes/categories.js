// Category routes. Public read (Sprint 2 catalog + homepage).
import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler.js';
import { listCategories } from '../controllers/categoryController.js';

const router = Router();
router.get('/', asyncHandler(listCategories));

export default router;

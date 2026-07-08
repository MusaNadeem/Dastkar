// Product routes. Sprints 1-2. Static paths (/mine) are declared before /:id.
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  listProducts,
  myProducts,
  getProduct,
} from '../controllers/productController.js';

const router = Router();

router.get('/', asyncHandler(listProducts)); // public
router.get('/mine', requireAuth, requireRole('seller'), asyncHandler(myProducts));
router.post('/', requireAuth, requireRole('seller'), asyncHandler(createProduct));
router.patch('/:id', requireAuth, requireRole('seller'), asyncHandler(updateProduct));
router.delete('/:id', requireAuth, requireRole('seller'), asyncHandler(deleteProduct));
router.get('/:id', asyncHandler(getProduct)); // public — keep last

export default router;

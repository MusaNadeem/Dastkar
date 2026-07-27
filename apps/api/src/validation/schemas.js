// Input validation (CLAUDE.md §7 — validate before touching the DB). Zod errors are
// caught centrally by errorHandler and returned as 400.
import { z } from 'zod';

export const roleSchema = z.object({
  // Users may pick buyer or seller. Admin is never self-assignable via the API.
  role: z.enum(['buyer', 'seller']),
});

export const shopSchema = z.object({
  name: z.string().trim().min(1, 'Shop name is required').max(120),
  bio: z.string().max(2000).optional(),
  profileImageUrl: z.string().max(500).optional(),
  ipDeclarationAccepted: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the IP declaration' }),
  }),
});

export const productCreateSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().max(5000).optional(),
  price: z.number().positive('Price must be greater than 0'),
  stockQuantity: z.number().int().min(0).default(1),
  categoryId: z.string().uuid().nullish(),
  customOrdersEnabled: z.boolean().optional().default(false),
  imageUrls: z.array(z.string().max(1000)).max(5).optional().default([]),
});

export const productUpdateSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    description: z.string().max(5000),
    price: z.number().positive(),
    stockQuantity: z.number().int().min(0),
    categoryId: z.string().uuid().nullable(),
    customOrdersEnabled: z.boolean(),
    imageUrls: z.array(z.string().max(1000)).max(5),
  })
  .partial()
  .refine((obj) => Object.keys(obj).length > 0, { message: 'No fields to update' });

// Catalog query params (all arrive as strings; coerce numbers). Empty strings are
// stripped by the controller before parsing so optionals stay undefined.
export const catalogQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  categoryId: z.string().uuid().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc']).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(48).default(24),
});

// ---- Orders (Sprint 3) ----
const shippingAddressSchema = z.object({
  fullName: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(6).max(30),
  line1: z.string().trim().min(1).max(200),
  line2: z.string().max(200).optional(),
  city: z.string().trim().min(1).max(80),
  postalCode: z.string().max(20).optional(),
});

export const orderCreateSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1).max(99),
      })
    )
    .min(1, 'Cart is empty'),
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.enum(['cod', 'simulated_digital']),
});

export const paySchema = z.object({ outcome: z.enum(['success', 'fail']) });

export const shipSchema = z.object({ trackingNumber: z.string().trim().min(1).max(60) });

// ---- Custom orders (Sprint 4) ----
export const customOrderCreateSchema = z.object({
  sellerId: z.string().uuid(),
  description: z.string().trim().min(1, 'Describe what you want').max(5000),
  budgetRange: z.string().max(100).optional(),
  referenceImageUrls: z.array(z.string().max(1000)).max(5).optional(),
});

export const quoteSchema = z.object({ quotedPrice: z.number().positive() });

export const photosSchema = z.object({
  type: z.enum(['progress', 'final']),
  imageUrls: z.array(z.string().max(1000)).min(1).max(10),
});

export const revisionSchema = z.object({ note: z.string().max(1000).optional() });

// Deposit is where the buyer commits, so we collect the delivery address here.
export const customDepositSchema = z.object({
  outcome: z.enum(['success', 'fail']),
  shippingAddress: shippingAddressSchema,
});

// ---- IP reports + admin (Sprint 5) ----
export const ipReportSchema = z.object({
  reporterName: z.string().trim().min(1).max(120),
  reporterEmail: z.string().email(),
  reportedProductId: z.string().uuid(),
  reason: z.string().trim().min(1).max(2000),
  evidenceUrl: z.string().max(1000).optional(),
});

export const counterNoticeSchema = z.object({
  counterNotice: z.string().trim().min(1).max(2000),
});

export const adminShopStatusSchema = z.object({
  status: z.enum(['active', 'suspended', 'banned']),
});

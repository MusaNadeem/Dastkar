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

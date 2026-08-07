import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  quantity: z.coerce.number().min(1),
  totalPurchasePrice: z.coerce.number().min(0),
  totalIntlShipping: z.coerce.number().min(0).default(0),
  totalLocalShipping: z.coerce.number().min(0).default(0),
  unitCost: z.coerce.number().min(0),
  minSellingPrice: z.coerce.number().min(0),
  description: z.string().max(2000).optional().default(''),
  sku: z.string().max(50).optional(),
  images: z.array(z.object({ url: z.string().url(), thumb: z.string().optional(), medium: z.string().optional() })).optional().default([]),
}).superRefine((data, ctx) => {
  if (data.minSellingPrice < data.unitCost) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['minSellingPrice'], message: `Min selling price cannot be lower than unit cost (${data.unitCost})` });
  }
});

export const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  quantity: z.coerce.number().min(0).optional(),
  currentQuantity: z.coerce.number().min(0).optional(),
  totalPurchasePrice: z.coerce.number().min(0).optional(),
  totalIntlShipping: z.coerce.number().min(0).optional(),
  totalLocalShipping: z.coerce.number().min(0).optional(),
  unitCost: z.coerce.number().min(0).optional(),
  minSellingPrice: z.coerce.number().min(0).optional(),
  description: z.string().max(2000).optional(),
  sku: z.string().max(50).optional(),
  status: z.enum(['in_stock', 'low_stock', 'out_of_stock', 'discontinued']).optional(),
  images: z.array(z.object({ url: z.string().url(), thumb: z.string().optional(), medium: z.string().optional() })).optional(),
}).superRefine((data, ctx) => {
  if (data.minSellingPrice !== undefined && data.unitCost !== undefined) {
    if (data.minSellingPrice < data.unitCost) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['minSellingPrice'], message: 'Min selling price cannot be lower than unit cost' });
    }
  }
});

export const bulkCreateSchema = z.object({
  products: z.array(createProductSchema).min(1).max(100),
});

export const queryProductSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

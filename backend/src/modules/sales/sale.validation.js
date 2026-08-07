import { z } from 'zod';

export const createSaleSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().min(1),
  sellingPrice: z.coerce.number().min(0),
  customerName: z.string().max(100).optional().default(''),
  customerPhone: z.string().max(20).optional().default(''),
  customerAddress: z.string().max(300).optional().default(''),
  comment: z.string().max(1000).optional().default(''),
});

export const querySaleSchema = z.object({
  search: z.string().optional(),
  productId: z.string().optional(),
  soldBy: z.string().optional(),
  status: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

import { z } from 'zod';
import { ROLES } from '../../constants/roles.js';

export const createUserSchema = z.object({
  fullName: z.string().min(2).max(80),
  phone: z.string().min(7).max(20),
  password: z.string().min(6).max(128).optional(),
  role: z.enum([ROLES.ADMIN, ROLES.WORKER]).default(ROLES.WORKER),
  telegramId: z.string().optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
});

export const updateUserSchema = z.object({
  fullName: z.string().min(2).max(80).optional(),
  phone: z.string().min(7).max(20).optional(),
  role: z.enum([ROLES.ADMIN, ROLES.WORKER]).optional(),
  isDisabled: z.boolean().optional(),
  telegramId: z.string().optional().nullable(),
  preferences: z
    .object({
      language: z.string().optional(),
      theme: z.string().optional(),
    })
    .optional(),
});

export const updateMeSchema = z.object({
  fullName: z.string().min(2).max(80).optional(),
  phone: z.string().min(7).max(20).optional(),
  telegramId: z.string().optional().nullable(),
  preferences: z
    .object({
      language: z.string().optional(),
      theme: z.string().optional(),
    })
    .optional(),
});

export const queryUserSchema = z.object({
  search: z.string().optional(),
  role: z.enum([ROLES.ADMIN, ROLES.WORKER]).optional(),
  isDisabled: z.string().optional(),
  isOnline: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

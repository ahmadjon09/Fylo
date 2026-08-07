import { z } from 'zod';

export const loginSchema = z.object({
  phone: z.string().min(7).max(20),
  password: z.string().min(6).max(128),
});

export const registerSchema = z.object({
  fullName: z.string().min(2).max(80),
  phone: z.string().min(7).max(20),
  password: z.string().min(6).max(128),
  telegramId: z.string().optional().nullable(),
});

export const refreshSchema = z.object({
  refreshToken: z.string().optional(),
});

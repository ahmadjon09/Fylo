import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { authenticate } from '../../middlewares/auth.js';
import { loginSchema, refreshSchema } from './auth.validation.js';
import * as ctrl from './auth.controller.js';

const router = Router();

// Registration disabled — only admin can create users via /api/users
// Keeping endpoint for first-time setup: only works when no users exist
router.post('/register', (req, res, next) => {
  // Check via controller will enforce: only allow if zero users
  return ctrl.register(req, res, next);
});
router.post('/login', validate(loginSchema), ctrl.login);
router.post('/refresh', validate(refreshSchema), ctrl.refresh);
router.post('/logout', authenticate, ctrl.logout);
router.post('/change-password', authenticate, ctrl.changePassword);

export default router;

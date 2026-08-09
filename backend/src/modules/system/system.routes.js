import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { authorizeRoles } from '../../middlewares/role.js';
import { ROLES } from '../../constants/roles.js';
import * as ctrl from './system.controller.js';

const router = Router();
router.use(authenticate);
router.use(authorizeRoles(ROLES.SUPER_ADMIN));

router.get('/stats', ctrl.getSystemStats);
router.post('/flush-redis', ctrl.flushRedis);

export default router;

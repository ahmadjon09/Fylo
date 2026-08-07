import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { authorizeRoles } from '../../middlewares/role.js';
import { ROLES } from '../../constants/roles.js';
import * as ctrl from './dashboard.controller.js';

const router = Router();
router.use(authenticate);
router.use(authorizeRoles(ROLES.ADMIN));

router.get('/', ctrl.getDashboard);

export default router;

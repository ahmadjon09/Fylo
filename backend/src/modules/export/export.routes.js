import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { authorizeRoles } from '../../middlewares/role.js';
import { ROLES } from '../../constants/roles.js';
import * as ctrl from './export.controller.js';

const router = Router();
router.use(authenticate);
router.use(authorizeRoles(ROLES.ADMIN));

router.get('/products', ctrl.exportProducts);
router.get('/sales', ctrl.exportSales);
router.get('/users', ctrl.exportUsers);
router.get('/dashboard', ctrl.exportDashboard);

export default router;

import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { authorizeRoles } from '../../middlewares/role.js';
import { ROLES } from '../../constants/roles.js';
import * as ctrl from './audit.controller.js';

const router = Router();
router.use(authenticate);
router.use(authorizeRoles(ROLES.SUPER_ADMIN));

router.get('/', ctrl.listAudits);
router.get('/stats', ctrl.getAuditStats);
router.delete('/cleanup', ctrl.deleteOldAudits);

export default router;

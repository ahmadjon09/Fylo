import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { requirePermission } from '../../middlewares/permission.js';
import { validate } from '../../middlewares/validate.js';
import { PERMISSIONS } from '../../constants/roles.js';
import { createSaleSchema } from './sale.validation.js';
import * as ctrl from './sale.controller.js';

const router = Router();
router.use(authenticate);

router.get('/', requirePermission(PERMISSIONS.SALES_READ), ctrl.getSales);
router.get('/stats/daily', requirePermission(PERMISSIONS.SALES_READ), ctrl.dailySalesStats);
router.get('/:id', requirePermission(PERMISSIONS.SALES_READ), ctrl.getSaleById);
router.post('/', requirePermission(PERMISSIONS.SALES_CREATE), validate(createSaleSchema), ctrl.createSale);
router.post('/:id/refund', requirePermission(PERMISSIONS.SALES_CREATE), ctrl.refundSale);

export default router;

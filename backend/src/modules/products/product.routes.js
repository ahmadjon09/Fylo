import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { requirePermission } from '../../middlewares/permission.js';
import { validate } from '../../middlewares/validate.js';
import { uploadMultiple } from '../../middlewares/upload.js';
import { PERMISSIONS } from '../../constants/roles.js';
import { createProductSchema, updateProductSchema, bulkCreateSchema } from './product.validation.js';
import * as ctrl from './product.controller.js';
import { uploadToImgBB } from '../../utils/imgbb.js';

const router = Router();
router.use(authenticate);

router.get('/', requirePermission(PERMISSIONS.PRODUCTS_READ), ctrl.getProducts);
router.get('/alerts/low-stock', requirePermission(PERMISSIONS.PRODUCTS_READ), ctrl.lowStock);
router.get('/:id', requirePermission(PERMISSIONS.PRODUCTS_READ), ctrl.getProductById);
router.post('/', requirePermission(PERMISSIONS.PRODUCTS_CREATE), validate(createProductSchema), ctrl.createProduct);
router.post('/bulk', requirePermission(PERMISSIONS.PRODUCTS_CREATE), validate(bulkCreateSchema), ctrl.bulkCreateProducts);
router.patch('/:id', requirePermission(PERMISSIONS.PRODUCTS_UPDATE), validate(updateProductSchema), ctrl.updateProduct);
router.delete('/:id', requirePermission(PERMISSIONS.PRODUCTS_DELETE), ctrl.deleteProduct);

router.post('/upload/images', requirePermission(PERMISSIONS.PRODUCTS_CREATE), uploadMultiple('images', 10), async (req, res, next) => {
  try {
    if (!req.files?.length) return res.status(400).json({ success: false, message: 'No files' });
    const results = [];
    for (const file of req.files) {
      const r = await uploadToImgBB(file.buffer, file.originalname);
      results.push(r);
    }
    res.json({ success: true, data: results });
  } catch (e) { next(e); }
});

export default router;

import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { authorizeRoles } from '../../middlewares/role.js';
import { requirePermission } from '../../middlewares/permission.js';
import { validate } from '../../middlewares/validate.js';
import { uploadSingle } from '../../middlewares/upload.js';
import { ROLES, PERMISSIONS } from '../../constants/roles.js';
import * as ctrl from './user.controller.js';
import { createUserSchema, updateUserSchema, updateMeSchema } from './user.validation.js';

const router = Router();

router.use(authenticate);

router.get('/me', ctrl.getMe);
router.patch('/me', validate(updateMeSchema), ctrl.updateMe);
router.post('/me/avatar', uploadSingle('avatar'), ctrl.uploadMyAvatar);
router.get('/online/list', authorizeRoles(ROLES.ADMIN), ctrl.getOnlineUsers);

router.get('/', authorizeRoles(ROLES.ADMIN), requirePermission(PERMISSIONS.USERS_READ), ctrl.getUsers);
router.post('/', authorizeRoles(ROLES.ADMIN), requirePermission(PERMISSIONS.USERS_MANAGE), validate(createUserSchema), ctrl.createUser);
router.get('/:id', authorizeRoles(ROLES.ADMIN), ctrl.getUserById);
router.patch('/:id', authorizeRoles(ROLES.ADMIN), requirePermission(PERMISSIONS.USERS_MANAGE), validate(updateUserSchema), ctrl.updateUser);
router.delete('/:id', authorizeRoles(ROLES.ADMIN), requirePermission(PERMISSIONS.USERS_MANAGE), ctrl.deleteUser);
router.get('/:id/devices', authorizeRoles(ROLES.ADMIN), ctrl.getUserDevices);

export default router;

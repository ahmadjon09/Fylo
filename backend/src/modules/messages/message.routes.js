import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import * as ctrl from './message.controller.js';

const router = Router();
router.use(authenticate);

router.post('/', ctrl.sendMessage);
router.get('/conversations', ctrl.getConversations);
router.get('/unread-count', ctrl.getUnreadCount);
router.post('/read-all', ctrl.markAllRead);
router.get('/:userId', ctrl.getMessages);

export default router;

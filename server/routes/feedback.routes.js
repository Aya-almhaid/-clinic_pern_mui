import { Router } from 'express';
import { postFeedback, approvedFeedback, myFeedback, allFeedback, updateFeedbackStatus } from '../controllers/feedback.controller.js';
import { verifyToken, requireRole } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/approved', approvedFeedback);
router.post('/', verifyToken, postFeedback);
router.get('/me', verifyToken, myFeedback);
router.get('/', verifyToken, requireRole('doctor', 'admin'), allFeedback);
router.patch('/:id/status', verifyToken, requireRole('doctor', 'admin'), updateFeedbackStatus);

export default router;

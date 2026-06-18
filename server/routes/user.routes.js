import { Router } from 'express';
import { getMe, updateMe, listUsers, getUser, deleteUser, listPatients } from '../controllers/user.controller.js';
import { verifyToken, requireRole } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/me', verifyToken, getMe);
router.patch('/me', verifyToken, updateMe);
router.get('/patients', verifyToken, requireRole('doctor', 'admin'), listPatients);
router.get('/', verifyToken, requireRole('admin'), listUsers);
router.get('/:id', verifyToken, requireRole('admin'), getUser);
router.delete('/:id', verifyToken, requireRole('admin'), deleteUser);

export default router;

import { Router } from 'express';
import { listDoctors, getDoctor, addDoctor, editDoctor } from '../controllers/doctor.controller.js';
import { verifyToken, requireRole } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/', listDoctors);
router.get('/:id', getDoctor);
router.post('/', verifyToken, requireRole('admin'), addDoctor);
router.patch('/:id', verifyToken, requireRole('admin'), editDoctor);

export default router;

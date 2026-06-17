import { Router } from 'express';
import { bookAppointment, myAppointments, changeStatus, reschedule } from '../controllers/appointment.controller.js';
import { verifyToken, requireRole } from '../middleware/auth.middleware.js';
import { validateAppointment } from '../middleware/validate.middleware.js';

const router = Router();
router.post('/', verifyToken, requireRole('patient'), validateAppointment, bookAppointment);
router.get('/me', verifyToken, myAppointments);
router.patch('/:id/status', verifyToken, changeStatus);
router.patch('/:id/reschedule', verifyToken, reschedule);

export default router;

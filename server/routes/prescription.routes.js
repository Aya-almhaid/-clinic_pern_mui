import { Router } from 'express';
import { addPrescription, myPrescriptions, recordPrescriptions } from '../controllers/prescription.controller.js';
import { verifyToken, requireRole } from '../middleware/auth.middleware.js';

const router = Router();
router.post('/', verifyToken, requireRole('doctor'), addPrescription);
router.get('/me', verifyToken, requireRole('patient'), myPrescriptions);
router.get('/record/:recordId', verifyToken, recordPrescriptions);

export default router;

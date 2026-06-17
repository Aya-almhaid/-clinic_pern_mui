import { Router } from 'express';
import { newRecord, myRecords, patientRecords, getRecord, getNotes, addNote } from '../controllers/medicalRecord.controller.js';
import { verifyToken, requireRole } from '../middleware/auth.middleware.js';

const router = Router();
router.post('/', verifyToken, requireRole('doctor'), newRecord);
router.get('/me', verifyToken, requireRole('patient'), myRecords);
router.get('/patient/:patientId', verifyToken, requireRole('doctor', 'admin'), patientRecords);
router.get('/:id', verifyToken, getRecord);
router.get('/:id/notes', verifyToken, getNotes);
router.post('/:id/notes', verifyToken, addNote);

export default router;

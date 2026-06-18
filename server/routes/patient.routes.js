import { Router } from 'express';
import { listPatients } from '../controllers/user.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/', verifyToken, listPatients);

export default router;

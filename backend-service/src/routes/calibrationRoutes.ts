import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import * as calibrationController from '../controllers/calibrationController';

const router: Router = Router();

// All calibration routes require a valid admin JWT
router.get('/', authenticateToken, calibrationController.getAllCalibrations);
router.get('/live', authenticateToken, calibrationController.getLiveCalibration);
router.get('/:sensor', authenticateToken, calibrationController.getCalibration);
router.post('/', authenticateToken, calibrationController.saveCalibration);
router.post('/tare', authenticateToken, calibrationController.tareSensor);

export default router;

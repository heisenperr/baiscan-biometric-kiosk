import { Router } from 'express';
import * as sensorController from '../controllers/sensorController';

const router: Router = Router();

// Sensor Endpoints
router.get('/VL53L1X', sensorController.getVl53l1x);

export default router;

import { Router } from 'express';
import { sendNotification } from '../controllers/notificationController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Protect this route so only authenticated admins can broadcast notifications
router.post('/send', authenticateToken, sendNotification);

export default router;

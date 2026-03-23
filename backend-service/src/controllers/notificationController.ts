import { Request, Response } from 'express';

export const sendNotification = (req: Request, res: Response): void => {
    try {
        const { message, type = 'info', duration = 8000, gifName = null } = req.body;

        if (!message) {
            res.status(400).json({ message: 'Message is required' });
            return;
        }

        // Retrieve the global socket.io instance
        const io = req.app.get('io');
        
        if (!io) {
            res.status(500).json({ message: 'Socket.io instance not found' });
            return;
        }

        // Broadcast to all connected clients
        io.emit('notification', {
            id: Date.now().toString(),
            message,
            type, // 'info', 'success', 'warning', 'error'
            duration,
            gifName,
            timestamp: new Date().toISOString()
        });

        res.status(200).json({ success: true, message: 'Notification broadcasted successfully' });
    } catch (error: any) {
        console.error('Send Notification Error:', error);
        res.status(500).json({ message: 'Failed to send notification' });
    }
};

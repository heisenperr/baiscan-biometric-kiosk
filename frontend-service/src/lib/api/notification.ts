import api from '@/lib/api';

interface NotificationPayload {
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    duration?: number;
}

const notificationService = {
    send: async (payload: NotificationPayload) => {
        // Our explicit Next.js route handler proxy
        const response = await api.post('/api/notification/send', payload);
        return response.data;
    }
};

export default notificationService;

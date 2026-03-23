import api from '../api';
import { LoginData, UserProfile } from '../schemas';

const authService = {
  login: async (data: LoginData): Promise<{ accessToken: string; user: UserProfile }> => {
    const response = await api.post('/api/auth/login', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/api/auth/logout');
  },

  refresh: async (): Promise<{ accessToken: string; user: UserProfile }> => {
    const response = await api.post('/api/auth/refresh');
    return response.data;
  },

  getMe: async (): Promise<{ user: UserProfile }> => {
    const response = await api.get('/api/auth/me');
    return response.data;
  }
};

export default authService;

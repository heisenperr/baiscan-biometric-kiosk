import api from '../api';
import { UserProfile, LoginData } from '../schemas';

/**
 * Auth Service Endpoints
 * These match the explicit folder structure in src/app/api/auth/
 */
const ENDPOINTS = {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
} as const;

/**
 * Auth Service
 * Centralized authentication API calls.
 */
export const authService = {
    /**
     * Login with email and password
     */
    async login(data: LoginData): Promise<{ accessToken: string; user: UserProfile }> {
        const response = await api.post(ENDPOINTS.LOGIN, data);
        return response.data;
    },

    /**
     * Refresh the access token using the HttpOnly refresh cookie
     */
    async refresh(): Promise<{ accessToken: string; user: UserProfile }> {
        const response = await api.post(ENDPOINTS.REFRESH);
        return response.data;
    },

    /**
     * Logout and clear the session
     */
    async logout(): Promise<void> {
        await api.post(ENDPOINTS.LOGOUT);
    },

    /**
     * Get the current user profile from the session
     */
    async getMe(): Promise<{ user: UserProfile }> {
        const response = await api.get(ENDPOINTS.ME);
        return response.data;
    }
};

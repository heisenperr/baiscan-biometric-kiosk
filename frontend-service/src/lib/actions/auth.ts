'use server';

import api from '../api';
import { cookies } from 'next/headers';
import { LoginData, UserProfile } from '../schemas';

/**
 * Server Actions for Authentication
 * These actions run on the server and proxy requests to the backend.
 */

export async function loginAction(data: LoginData): Promise<{ success: boolean; data?: { accessToken: string; user: UserProfile }; error?: string }> {
    try {
        const response = await api.post('/api/auth/login', data);
        
        // Forward Set-Cookie headers from backend to the browser
        const setCookieHeaders = response.headers['set-cookie'];
        if (setCookieHeaders) {
            const cookieStore = await cookies();
            for (const cookieString of setCookieHeaders) {
                const parts = cookieString.split(';').map(p => p.trim());
                if (parts.length === 0) continue;
                
                const [nameValue] = parts;
                const [name, value] = nameValue.split('=');
                if (!name || value === undefined) continue;
                
                cookieStore.set(name, value, {
                    httpOnly: cookieString.toLowerCase().includes('httponly'),
                    secure: cookieString.toLowerCase().includes('secure'),
                    sameSite: 'lax',
                    path: '/',
                    maxAge: 7 * 24 * 60 * 60, // Fallback max age
                });
            }
        }

        return { success: true, data: response.data };
    } catch (error: any) {
        console.error('Login Action Error:', error.response?.data || error.message);
        return { 
            success: false, 
            error: error.response?.data?.message || 'Authentication failed' 
        };
    }
}

export async function logoutAction(): Promise<{ success: boolean; error?: string }> {
    try {
        await api.post('/api/auth/logout');
        
        // Clear refresh token cookie in browser
        const cookieStore = await cookies();
        cookieStore.delete('refreshToken');
        cookieStore.delete('sb-has-session');
        
        return { success: true };
    } catch (error: any) {
        console.error('Logout Action Error:', error.message);
        return { success: false, error: 'Logout failed' };
    }
}

export async function refreshAction(): Promise<{ success: boolean; data?: { accessToken: string; user: UserProfile }; error?: string }> {
    try {
        // We need to pass the current cookies to the backend
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get('refreshToken')?.value;
        if (!refreshToken) return { success: false, error: 'No refresh token' };

        const response = await api.post('/api/auth/refresh', {}, {
            headers: {
                Cookie: `refreshToken=${refreshToken}`
            }
        });
        
        // Forward new Set-Cookie headers (token rotation)
        const setCookieHeaders = response.headers['set-cookie'];
        if (setCookieHeaders) {
            const cookieStore = await cookies();
            for (const cookieString of setCookieHeaders) {
                const parts = cookieString.split(';').map(p => p.trim());
                if (parts.length === 0) continue;
                
                const [nameValue] = parts;
                const [name, value] = nameValue.split('=');
                if (!name || value === undefined) continue;
                
                cookieStore.set(name, value, {
                    httpOnly: cookieString.toLowerCase().includes('httponly'),
                    secure: cookieString.toLowerCase().includes('secure'),
                    sameSite: 'lax',
                    path: '/',
                    maxAge: 7 * 24 * 60 * 60,
                });
            }
        }
        
        return { success: true, data: response.data };
    } catch (error: any) {
        return { success: false, error: 'Session expired' };
    }
}

export async function getMeAction(token?: string): Promise<{ success: boolean; data?: { user: UserProfile }; error?: string }> {
    try {
        const response = await api.get('/api/auth/me', {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        return { success: true, data: response.data };
    } catch (error: any) {
        return { success: false, error: 'Not authenticated' };
    }
}

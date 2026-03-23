import axios from 'axios';

const isServer = typeof window === 'undefined';
export const CLIENT_API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';
export const BACKEND_API_URL = process.env.BACKEND_URL || '';

// For WebSockets, we need the full URL dynamically based on the current hostname to avoid build-time baking issues.
export const SOCKET_URL = typeof window !== 'undefined' 
    ? `http://${window.location.hostname}:3001` 
    : (process.env.NEXT_PUBLIC_SOCKET_URL || '');

// For the client, we want a relative path to hit our Next.js API routes (the proxy)
const API_URL = isServer ? BACKEND_API_URL : ''; 

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

// Flag to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Request interceptor to add Authorization header
api.interceptors.request.use(
    (config: any) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: any) => Promise.reject(error)
);

// Response interceptor for 401 automatic retry
api.interceptors.response.use(
    (response: any) => response,
    async (error: any) => {
        const originalRequest = error.config;

        // If 401 occurs and it's not a retry already, and NOT the refresh endpoint itself
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Attempt to refresh the token via our proxy
                const response = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
                const { accessToken } = response.data;

                if (typeof window !== 'undefined') {
                    localStorage.setItem('accessToken', accessToken);
                }

                api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                processQueue(null, accessToken);
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);

                // Final failure: redirect to login if not already there
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('accessToken');
                    if (window.location.pathname !== '/login') {
                        window.location.href = '/login';
                    }
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;

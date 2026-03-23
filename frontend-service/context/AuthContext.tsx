"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/api';
import { UserSchema, UserProfile } from '../lib/schemas';

interface AuthContextType {
  user: UserProfile | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize Auth from HttpOnly cookie or LocalStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      
      try {
        if (storedToken) {
          // We have a token, just fetch profile
          const response = await api.get('/api/auth/me');
          const { user: userData } = response.data;
          setUser(UserSchema.parse(userData));
          setAccessToken(storedToken);
        } else {
          // Check for canary cookie before attempting refresh to avoid unnecessary 401 calls
          const hasSessionCookie = typeof document !== 'undefined' && document.cookie.includes('sb-has-session=true');
          
          if (hasSessionCookie) {
            // No access token but we have a session cookie, try to refresh once
            const response = await api.post('/api/auth/refresh');
            const { accessToken: newToken, user: userData } = response.data;
            
            setUser(UserSchema.parse(userData));
            setAccessToken(newToken);
            localStorage.setItem('accessToken', newToken);
          } else {
            // No token and no session cookie, just stop
            setIsLoading(false);
          }
        }
      } catch (error: any) {
        // If everything fails, clear state
        localStorage.removeItem('accessToken');
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  // Handle redirect if user is already authenticated and on login page
  useEffect(() => {
    if (!isLoading && user && window.location.pathname === '/login') {
      router.push('/admin');
    }
  }, [user, isLoading, router]);

  const checkAuth = async () => {
    // Keep this for manual refreshes if needed, but it's now mostly redundant 
    // as the initAuth and interceptors handle everything.
    try {
      const response = await api.get('/api/auth/me');
      setUser(UserSchema.parse(response.data.user));
    } catch (error) {
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('accessToken');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { accessToken: newToken, user: userData } = response.data;

      // Rigorous validation of server response
      const validatedUser = UserSchema.parse(userData);

      setAccessToken(newToken);
      setUser(validatedUser);
      localStorage.setItem('accessToken', newToken);
      
      router.push('/admin');
    } catch (error: any) {
      // If it's a Zod error, it's a structural failure in API design
      if (error?.name === 'ZodError') {
        throw 'Structural profile data mismatch from server';
      }
      throw error.response?.data?.message || 'Login failed';
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem('accessToken');
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

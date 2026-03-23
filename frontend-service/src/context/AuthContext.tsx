"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import authService from '@/lib/api/auth';
import { UserSchema, UserProfile } from '@/lib/schemas';

interface AuthContextType {
  user: UserProfile | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ 
  children, 
  initialHasSession = false 
}: { 
  children: ReactNode; 
  initialHasSession?: boolean;
}) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(initialHasSession);
  const router = useRouter();

  // Initialize Auth from HttpOnly cookie or LocalStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

      try {
        if (storedToken) {
          // We have a token, just fetch profile
          // With API routes, the interceptor handles the Authorization header
          const result = await authService.getMe();
          if (result.user) {
            setUser(UserSchema.parse(result.user));
            setAccessToken(storedToken);
            setIsLoading(false);
            return;
          }
        }
        // If profile fetch fails, token might be expired, proceed to attempt refresh

        // Check for canary cookie before attempting refresh
        const hasSessionCookie = typeof document !== 'undefined' && document.cookie.includes('sb-has-session=true');

        if (hasSessionCookie) {
          try {
            const result = await authService.refresh();
            if (result.accessToken && result.user) {
              const { accessToken: newToken, user: userData } = result;
              setUser(UserSchema.parse(userData));
              setAccessToken(newToken);
              localStorage.setItem('accessToken', newToken);
            } else {
              // Refresh failed, clear everything
              localStorage.removeItem('accessToken');
              setAccessToken(null);
              setUser(null);
            }
          } catch (e) {
            localStorage.removeItem('accessToken');
            setAccessToken(null);
            setUser(null);
          }
        } else {
          // No canary cookie, clear localStorage just in case
          localStorage.removeItem('accessToken');
          setAccessToken(null);
          setUser(null);
        }
      } catch (error: any) {
        console.error('Auth initialization error:', error);
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
    if (!isLoading && user && typeof window !== 'undefined' && window.location.pathname === '/login') {
      router.push('/admin');
    }
  }, [user, isLoading, router]);
  const checkAuth = async () => {
    if (!accessToken && !document.cookie.includes('sb-has-session=true')) {
      setUser(null);
      return;
    }

    try {
      const result = await authService.getMe();
      if (result.user) {
        setUser(UserSchema.parse(result.user));
      } else {
        throw new Error('Failed to fetch user');
      }
    } catch (error) {
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('accessToken');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const result = await authService.login({ email, password });

      const { accessToken: newToken, user: userData } = result;
      const validatedUser = UserSchema.parse(userData);

      setAccessToken(newToken);
      setUser(validatedUser);
      localStorage.setItem('accessToken', newToken);

      router.push('/admin');
    } catch (error: any) {
      if (error?.name === 'ZodError') {
        throw 'Structural profile data mismatch from server';
      }
      throw typeof error === 'string' ? error : (error.message || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
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

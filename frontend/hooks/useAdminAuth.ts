'use client';

import { useState, useCallback, useEffect } from 'react';

export interface AdminAuthData {
  username: string;
  isAuthenticated: boolean;
  timestamp: number;
}

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [adminUser, setAdminUser] = useState<string>('');

  const checkAuth = useCallback((): boolean => {
    try {
      const adminAuth = localStorage.getItem('adminAuth');

      if (adminAuth) {
        const authData: AdminAuthData = JSON.parse(adminAuth);

        // Check if session is valid (24 hours)
        const isSessionValid = Date.now() - authData.timestamp < 24 * 60 * 60 * 1000;

        if (authData.isAuthenticated && isSessionValid) {
          setIsAuthenticated(true);
          setAdminUser(authData.username);
          return true;
        } else {
          // Session expired -> remove
          localStorage.removeItem('adminAuth');
        }
      }

      setIsAuthenticated(false);
      setAdminUser('');
      return false;
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setAdminUser('');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // run initial check
    setIsLoading(true);
    checkAuth();

    // sync across tabs
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'adminAuth') {
        setIsLoading(true);
        checkAuth();
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [checkAuth]);

  const login = useCallback((username: string, password: string): { success: boolean; message: string } => {
    setIsLoading(true);
    try {
      const adminUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME;
      const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

      if (!adminUsername || !adminPassword) {
        return {
          success: false,
          message: 'Admin credentials not configured. Please contact administrator.'
        };
      }

      if (username === adminUsername && password === adminPassword) {
        const authData: AdminAuthData = {
          username,
          isAuthenticated: true,
          timestamp: new Date().getTime()
        };

        localStorage.setItem('adminAuth', JSON.stringify(authData));
        setIsAuthenticated(true);
        setAdminUser(username);

        // dispatch storage event so other tabs update immediately
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'adminAuth',
          newValue: JSON.stringify(authData)
        }));

        return { success: true, message: 'Login successful' };
      } else {
        return { success: false, message: 'Invalid credentials. Please try again.' };
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setIsLoading(true);
    try {
      localStorage.removeItem('adminAuth');
      setIsAuthenticated(false);
      setAdminUser('');
      // notify other tabs
      window.dispatchEvent(new StorageEvent('storage', { key: 'adminAuth', newValue: null as any }));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isAuthenticated,
    isLoading,
    adminUser,
    login,
    logout,
    checkAuth
  };
};

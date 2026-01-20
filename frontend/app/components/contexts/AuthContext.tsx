// components/contexts/AuthContext.tsx
'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string; // Make phone required
  role: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  login: (phone: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (userData: {
    name: string;
    email: string;
    phone: string; // Phone is now required for registration
    password: string;
    address?: string;
  }) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  loading: boolean;
  loginRequired: () => void;
  updateProfile: (profileData: Partial<User>) => Promise<{ success: boolean; message: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>; // Add this
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const token = localStorage.getItem('userToken');
      const userData = localStorage.getItem('userData');
      
      if (token && userData) {
        setUser(JSON.parse(userData));
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const loginRequired = () => {
    if (typeof window !== 'undefined') {
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
      router.push(`/login?redirect=${returnUrl}`);
    }
  };

  const login = async (phone: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      // Validate phone number
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(phone)) {
        return { success: false, message: 'Please enter a valid 10-digit phone number' };
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, password }), // Changed from email to phone
      });

      const data = await response.json();
      
      if (data.success) {
        const { token, user } = data;
        
        localStorage.setItem('userToken', token);
        localStorage.setItem('userData', JSON.stringify(user));
        setUser(user);
        
        // Refresh cart and wishlist contexts
        window.dispatchEvent(new Event('authStateChanged'));
        
        // Redirect
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect');
        
        if (redirect) {
          router.push(decodeURIComponent(redirect));
        } else {
          router.push('/');
        }
        
        return { success: true, message: 'Login successful' };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    address?: string;
  }): Promise<{ success: boolean; message: string }> => {
    try {
      // Validate phone number
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(userData.phone)) {
        return { success: false, message: 'Please enter a valid 10-digit phone number' };
      }

      // Validate email (optional but recommended)
      if (userData.email && !/\S+@\S+\.\S+/.test(userData.email)) {
        return { success: false, message: 'Please enter a valid email address' };
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      
      if (data.success) {
        const { token, user } = data;
        
        localStorage.setItem('userToken', token);
        localStorage.setItem('userData', JSON.stringify(user));
        setUser(user);
        
        // Refresh cart and wishlist contexts
        window.dispatchEvent(new Event('authStateChanged'));
        
        router.push('/');
        
        return { success: true, message: 'Registration successful' };
      } else {
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration failed. Please try again.' };
    }
  };

  const updateProfile = async (profileData: Partial<User>): Promise<{ success: boolean; message: string }> => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        return { success: false, message: 'Please login to update profile' };
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('userData', JSON.stringify(data.user));
        setUser(data.user);
        return { success: true, message: 'Profile updated successfully' };
      } else {
        return { success: false, message: data.message || 'Profile update failed' };
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      return { success: false, message: 'Profile update failed. Please try again.' };
    }
  };

  // Add this function
  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        return { success: false, message: 'Please login to change password' };
      }

      // Validate new password
      if (newPassword.length < 6) {
        return { success: false, message: 'New password must be at least 6 characters' };
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();
      
      if (data.success) {
        return { success: true, message: data.message || 'Password changed successfully' };
      } else {
        return { success: false, message: data.message || 'Password change failed' };
      }
    } catch (error: any) {
      console.error('Change password error:', error);
      return { success: false, message: error.message || 'Password change failed. Please try again.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    setUser(null);
    
    // Refresh cart and wishlist contexts
    window.dispatchEvent(new Event('authStateChanged'));
    
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      loading, 
      loginRequired,
      updateProfile,
      changePassword // Add this to the provider value
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
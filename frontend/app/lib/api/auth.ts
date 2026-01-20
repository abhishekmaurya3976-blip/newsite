// lib/api/auth.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string; // Phone is now required
  role: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message?: string;
}

export const authAPI = {
  // Login with phone and password
  login: async (phone: string, password: string): Promise<{ data: AuthResponse }> => {
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      throw new Error('Please enter a valid 10-digit phone number');
    }

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    return { data: await response.json() };
  },

  // Register with phone (required) and email (optional)
  register: async (userData: {
    name: string;
    email?: string;
    phone: string;
    password: string;
    address?: string;
  }): Promise<{ data: AuthResponse }> => {
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(userData.phone)) {
      throw new Error('Please enter a valid 10-digit phone number');
    }

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    return { data: await response.json() };
  },

  // Update user profile (requires token)
  updateProfile: async (profileData: Partial<User>, token: string): Promise<{ data: AuthResponse }> => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Profile update failed');
    }

    return { data: await response.json() };
  },

  // Get all users (admin only) — token is now optional
  getUsers: async (
    token?: string
  ): Promise<{ data: { success: boolean; data: User[]; message?: string } }> => {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/auth/users`, {
      headers,
    });

    if (!response.ok) {
      // try to provide backend message when available
      try {
        const err = await response.json();
        throw new Error(err.message || 'Failed to fetch users');
      } catch {
        throw new Error('Failed to fetch users');
      }
    }

    return { data: await response.json() };
  },

  // Change password (requires token)
  changePassword: async (
    currentPassword: string,
    newPassword: string,
    token: string
  ): Promise<{ data: ChangePasswordResponse }> => {
    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters');
    }

    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Password change failed');
    }

    return { data: await response.json() };
  },
};

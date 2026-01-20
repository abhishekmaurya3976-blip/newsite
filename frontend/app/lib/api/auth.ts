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
    // Validate phone number
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      throw new Error('Please enter a valid 10-digit phone number');
    }

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, password }), // Changed from email to phone
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
    email?: string; // Optional
    phone: string; // Required
    password: string;
    address?: string;
  }): Promise<{ data: AuthResponse }> => {
    // Validate phone number
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
  
  // Update user profile
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
  
  // Get all users (admin only)
  getUsers: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    
    return { data: await response.json() };
  },

  // Add this function
  // Change password
  changePassword: async (
    currentPassword: string, 
    newPassword: string, 
    token: string
  ): Promise<{ data: ChangePasswordResponse }> => {
    // Validate new password
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
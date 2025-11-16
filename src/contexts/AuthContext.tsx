'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'operator' | 'viewer';
  organization?: string;
  phone?: string;
  approvedAt?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  requestAccess: (data: AccessRequestData) => Promise<{ success: boolean; message: string }>;
  checkAccessStatus: (email: string) => Promise<{ status: string; message?: string }>;
}

interface AccessRequestData {
  name: string;
  email: string;
  reason: string;
  organization?: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // API base URL - should point to EC2 proxy in production
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    // Check for existing session on mount
    const token = localStorage.getItem('auth_token');
    if (token) {
      validateToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async (token: string) => {
    try {
      const response = await axios.get(`${API_BASE}/api/auth/validate`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setUser(response.data.user);
      } else {
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // For now, we'll use a simple token-based approach
      // In production, integrate with the existing auth system on the Pis
      const response = await axios.post(`${API_BASE}/api/auth/login`, {
        email,
        password
      });

      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem('auth_token', token);
        setUser(user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const requestAccess = async (data: AccessRequestData): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await axios.post(`${API_BASE}/api/auth/request-access`, data);
      
      if (response.data.success) {
        return { success: true, message: 'Access request submitted successfully. You will receive an email when approved.' };
      } else {
        return { success: false, message: response.data.error || 'Failed to submit access request' };
      }
    } catch (error) {
      console.error('Access request failed:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const checkAccessStatus = async (email: string): Promise<{ status: string; message?: string }> => {
    try {
      const response = await axios.get(`${API_BASE}/api/auth/access-status`, {
        params: { email }
      });

      if (response.data.success) {
        return {
          status: response.data.status,
          message: response.data.message
        };
      } else {
        return {
          status: 'error',
          message: response.data.error || 'Failed to check status'
        };
      }
    } catch (error) {
      console.error('Status check failed:', error);
      return {
        status: 'error',
        message: 'Network error. Please try again.'
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        requestAccess,
        checkAccessStatus
      }}
    >
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

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/api';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  subscriptionStatus: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const response = await api.get('/auth/me');
        if (response.data.success) {
          setUser(response.data.data);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      await AsyncStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      await AsyncStorage.setItem('token', response.data.data.token);
      setUser(response.data.data.user);
    } else {
      throw new Error(response.data.message || 'Login failed');
    }
  };

  const register = async (email: string, password: string, firstName?: string, lastName?: string) => {
    const response = await api.post('/auth/register', { email, password, firstName, lastName });
    if (response.data.success) {
      await AsyncStorage.setItem('token', response.data.data.token);
      setUser(response.data.data.user);
    } else {
      throw new Error(response.data.message || 'Registration failed');
    }
  };

  const googleLogin = async (token: string) => {
    const response = await api.post('/auth/google', { token });
    if (response.data.success) {
      await AsyncStorage.setItem('token', response.data.data.token);
      setUser(response.data.data.user);
    } else {
      throw new Error(response.data.message || 'Google login failed');
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await AsyncStorage.removeItem('token');
      setUser(null);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        googleLogin,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

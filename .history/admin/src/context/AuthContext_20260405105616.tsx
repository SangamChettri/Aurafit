import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../config/api';

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    console.log('🔍 Starting auth check...');
    
    try {
      const token = localStorage.getItem('token');
      console.log('🔍 Token from localStorage:', token ? 'EXISTS' : 'NOT FOUND');
      
      if (token) {
        console.log('🔍 Making API call to /auth/me...');
        const response = await api.get('/auth/me');
        console.log('🔍 API response:', response.data);
        
        if (response.data.success && response.data.data) {
          const userData = response.data.data;
          console.log('✅ Auth check - User data:', userData);
          console.log('✅ Auth check - User role:', userData.role);
          
          if (['admin', 'super_admin'].includes(userData.role)) {
            console.log('✅ Auth check - Role validated, setting user');
            setUser(userData);
          } else {
            console.log('❌ Auth check - Invalid role:', userData.role);
            localStorage.removeItem('token');
          }
        } else {
          console.log('❌ Auth check - Invalid response:', response.data);
          localStorage.removeItem('token');
        }
      } else {
        console.log('🔍 Auth check - No token, user not authenticated');
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      localStorage.removeItem('token');
    } finally {
      console.log('🔍 Auth check completed, setting loading to false');
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      const userData = response.data.data.user;
      if (!['admin', 'super_admin'].includes(userData.role)) {
        throw new Error('Access denied. Admin privileges required.');
      }
      localStorage.setItem('token', response.data.data.token);
      setUser(userData);
    } else {
      throw new Error(response.data.message || 'Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

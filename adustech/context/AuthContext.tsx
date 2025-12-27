import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

interface User {
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  verifyOTP: (email: string, otp: string) => Promise<{ success: boolean; message?: string }>;
  resendOTP: (email: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const result = await authAPI.register(name, email, password);
    if (result.success) {
      // Store email for OTP verification
      await AsyncStorage.setItem('pendingEmail', email);
      return { success: true, message: result.data.message };
    }
    return { success: false, message: result.message };
  };

  const verifyOTP = async (email: string, otp: string) => {
    const result = await authAPI.verifyOTP(email, otp);
    if (result.success) {
      // Clear pending email
      await AsyncStorage.removeItem('pendingEmail');
      return { success: true, message: result.data.message };
    }
    return { success: false, message: result.message };
  };

  const resendOTP = async (email: string) => {
    const result = await authAPI.resendOTP(email);
    return result;
  };

  const login = async (email: string, password: string) => {
    const result = await authAPI.login(email, password);
    if (result.success) {
      // Extract user name from response or email
      const name = result.data.user?.name || email.split('@')[0];
      const userData = { name, email };
      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      return { success: true, message: result.data.message };
    }
    return { success: false, message: result.message };
  };

  const logout = async () => {
    await authAPI.logout();
    setUser(null);
    await AsyncStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        verifyOTP,
        resendOTP,
        logout,
      }}
    >
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

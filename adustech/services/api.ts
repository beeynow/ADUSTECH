import axios from 'axios';
import { getApiUrl } from './config';

const API_URL = getApiUrl();

console.log('🌐 API URL configured:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
  withCredentials: true, // Enable sending cookies with requests
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`📤 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('❌ Request timeout - Check if backend is running');
    } else if (error.message === 'Network Error') {
      console.error('❌ Network Error - Check API URL and backend connection');
    } else {
      console.error(`❌ ${error.config?.url} - ${error.response?.status || error.message}`);
    }
    return Promise.reject(error);
  }
);

// API Methods
export const authAPI = {
  // Register new user
  register: async (name: string, email: string, password: string) => {
    try {
      console.log('Attempting registration...', { name, email });
      const response = await api.post('/register', { name, email, password });
      console.log('Registration response:', response.data);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Registration error:', error.response?.data || error.message);
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Registration failed. Please try again.' 
      };
    }
  },

  // Verify OTP
  verifyOTP: async (email: string, otp: string) => {
    try {
      const response = await api.post('/verify-otp', { email, otp });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'OTP verification failed.' 
      };
    }
  },

  // Resend OTP
  resendOTP: async (email: string) => {
    try {
      const response = await api.post('/resend-otp', { email });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to resend OTP.' 
      };
    }
  },

  // Login user
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/login', { email, password });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please check your credentials.' 
      };
    }
  },

  // Logout user
  logout: async () => {
    try {
      const response = await api.post('/logout');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Logout failed.' 
      };
    }
  },

  // Forgot password - request reset code
  forgotPassword: async (email: string) => {
    try {
      const response = await api.post('/forgot-password', { email });
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to initiate password reset.'
      };
    }
  },

  // Reset password with code
  resetPassword: async (email: string, token: string, newPassword: string) => {
    try {
      const response = await api.post('/reset-password', { email, token, newPassword });
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to reset password.'
      };
    }
  },

  // Change password (authenticated)
  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      const response = await api.post('/change-password', { currentPassword, newPassword });
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to change password.'
      };
    }
  },

  // Get dashboard (protected route)
  getDashboard: async () => {
    try {
      const response = await api.get('/dashboard');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch dashboard data.' 
      };
    }
  },
};

export default api;

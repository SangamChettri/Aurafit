import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Event emitter for auth errors (to communicate with AuthContext)
export const authErrorEmitter = {
  listeners: [],
  on401: function(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  },
  emit401: function() {
    this.listeners.forEach(callback => callback());
  }
};

// Get API URL from environment or use default
// For Android Emulator: use 10.0.2.2 to reach host machine
// For Physical Device: use your computer's WiFi IP
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000/api';

// Log the API URL for debugging
console.log('🔌 API URL configured:', API_URL);

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15 seconds timeout (increased for slower networks)
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add JWT token
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem('authToken');

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`🔑 Token attached to request: ${config.url}`);
      } else {
        console.log(`⚠️ No token found for request: ${config.url}`);
      }

      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    } catch (error) {
      console.error('❌ Request interceptor error:', error);
      return config;
    }
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    console.error(`❌ API Error: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url} - Status: ${error.response?.status}`);

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Clear stored token and user data
        await AsyncStorage.multiRemove(['authToken', 'userData']);

        // Notify AuthContext to update state and trigger navigation
        authErrorEmitter.emit401();

        // Show user-friendly message
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please log in again.',
          [{ text: 'OK' }]
        );

        return Promise.reject(error);
      } catch (clearError) {
        console.error('❌ Error clearing auth data:', clearError);
        return Promise.reject(error);
      }
    }

    // Handle network errors
    if (error.code === 'NETWORK_ERROR' || !error.response) {
      console.error('❌ Network Error Details:', {
        message: error.message,
        code: error.code,
        config: {
          url: originalRequest?.url,
          baseURL: originalRequest?.baseURL,
          method: originalRequest?.method,
        }
      });

      Alert.alert(
        'Connection Failed',
        `Cannot connect to server at ${API_URL}.\n\nPlease check:\n1. Backend server is running\n2. Correct IP address in .env file\n3. Same WiFi network (for physical device)`,
        [{ text: 'OK' }]
      );
      return Promise.reject(error);
    }

    // Handle rate limiting
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 60;
      Alert.alert(
        'Too Many Requests',
        `Please wait ${retryAfter} seconds before trying again.`,
        [{ text: 'OK' }]
      );
      return Promise.reject(error);
    }

    // Handle server errors
    if (error.response?.status >= 500) {
      Alert.alert(
        'Server Error',
        'The server is experiencing issues. Please try again later.',
        [{ text: 'OK' }]
      );
      return Promise.reject(error);
    }

    // For other errors, return the error response
    return Promise.reject(error);
  }
);

// Utility function to handle API errors consistently
export const handleApiError = (error) => {
  if (error.response?.data?.error) {
    return {
      message: error.response.data.error.message || 'An error occurred',
      code: error.response.data.error.code || 'UNKNOWN_ERROR',
      errors: error.response.data.error.errors || null,
    };
  }

  if (error.code === 'NETWORK_ERROR') {
    return {
      message: 'Network error. Please check your internet connection.',
      code: 'NETWORK_ERROR',
      errors: null,
    };
  }

  return {
    message: error.message || 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    errors: null,
  };
};

// Utility function to check if response is successful
export const isSuccess = (response) => {
  return response.data?.success === true;
};

// Utility function to get data from successful response
export const getResponseData = (response) => {
  return response.data?.data || response.data;
};

export default axiosInstance;

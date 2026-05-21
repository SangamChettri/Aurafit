import { Platform } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Prefer EXPO_PUBLIC_API_URL if provided. Otherwise pick sensible defaults:
// - Android emulator: 10.0.2.2
// - iOS simulator / Web: localhost
// - Physical device: instruct via README to set EXPO_PUBLIC_API_URL to your machine IP
const envBase = process.env.EXPO_PUBLIC_API_URL;
const fallbackBase =
  Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';
const API_BASE_URL = envBase || fallbackBase;


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      // Navigate to login - handled by AuthContext
    }
    return Promise.reject(error);
  }
);

export default api;

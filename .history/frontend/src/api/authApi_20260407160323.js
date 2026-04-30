import axiosInstance from './axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { handleApiError, isSuccess, getResponseData } from './axiosInstance';

/**
 * Authentication API service
 * Handles all authentication-related API calls
 */

export const authApi = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.name - User's full name
   * @param {string} userData.email - User's email address
   * @param {string} userData.password - User's password
   * @param {string} userData.goal - User's fitness goal
   * @returns {Promise<Object>} Registration response
   */
  register: async (userData) => {
    try {
      console.log('Registering new user:', userData.email);
      
      const response = await axiosInstance.post('/auth/register', userData);
      
      if (isSuccess(response)) {
        const data = getResponseData(response);
        
        // Store token and user data
        await AsyncStorage.setItem('authToken', data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));
        
        console.log('✅ User registered successfully');
        return {
          success: true,
          user: data.user,
          token: data.token,
        };
      }
      
      return { success: false, error: 'Registration failed' };
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      
      // Extract detailed error information
      const errorData = error.response?.data;
      const errorInfo = handleApiError(error);
      
      return {
        success: false,
        error: errorData?.message || errorInfo.message,
        errors: errorData?.errors || errorInfo.errors || [],
        code: errorInfo.code,
      };
    }
  },

  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User's email
   * @param {string} credentials.password - User's password
   * @returns {Promise<Object>} Login response
   */
  login: async (credentials) => {
    try {
      console.log('Logging in user:', credentials.email);
      
      const response = await axiosInstance.post('/auth/login', credentials);
      
      if (isSuccess(response)) {
        const data = getResponseData(response);
        
        // Store token and user data
        await AsyncStorage.setItem('authToken', data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));
        
        console.log('✅ User logged in successfully');
        return {
          success: true,
          user: data.user,
          token: data.token,
        };
      }
      
      return { success: false, error: 'Login failed' };
    } catch (error) {
      console.error('❌ Login error:', error.response?.data || error.message);
      
      // Extract detailed error information
      const errorData = error.response?.data;
      const errorInfo = handleApiError(error);
      
      return {
        success: false,
        error: errorData?.message || errorInfo.message,
        errors: errorData?.errors || errorInfo.errors || [],
        code: errorInfo.code,
      };
    }
  },

  /**
   * Get current user profile
   * @returns {Promise<Object>} User profile data
   */
  getProfile: async () => {
    try {
      console.log('👤 Fetching user profile');
      
      const response = await axiosInstance.get('/auth/me');
      
      if (isSuccess(response)) {
        const data = getResponseData(response);
        
        // Update stored user data
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));
        
        console.log('User profile fetched successfully');
        return {
          success: true,
          user: data.user,
          stats: data.stats,
        };
      }
      
      return { success: false, error: 'Failed to fetch profile' };
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error('❌ Get profile error:', errorInfo);
      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
      };
    }
  },

  /**
   * Update user profile
   * @param {Object} updateData - Profile update data
   * @returns {Promise<Object>} Update response
   */
  updateProfile: async (updateData) => {
    try {
      console.log('✏️ Updating user profile');
      
      const response = await axiosInstance.put('/auth/me', updateData);
      
      if (isSuccess(response)) {
        const data = getResponseData(response);
        
        // Update stored user data
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));
        
        console.log('✅ Profile updated successfully');
        return {
          success: true,
          user: data.user,
        };
      }
      
      return { success: false, error: 'Failed to update profile' };
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error('❌ Update profile error:', errorInfo);
      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
        errors: errorInfo.errors,
      };
    }
  },

  /**
   * Change user password
   * @param {Object} passwordData - Password change data
   * @param {string} passwordData.currentPassword - Current password
   * @param {string} passwordData.newPassword - New password
   * @returns {Promise<Object>} Password change response
   */
  changePassword: async (passwordData) => {
    try {
      console.log('🔒 Changing user password');
      
      const response = await axiosInstance.put('/auth/change-password', passwordData);
      
      if (isSuccess(response)) {
        console.log('✅ Password changed successfully');
        return { success: true };
      }
      
      return { success: false, error: 'Failed to change password' };
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error('❌ Change password error:', errorInfo);
      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
        errors: errorInfo.errors,
      };
    }
  },

  /**
   * Delete user account
   * @returns {Promise<Object>} Deletion response
   */
  deleteAccount: async () => {
    try {
      console.log('🗑️ Deleting user account');
      
      const response = await axiosInstance.delete('/auth/me');
      
      if (isSuccess(response)) {
        // Clear all stored data
        await AsyncStorage.multiRemove(['authToken', 'userData']);
        
        console.log('✅ Account deleted successfully');
        return { success: true };
      }
      
      return { success: false, error: 'Failed to delete account' };
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error('❌ Delete account error:', errorInfo);
      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
      };
    }
  },

  /**
   * Refresh JWT token
   * @returns {Promise<Object>} Token refresh response
   */
  refreshToken: async () => {
    try {
      console.log('🔄 Refreshing auth token');
      
      const response = await axiosInstance.post('/auth/refresh');
      
      if (isSuccess(response)) {
        const data = getResponseData(response);
        
        // Update stored token
        await AsyncStorage.setItem('authToken', data.token);
        
        console.log('✅ Token refreshed successfully');
        return {
          success: true,
          token: data.token,
        };
      }
      
      return { success: false, error: 'Failed to refresh token' };
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error('❌ Refresh token error:', errorInfo);
      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
      };
    }
  },

  /**
   * Logout user
   * @returns {Promise<Object>} Logout response
   */
  logout: async () => {
    try {
      console.log('👋 Logging out user');
      
      // Call logout endpoint (optional, for server-side cleanup)
      try {
        await axiosInstance.post('/auth/logout');
      } catch (error) {
        // Continue with local logout even if server logout fails
        console.warn('⚠️ Server logout failed, continuing with local logout');
      }
      
      // Clear stored data
      await AsyncStorage.multiRemove(['authToken', 'userData']);
      
      console.log('✅ User logged out successfully');
      return { success: true };
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error('❌ Logout error:', errorInfo);
      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
      };
    }
  },

  /**
   * Check if user is authenticated
   * @returns {Promise<boolean>} Authentication status
   */
  isAuthenticated: async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      return !!token;
    } catch (error) {
      console.error('❌ Check authentication error:', error);
      return false;
    }
  },

  /**
   * Get stored user data
   * @returns {Promise<Object|null>} User data or null
   */
  getStoredUser: async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('❌ Get stored user error:', error);
      return null;
    }
  },

  /**
   * Get stored token
   * @returns {Promise<string|null>} JWT token or null
   */
  getStoredToken: async () => {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('❌ Get stored token error:', error);
      return null;
    }
  },
};

export default authApi;

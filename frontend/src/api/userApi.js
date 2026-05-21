import axiosInstance from './axiosInstance';
import { handleApiError, isSuccess, getResponseData } from './axiosInstance';

/**
 * User API service
 * Handles all user-related API calls (profile, measurements, achievements)
 */

export const userApi = {
  /**
   * Get user profile and stats
   * @returns {Promise<Object>} User profile and stats
   */
  getUserProfile: async () => {
    try {
      const response = await axiosInstance.get('/users/profile');
      if (isSuccess(response)) {
        return {
          success: true,
          data: getResponseData(response),
        };
      }
      return { success: false, error: 'Failed to fetch profile' };
    } catch (error) {
      const errorInfo = handleApiError(error);
      return { success: false, error: errorInfo.message };
    }
  },

  /**
   * Update user profile
   * @param {Object} profileData - Profile update data
   * @returns {Promise<Object>} Updated profile
   */
  updateProfile: async (profileData) => {
    try {
      const response = await axiosInstance.put('/users/profile', profileData);
      if (isSuccess(response)) {
        return {
          success: true,
          data: getResponseData(response),
        };
      }
      return { success: false, error: 'Failed to update profile' };
    } catch (error) {
      const errorInfo = handleApiError(error);
      return { success: false, error: errorInfo.message };
    }
  },

  /**
   * Get body measurements
   * @returns {Promise<Object>} Body measurements
   */
  getMeasurements: async () => {
    try {
      const response = await axiosInstance.get('/users/measurements');
      if (isSuccess(response)) {
        return {
          success: true,
          data: getResponseData(response),
        };
      }
      return { success: false, error: 'Failed to fetch measurements' };
    } catch (error) {
      const errorInfo = handleApiError(error);
      return { success: false, error: errorInfo.message };
    }
  },

  /**
   * Add body measurement
   * @param {Object} measurementData - Measurement data
   * @returns {Promise<Object>} Created measurement
   */
  addMeasurement: async (measurementData) => {
    try {
      const response = await axiosInstance.post('/users/measurements', measurementData);
      if (isSuccess(response)) {
        return {
          success: true,
          data: getResponseData(response),
        };
      }
      return { success: false, error: 'Failed to add measurement' };
    } catch (error) {
      const errorInfo = handleApiError(error);
      return { success: false, error: errorInfo.message };
    }
  },

  /**
   * Get user achievements
   * @returns {Promise<Object>} Achievements
   */
  getAchievements: async () => {
    try {
      const response = await axiosInstance.get('/achievements');
      if (isSuccess(response)) {
        return {
          success: true,
          data: getResponseData(response),
        };
      }
      return { success: false, error: 'Failed to fetch achievements' };
    } catch (error) {
      const errorInfo = handleApiError(error);
      return { success: false, error: errorInfo.message };
    }
  },
};

export default userApi;

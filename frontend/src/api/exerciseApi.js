import axiosInstance from './axiosInstance';
import { handleApiError, isSuccess, getResponseData } from './axiosInstance';

/**
 * Exercise API service
 * Handles all exercise-related API calls
 */
export const exerciseApi = {
  /**
   * Get all exercises from library
   * @param {Object} filters - Optional filters (category, muscleGroup, search)
   * @returns {Promise<Object>} Exercises data
   */
  getExercises: async (filters = {}) => {
    try {
      console.log('🏋️ Fetching exercises with filters:', filters);
      
      const response = await axiosInstance.get('/exercises', { params: filters });
      
      if (isSuccess(response)) {
        const data = getResponseData(response);
        console.log(`✅ ${data.length} exercises fetched successfully`);
        return {
          success: true,
          data: data,
        };
      }
      
      return { success: false, error: 'Failed to fetch exercises' };
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error('❌ Get exercises error:', errorInfo);
      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
      };
    }
  },

  /**
   * Get exercise by ID
   * @param {string} id - Exercise ID
   * @returns {Promise<Object>} Exercise data
   */
  getExerciseById: async (id) => {
    try {
      console.log('🔍 Fetching exercise by ID:', id);
      
      const response = await axiosInstance.get(`/exercises/${id}`);
      
      if (isSuccess(response)) {
        const data = getResponseData(response);
        console.log('✅ Exercise fetched successfully');
        return {
          success: true,
          data: data,
        };
      }
      
      return { success: false, error: 'Failed to fetch exercise' };
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error('❌ Get exercise error:', errorInfo);
      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
      };
    }
  }
};

export default exerciseApi;

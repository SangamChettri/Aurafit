import axiosInstance from './axiosInstance';

/**
 * Content API service for fetching app-wide constants and dynamic content
 */
const contentApi = {
  /**
   * Get app-wide constants (categories, muscle groups, milestones)
   */
  getConstants: async () => {
    try {
      console.log('API Request: GET /content/constants');
      const response = await axiosInstance.get('/content/constants');
      return response.data;
    } catch (error) {
      console.error('API Error: GET /content/constants -', error.message);
      throw error;
    }
  },

  /**
   * Get daily inspiration
   */
  getInspiration: async () => {
    try {
      console.log('API Request: GET /content/inspiration');
      const response = await axiosInstance.get('/content/inspiration');
      return response.data;
    } catch (error) {
      console.error('API Error: GET /content/inspiration -', error.message);
      throw error;
    }
  }
};

export default contentApi;

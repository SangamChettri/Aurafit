import axiosInstance from './axiosInstance';
import { handleApiError, isSuccess, getResponseData } from './axiosInstance';

/**
 * Workout API service
 * Handles all workout-related API calls
 */

export const workoutApi = {
  /**
   * Create a new workout
   * @param {Object} workoutData - Workout data
   * @param {string} workoutData.name - Workout name
   * @param {string} workoutData.type - Workout type (STRENGTH, CARDIO, etc.)
   * @param {Date} workoutData.date - Workout date
   * @param {Array} workoutData.exercises - Array of exercises
   * @param {number} workoutData.duration - Duration in minutes
   * @param {number} workoutData.calories - Calories burned
   * @param {string} workoutData.notes - Workout notes
   * @returns {Promise<Object>} Created workout data
   */
  createWorkout: async (workoutData) => {
    try {
      console.log('💪 Creating new workout:', workoutData.name);
      
      const response = await axiosInstance.post('/workouts', workoutData);
      
      if (isSuccess(response)) {
        const data = getResponseData(response);
        console.log(' Workout created successfully');
        return {
          success: true,
          workout: data,
        };
      }
      
      return { success: false, error: 'Failed to create workout' };
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error(' Create workout error:', errorInfo);
      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
        errors: errorInfo.errors,
      };
    }
  },

  /**
   * Get all workouts for the user
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Number of workouts per page (default: 10)
   * @param {string} params.startDate - Start date filter (ISO string)
   * @param {string} params.endDate - End date filter (ISO string)
   * @param {string} params.type - Workout type filter
   * @param {string} params.sortBy - Sort field (date, name, totalVolume, duration)
   * @param {string} params.sortOrder - Sort order (asc, desc)
   * @returns {Promise<Object>} Workouts data with pagination
   */
  getWorkouts: async (params = {}) => {
    try {
      console.log(' Fetching workouts with params:', params);
      
      const response = await axiosInstance.get('/workouts', { params });
      
      if (isSuccess(response)) {
        const data = getResponseData(response);
        console.log(` Fetched ${data.workouts.length} workouts`);
        return {
          success: true,
          workouts: data.workouts,
          pagination: data.pagination,
        };
      }
      
      return { success: false, error: 'Failed to fetch workouts' };
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error(' Get workouts error:', errorInfo);
      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
      };
    }
  },

  /**
   * Get a single workout by ID
   * @param {string} workoutId - Workout ID
   * @returns {Promise<Object>} Workout data
   */
  getWorkoutById: async (workoutId) => {
    try {
      console.log(' Fetching workout by ID:', workoutId);
      
      const response = await axiosInstance.get(`/workouts/${workoutId}`);
      
      if (isSuccess(response)) {
        const data = getResponseData(response);
        console.log(' Workout fetched successfully');
        return {
          success: true,
          workout: data,
        };
      }
      
      return { success: false, error: 'Failed to fetch workout' };
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error(' Get workout error:', errorInfo);
      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
      };
    }
  },

  /**
   * Update an existing workout
   * @param {string} workoutId - Workout ID
   * @param {Object} updateData - Workout update data
   * @returns {Promise<Object>} Updated workout data
   */
  updateWorkout: async (workoutId, updateData) => {
    try {
      console.log(' Updating workout:', workoutId);
      
      const response = await axiosInstance.put(`/workouts/${workoutId}`, updateData);
      
      if (isSuccess(response)) {
        const data = getResponseData(response);
        console.log(' Workout updated successfully');
        return {
          success: true,
          workout: data,
        };
      }
      
      return { success: false, error: 'Failed to update workout' };
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error(' Update workout error:', errorInfo);
      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
        errors: errorInfo.errors,
      };
    }
  },

  /**
   * Delete a workout
   * @param {string} workoutId - Workout ID
   * @returns {Promise<Object>} Deletion response
   */
  deleteWorkout: async (workoutId) => {
    try {
      console.log(' Deleting workout:', workoutId);
      
      const response = await axiosInstance.delete(`/workouts/${workoutId}`);
      
      if (isSuccess(response)) {
        console.log(' Workout deleted successfully');
        return { success: true };
      }
      
      return { success: false, error: 'Failed to delete workout' };
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error(' Delete workout error:', errorInfo);
      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
      };
    }
  },

  /**
   * Get workout statistics
   * @param {string} period - Time period (week, month, year)
   * @returns {Promise<Object>} Workout statistics
   */
  getWorkoutStats: async (period = 'month') => {
    try {
      console.log(' Fetching workout stats for period:', period);
      
      const response = await axiosInstance.get('/workouts/stats', { params: { period } });
      
      if (isSuccess(response)) {
        const data = getResponseData(response);
        console.log(' Workout stats fetched successfully');
        return {
          success: true,
          stats: data.stats,
          personalBests: data.personalBests,
          topExercises: data.topExercises,
          totalExercises: data.totalExercises,
        };
      }
      
      return { success: false, error: 'Failed to fetch workout stats' };
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error(' Get workout stats error:', errorInfo);
      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
      };
    }
  },

  /**
   * Get personal bests
   * @returns {Promise<Object>} Personal bests data
   */
  getPersonalBests: async () => {
    try {
      console.log(' Fetching personal bests');
      
      const response = await axiosInstance.get('/workouts/personal-bests');
      
      if (isSuccess(response)) {
        const data = getResponseData(response);
        console.log(' Personal bests fetched successfully');
        return {
          success: true,
          personalBests: data,
        };
      }
      
      return { success: false, error: 'Failed to fetch personal bests' };
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error(' Get personal bests error:', errorInfo);
      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
      };
    }
  },

  /**
   * Duplicate a workout
   * @param {string} workoutId - Workout ID to duplicate
   * @returns {Promise<Object>} Duplicated workout data
   */
  duplicateWorkout: async (workoutId) => {
    try {
      console.log(' Duplicating workout:', workoutId);
      
      const response = await axiosInstance.post(`/workouts/${workoutId}/duplicate`);
      
      if (isSuccess(response)) {
        const data = getResponseData(response);
        console.log(' Workout duplicated successfully');
        return {
          success: true,
          workout: data,
        };
      }
      
      return { success: false, error: 'Failed to duplicate workout' };
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error(' Duplicate workout error:', errorInfo);
      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
      };
    }
  },

  /**
   * Get workouts for a specific date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Object>} Workouts in date range
   */
  getWorkoutsByDateRange: async (startDate, endDate) => {
    try {
      console.log(' Fetching workouts for date range:', startDate, 'to', endDate);
      
      const params = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };
      
      const response = await axiosInstance.get('/workouts', { params });
      
      if (isSuccess(response)) {
        const data = getResponseData(response);
        console.log(` Fetched ${data.workouts.length} workouts for date range`);
        return {
          success: true,
          workouts: data.workouts,
        };
      }
      
      return { success: false, error: 'Failed to fetch workouts for date range' };
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error(' Get workouts by date range error:', errorInfo);
      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
      };
    }
  },

  /**
   * Get recent workouts (last 10)
   * @returns {Promise<Object>} Recent workouts
   */
  getRecentWorkouts: async () => {
    try {
      console.log(' Fetching recent workouts');
      
      const params = { limit: 10, sortBy: 'date', sortOrder: 'desc' };
      const response = await axiosInstance.get('/workouts', { params });
      
      if (isSuccess(response)) {
        const data = getResponseData(response);
        console.log(` Fetched ${data.workouts.length} recent workouts`);
        return {
          success: true,
          workouts: data.workouts,
        };
      }
      
      return { success: false, error: 'Failed to fetch recent workouts' };
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error(' Get recent workouts error:', errorInfo);
      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
      };
    }
  },

  /**
   * Search workouts by name or exercise
   * @param {string} searchTerm - Search term
   * @returns {Promise<Object>} Search results
   */
  searchWorkouts: async (searchTerm) => {
    try {
      console.log(' Searching workouts:', searchTerm);
      
      const params = { search: searchTerm };
      const response = await axiosInstance.get('/workouts', { params });
      
      if (isSuccess(response)) {
        const data = getResponseData(response);
        console.log(` Found ${data.workouts.length} workouts matching search`);
        return {
          success: true,
          workouts: data.workouts,
        };
      }
      
      return { success: false, error: 'Failed to search workouts' };
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error(' Search workouts error:', errorInfo);
      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
      };
    }
  },
};

export default workoutApi;

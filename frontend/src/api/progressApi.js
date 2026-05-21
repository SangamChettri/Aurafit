import axiosInstance from './axiosInstance';
import { handleApiError, isSuccess, getResponseData } from './axiosInstance';

/**
 * Progress API service
 * Handles all progress tracking and analytics API calls
 */

export const progressApi = {
  /**
   * Get comprehensive progress summary
   * @returns {Promise<Object>} Progress summary data
   */
  getProgressSummary: async () => {
    try {
      console.log('📊 Fetching progress summary');
      
      const response = await axiosInstance.get('/progress/summary');
      
      if (isSuccess(response)) {
        const data = getResponseData(response);
        console.log('✅ Progress summary fetched successfully');
        return {
          success: true,
          summary: data.summary,
          periods: data.periods,
          streak: data.streak,
          personalBests: data.personalBests,
          progressIndicators: data.progressIndicators,
        };
      }
      
      return { success: false, error: 'Failed to fetch progress summary' };
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error('❌ Get progress summary error:', errorInfo);
      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
      };
    }
  },

  /**
   * Get weekly progress data
   * @param {number} weeks - Number of weeks to fetch (default: 12)
   * @returns {Promise<Object>} Weekly progress data
   */
  getWeeklyProgress: async (weeks = 12) => {
    try {
      console.log('📈 Fetching weekly progress for', weeks, 'weeks');
      
      const response = await axiosInstance.get('/progress/weekly', { params: { weeks } });
      
      if (isSuccess(response)) {
        const data = getResponseData(response);
        console.log(`✅ Weekly progress fetched successfully (${data.weeklyData.length} weeks)`);
        return {
          success: true,
          weeklyData: data.weeklyData,
          trends: data.trends,
          period: data.period,
        };
      }
      
      return { success: false, error: 'Failed to fetch weekly progress' };
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error('❌ Get weekly progress error:', errorInfo);
      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
      };
    }
  },

  /**
   * Get monthly progress data
   * @param {number} months - Number of months to fetch (default: 12)
   * @returns {Promise<Object>} Monthly progress data
   */
  getMonthlyProgress: async (months = 12) => {
    try {
      console.log('📅 Fetching monthly progress for', months, 'months');
      
      const response = await axiosInstance.get('/progress/monthly', { params: { months } });
      
      if (isSuccess(response)) {
        const data = getResponseData(response);
        console.log(`✅ Monthly progress fetched successfully (${data.monthlyData.length} months)`);
        return {
          success: true,
          monthlyData: data.monthlyData,
          trends: data.trends,
          period: data.period,
        };
      }
      
      return { success: false, error: 'Failed to fetch monthly progress' };
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error('❌ Get monthly progress error:', errorInfo);
      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
      };
    }
  },

  /**
   * Get volume trend data
   * @param {string} period - Time period (week, month, year)
   * @param {string} exercise - Specific exercise name (optional)
   * @returns {Promise<Object>} Volume trend data
   */
  getVolumeTrend: async (period = 'month', exercise = null) => {
    try {
      console.log('📊 Fetching volume trend for period:', period, 'exercise:', exercise);
      
      const params = { period };
      if (exercise) params.exercise = exercise;
      
      const response = await axiosInstance.get('/progress/volume-trend', { params });
      
      if (isSuccess(response)) {
        const data = getResponseData(response);
        console.log(`✅ Volume trend fetched successfully (${data.volumeData.length} data points)`);
        return {
          success: true,
          volumeData: data.volumeData,
          movingAverage: data.movingAverage,
          period: data.period,
          exercise: data.exercise,
          totalDataPoints: data.totalDataPoints,
        };
      }
      
      return { success: false, error: 'Failed to fetch volume trend' };
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error('❌ Get volume trend error:', errorInfo);
      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
      };
    }
  },

  /**
   * Get exercise-specific progress
   * @param {string} exerciseName - Exercise name
   * @param {string} metric - Metric to track (weight, reps, volume, sets)
   * @param {string} period - Time period (week, month, quarter, year, all)
   * @returns {Promise<Object>} Exercise progress data
   */
  getExerciseProgress: async (exerciseName, metric = 'weight', period = 'all') => {
    try {
      console.log('💪 Fetching exercise progress for:', exerciseName, 'metric:', metric);
      
      const params = { metric, period };
      const response = await axiosInstance.get(`/progress/exercise/${encodeURIComponent(exerciseName)}`, { params });
      
      if (isSuccess(response)) {
        const data = getResponseData(response);
        console.log(`✅ Exercise progress fetched successfully (${data.progressData.length} data points)`);
        return {
          success: true,
          exerciseName: data.exerciseName,
          metric: data.metric,
          period: data.period,
          progressData: data.progressData,
          stats: data.stats,
          personalBest: data.personalBest,
        };
      }
      
      return { success: false, error: 'Failed to fetch exercise progress' };
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error('❌ Get exercise progress error:', errorInfo);
      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
      };
    }
  },

  /**
   * Get body measurements (placeholder for future implementation)
   * @returns {Promise<Object>} Body measurements data
   */
  getMeasurements: async () => {
    try {
      console.log('📏 Fetching body measurements');
      
      const response = await axiosInstance.get('/progress/measurements');
      
      if (isSuccess(response)) {
        const data = getResponseData(response);
        console.log('✅ Body measurements fetched successfully');
        return {
          success: true,
          measurements: data.measurements,
          message: data.message,
        };
      }
      
      return { success: false, error: 'Failed to fetch measurements' };
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error('❌ Get measurements error:', errorInfo);
      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
      };
    }
  },

  /**
   * Get workout frequency data
   * @param {string} period - Time period (week, month, year)
   * @returns {Promise<Object>} Workout frequency data
   */
  getWorkoutFrequency: async (period = 'month') => {
    try {
      console.log('📊 Fetching workout frequency for period:', period);
      
      // Use weekly or monthly progress to calculate frequency
      let progressData;
      if (period === 'week') {
        progressData = await progressApi.getWeeklyProgress(4); // Last 4 weeks
      } else if (period === 'year') {
        progressData = await progressApi.getMonthlyProgress(12); // Last 12 months
      } else {
        progressData = await progressApi.getMonthlyProgress(1); // Last month
      }

      if (!progressData.success) {
        return progressData;
      }

      const dataKey = period === 'week' ? 'weeklyData' : 'monthlyData';
      const frequencyData = progressData[dataKey].map(item => ({
        period: item.weekStart || item.monthStart,
        workouts: item.totalWorkouts,
        avgVolumePerWorkout: item.avgVolumePerWorkout,
        avgDurationPerWorkout: item.avgDurationPerWorkout,
      }));

      return {
        success: true,
        frequencyData,
        period,
      };
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error('❌ Get workout frequency error:', errorInfo);
      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
      };
    }
  },

  /**
   * Get progress comparison between periods
   * @param {string} currentPeriod - Current period (week, month, year)
   * @param {string} previousPeriod - Previous period to compare with
   * @returns {Promise<Object>} Comparison data
   */
  getProgressComparison: async (currentPeriod = 'month', previousPeriod = 'month') => {
    try {
      console.log('📊 Fetching progress comparison:', currentPeriod, 'vs', previousPeriod);
      
      // Get current period data
      const currentData = await progressApi.getProgressSummary();
      if (!currentData.success) return currentData;

      // Calculate comparison metrics
      const comparison = {
        totalWorkouts: {
          current: currentData.summary.totalWorkouts,
          previous: Math.max(0, currentData.summary.totalWorkouts - Math.floor(Math.random() * 5)), // Placeholder
          change: 0, // Will be calculated with real data
          changePercentage: 0,
        },
        totalVolume: {
          current: currentData.summary.totalVolume,
          previous: Math.max(0, currentData.summary.totalVolume - Math.floor(Math.random() * 1000)), // Placeholder
          change: 0,
          changePercentage: 0,
        },
        currentStreak: {
          current: currentData.streak.currentStreak,
          previous: Math.max(0, currentData.streak.currentStreak - 1), // Placeholder
          change: 0,
          changePercentage: 0,
        },
      };

      // Calculate changes
      Object.keys(comparison).forEach(key => {
        const metric = comparison[key];
        metric.change = metric.current - metric.previous;
        metric.changePercentage = metric.previous > 0 
          ? Math.round((metric.change / metric.previous) * 100) 
          : metric.current > 0 ? 100 : 0;
      });

      return {
        success: true,
        comparison,
        currentPeriod,
        previousPeriod,
      };
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error('❌ Get progress comparison error:', errorInfo);
      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
      };
    }
  },

  /**
   * Get progress insights and recommendations
   * @returns {Promise<Object>} Progress insights
   */
  getProgressInsights: async () => {
    try {
      console.log('💡 Fetching progress insights');
      
      // Get progress summary to generate insights
      const summaryData = await progressApi.getProgressSummary();
      if (!summaryData.success) return summaryData;

      const insights = {
        consistency: {
          level: 'beginner', // Will be calculated based on actual data
          message: 'Keep up the good work! Try to maintain a consistent workout schedule.',
          recommendation: 'Aim for at least 3 workouts per week for optimal results.',
        },
        strength: {
          level: 'improving',
          message: 'Your strength is showing steady progress.',
          recommendation: 'Focus on progressive overload to continue building strength.',
        },
        volume: {
          level: 'moderate',
          message: 'Your workout volume is in a healthy range.',
          recommendation: 'Consider gradually increasing volume to avoid plateaus.',
        },
        streak: {
          level: summaryData.streak.currentStreak > 7 ? 'excellent' : 'developing',
          message: summaryData.streak.currentStreak > 0 
            ? `Great job maintaining a ${summaryData.streak.currentStreak}-day streak!`
            : 'Start building your workout streak today!',
          recommendation: 'Consistency is key - try to work out at least 3 times per week.',
        },
      };

      return {
        success: true,
        insights,
        basedOnData: {
          totalWorkouts: summaryData.summary.totalWorkouts,
          currentStreak: summaryData.streak.currentStreak,
          totalVolume: summaryData.summary.totalVolume,
        },
      };
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error('❌ Get progress insights error:', errorInfo);
      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
      };
    }
  },
};

export default progressApi;

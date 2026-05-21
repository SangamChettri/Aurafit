import axiosInstance from './axiosInstance';
import { handleApiError, isSuccess, getResponseData } from './axiosInstance';
import contentApi from './contentApi';

/**
 * Streak API service
 * Handles all streak-related API calls
 */

export const streakApi = {
  /**
   * Get user's streak information
   * @returns {Promise<Object>} Streak data
   */
  getStreak: async () => {
    try {
      console.log('🔥 Fetching user streak information');

      const response = await axiosInstance.get('/streak');

      if (isSuccess(response)) {
        const data = getResponseData(response);
        console.log('✅ Streak information fetched successfully');
        return {
          success: true,
          currentStreak: data.currentStreak,
          longestStreak: data.longestStreak,
          lastWorkoutDate: data.lastWorkoutDate,
          isActive: data.isActive,
          daysSinceLastWorkout: data.daysSinceLastWorkout,
          status: data.status,
          milestones: data.milestones,
          prediction: data.prediction,
          freezeDays: data.freezeDays,
          workoutHistory: data.workoutHistory,
        };
      }

      return { success: false, error: 'Failed to fetch streak information' };
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error('❌ Get streak error:', errorInfo);
      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
      };
    }
  },

  /**
   * Get streak history
   * @param {number} limit - Number of history items to fetch (default: 50)
   * @returns {Promise<Object>} Streak history data
   */
  getStreakHistory: async (limit = 50) => {
    try {
      console.log('📜 Fetching streak history');

      const response = await axiosInstance.get('/streak/history', { params: { limit } });

      if (isSuccess(response)) {
        const data = getResponseData(response);
        console.log(`✅ Streak history fetched successfully (${data.streakHistory.length} periods)`);
        return {
          success: true,
          currentStreak: data.currentStreak,
          longestStreak: data.longestStreak,
          streakHistory: data.streakHistory,
          milestones: data.milestones,
          recentWorkouts: data.recentWorkouts,
          totalWorkouts: data.totalWorkouts,
        };
      }

      return { success: false, error: 'Failed to fetch streak history' };
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error('❌ Get streak history error:', errorInfo);
      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
      };
    }
  },

  /**
   * Use streak freeze day (Premium users only)
   * @returns {Promise<Object>} Freeze day usage response
   */
  useFreezeDay: async () => {
    try {
      console.log('❄️ Using streak freeze day');

      const response = await axiosInstance.post('/streak/freeze');

      if (isSuccess(response)) {
        const data = getResponseData(response);
        console.log('✅ Freeze day used successfully');
        return {
          success: true,
          freezeDaysRemaining: data.freezeDaysRemaining,
          freezeDaysUsed: data.freezeDaysUsed,
          currentStreak: data.currentStreak,
          message: data.message,
        };
      }

      return { success: false, error: 'Failed to use freeze day' };
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error('❌ Use freeze day error:', errorInfo);

      // Handle premium requirement specifically
      if (errorInfo.code === 'PREMIUM_REQUIRED') {
        return {
          success: false,
          error: 'This feature requires a premium subscription.',
          code: 'PREMIUM_REQUIRED',
          requiresUpgrade: true,
        };
      }

      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
      };
    }
  },

  /**
   * Get streak leaderboard
   * @param {number} limit - Number of leaders to fetch (default: 50)
   * @param {string} type - Leaderboard type ('current' or 'longest')
   * @returns {Promise<Object>} Leaderboard data
   */
  getStreakLeaderboard: async (limit = 50, type = 'current') => {
    try {
      console.log('🏆 Fetching streak leaderboard:', type);

      const response = await axiosInstance.get('/streak/leaderboard', { params: { limit, type } });

      if (isSuccess(response)) {
        const data = getResponseData(response);
        console.log(`✅ Leaderboard fetched successfully (${data.leaderboard.length} users)`);
        return {
          success: true,
          leaderboard: data.leaderboard,
          type: data.type,
          userRank: data.userRank,
          totalParticipants: data.totalParticipants,
        };
      }

      return { success: false, error: 'Failed to fetch streak leaderboard' };
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error('❌ Get streak leaderboard error:', errorInfo);
      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
      };
    }
  },

  /**
   * Get streak statistics
   * @returns {Promise<Object>} Streak statistics
   */
  getStreakStats: async () => {
    try {
      console.log('📊 Fetching streak statistics');

      const response = await axiosInstance.get('/streak/stats');

      if (isSuccess(response)) {
        const data = getResponseData(response);
        console.log('✅ Streak statistics fetched successfully');
        return {
          success: true,
          totalActiveStreaks: data.totalActiveStreaks,
          avgCurrentStreak: data.avgCurrentStreak,
          avgLongestStreak: data.avgLongestStreak,
          longestActiveStreak: data.longestActiveStreak,
          longestAllTimeStreak: data.longestAllTimeStreak,
          totalUsers: data.totalUsers,
          participationRate: data.participationRate,
          milestoneDistribution: data.milestoneDistribution,
        };
      }

      return { success: false, error: 'Failed to fetch streak statistics' };
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error('❌ Get streak stats error:', errorInfo);
      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
      };
    }
  },

  /**
   * Recalculate streak (for debugging or manual sync)
   * @returns {Promise<Object>} Recalculation response
   */
  recalculateStreak: async () => {
    try {
      console.log('🔄 Recalculating streak');

      const response = await axiosInstance.post('/streak/recalculate');

      if (isSuccess(response)) {
        const data = getResponseData(response);
        console.log('✅ Streak recalculated successfully');
        return {
          success: true,
          previousStreak: data.previousStreak,
          newStreak: data.newStreak,
          longestStreak: data.longestStreak,
          newMilestones: data.newMilestones,
          workoutDates: data.workoutDates,
          message: data.message,
        };
      }

      return { success: false, error: 'Failed to recalculate streak' };
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error('❌ Recalculate streak error:', errorInfo);
      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
      };
    }
  },

  /**
   * Get streak milestones achieved
   * @returns {Promise<Object>} Milestones data
   */
  getStreakMilestones: async () => {
    try {
      console.log('🏅 Fetching streak milestones');

      const [streakData, contentData] = await Promise.all([
        streakApi.getStreak(),
        contentApi.getConstants().catch(() => ({ success: false }))
      ]);

      if (!streakData.success) return streakData;

      const milestones = (contentData.success && contentData.data.streakMilestones)
        ? contentData.data.streakMilestones
        : [7, 14, 30, 60, 90, 100, 200, 365];

      const achievedMilestones = milestones.filter(milestone =>
        streakData.currentStreak >= milestone
      );
      const nextMilestone = milestones.find(milestone =>
        streakData.currentStreak < milestone
      );

      return {
        success: true,
        currentStreak: streakData.currentStreak,
        achievedMilestones,
        nextMilestone,
        totalAchieved: achievedMilestones.length,
        progressToNext: nextMilestone
          ? Math.round((streakData.currentStreak / nextMilestone) * 100)
          : 100,
      };
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error('❌ Get streak milestones error:', errorInfo);
      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
      };
    }
  },

  /**
   * Get streak prediction and likelihood
   * @returns {Promise<Object>} Streak prediction data
   */
  getStreakPrediction: async () => {
    try {
      console.log('🔮 Fetching streak prediction');

      const streakData = await streakApi.getStreak();
      if (!streakData.success) return streakData;

      return {
        success: true,
        prediction: streakData.prediction,
        currentStreak: streakData.currentStreak,
        isActive: streakData.isActive,
        daysSinceLastWorkout: streakData.daysSinceLastWorkout,
        recommendations: streakData.prediction?.reliable ? [
          'Keep up the consistent workouts!',
          'Your current routine is working well.',
          'Consider setting a new personal best this week.',
        ] : [
          'Try to establish a more consistent routine',
          'Aim for at least 3 workouts per week',
          'Set reminders to help maintain your streak',
        ],
      };
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error('❌ Get streak prediction error:', errorInfo);
      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
      };
    }
  },

  /**
   * Check if streak is at risk
   * @returns {Promise<Object>} Streak risk assessment
   */
  checkStreakRisk: async () => {
    try {
      console.log('⚠️ Checking streak risk');

      const streakData = await streakApi.getStreak();
      if (!streakData.success) return streakData;

      const { daysSinceLastWorkout, currentStreak, isActive } = streakData;

      let riskLevel = 'safe';
      let riskMessage = 'Your streak is safe!';
      let recommendations = [];

      if (!isActive || currentStreak === 0) {
        riskLevel = 'broken';
        riskMessage = 'No active streak. Start working out to build a new one!';
        recommendations = ['Start with a light workout today', 'Set a consistent schedule', 'Find a workout buddy for motivation'];
      } else if (daysSinceLastWorkout === 1) {
        riskLevel = 'warning';
        riskMessage = 'Work out today to maintain your streak!';
        recommendations = ['Schedule a workout for today', 'Set a reminder', 'Even a short workout will maintain your streak'];
      } else if (daysSinceLastWorkout >= 2) {
        riskLevel = 'danger';
        riskMessage = 'Your streak is at risk of breaking!';
        recommendations = ['Work out immediately to save your streak', 'Consider using a freeze day if premium', 'Contact support if there are issues'];
      } else if (currentStreak >= 7 && currentStreak < 14) {
        riskLevel = 'moderate';
        riskMessage = 'Good progress! Keep the momentum going.';
        recommendations = ['Plan your workouts for the week', 'Try a new exercise to stay motivated'];
      }

      return {
        success: true,
        riskLevel,
        riskMessage,
        recommendations,
        currentStreak,
        daysSinceLastWorkout,
        isActive,
      };
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error('❌ Check streak risk error:', errorInfo);
      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
      };
    }
  },
};

export default streakApi;

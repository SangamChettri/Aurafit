import axiosInstance from './axiosInstance';
import { handleApiError, isSuccess, getResponseData } from './axiosInstance';

/**
 * Notification API service
 * Handles all notification-related API calls
 */

export const notificationApi = {
  /**
   * Get user's notification preferences
   * @returns {Promise<Object>} Notification preferences
   */
  getNotificationPreferences: async () => {
    try {
      console.log('🔔 Fetching notification preferences');

      const response = await axiosInstance.get('/notifications/preferences');

      if (isSuccess(response)) {
        const data = getResponseData(response);
        console.log('✅ Notification preferences fetched successfully');
        return {
          success: true,
          preferences: data.preferences,
          stats: data.stats,
        };
      }

      return { success: false, error: 'Failed to fetch notification preferences' };
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error('❌ Get notification preferences error:', errorInfo);
      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
      };
    }
  },

  /**
   * Update notification preferences
   * @param {Object} preferences - Notification preferences to update
   * @returns {Promise<Object>} Updated preferences
   */
  updateNotificationPreferences: async (preferences) => {
    try {
      console.log('✏️ Updating notification preferences');

      const response = await axiosInstance.put('/notifications/preferences', preferences);

      if (isSuccess(response)) {
        const data = getResponseData(response);
        console.log('✅ Notification preferences updated successfully');
        return {
          success: true,
          preferences: data.preferences,
          message: data.message,
        };
      }

      return { success: false, error: 'Failed to update notification preferences' };
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error('❌ Update notification preferences error:', errorInfo);
      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
        errors: errorInfo.errors,
      };
    }
  },

  /**
   * Get notification history
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Number of notifications per page (default: 20)
   * @param {string} params.type - Notification type filter
   * @param {boolean} params.unreadOnly - Filter only unread notifications
   * @param {string} params.startDate - Start date filter (ISO string)
   * @param {string} params.endDate - End date filter (ISO string)
   * @returns {Promise<Object>} Notification history
   */
  getNotificationHistory: async (params = {}) => {
    try {
      console.log('📜 Fetching notification history with params:', params);

      const response = await axiosInstance.get('/notifications/history', { params });

      if (isSuccess(response)) {
        const data = getResponseData(response);
        console.log(`✅ Notification history fetched successfully (${data.notifications.length} notifications)`);
        return {
          success: true,
          notifications: data.notifications,
          pagination: data.pagination,
          unreadCount: data.unreadCount,
        };
      }

      return { success: false, error: 'Failed to fetch notification history' };
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error('❌ Get notification history error:', errorInfo);
      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
      };
    }
  },

  /**
   * Mark notifications as read
   * @param {Array<string>} notificationIds - Array of notification IDs to mark as read (optional, marks all if not provided)
   * @returns {Promise<Object>} Mark as read response
   */
  markNotificationsAsRead: async (notificationIds = null) => {
    try {
      console.log('✅ Marking notifications as read');

      const response = await axiosInstance.put('/notifications/read', { notificationIds });

      if (isSuccess(response)) {
        console.log('✅ Notifications marked as read successfully');
        return {
          success: true,
          message: response.data.message,
        };
      }

      return { success: false, error: 'Failed to mark notifications as read' };
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error('❌ Mark notifications as read error:', errorInfo);
      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
      };
    }
  },

  /**
   * Add device token for push notifications
   * @param {string} token - Device token
   * @param {string} platform - Platform ('ios' or 'android')
   * @returns {Promise<Object>} Device token addition response
   */
  addDeviceToken: async (token, platform) => {
    try {
      console.log('📱 Adding device token for push notifications');

      const response = await axiosInstance.post('/notifications/device-token', { token, platform });

      if (isSuccess(response)) {
        console.log('✅ Device token added successfully');
        return {
          success: true,
          message: response.data.message,
        };
      }

      return { success: false, error: 'Failed to add device token' };
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error('❌ Add device token error:', errorInfo);
      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
      };
    }
  },

  /**
   * Remove device token
   * @param {string} token - Device token to remove
   * @returns {Promise<Object>} Device token removal response
   */
  removeDeviceToken: async (token) => {
    try {
      console.log('📱 Removing device token');

      const response = await axiosInstance.delete('/notifications/device-token', { data: { token } });

      if (isSuccess(response)) {
        console.log('✅ Device token removed successfully');
        return {
          success: true,
          message: response.data.message,
        };
      }

      return { success: false, error: 'Failed to remove device token' };
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error('❌ Remove device token error:', errorInfo);
      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
      };
    }
  },

  /**
   * Send test notification (for development/testing)
   * @param {Object} testData - Test notification data
   * @param {string} testData.type - Notification type
   * @param {string} testData.title - Notification title
   * @param {string} testData.message - Notification message
   * @returns {Promise<Object>} Test notification response
   */
  sendTestNotification: async (testData = {}) => {
    try {
      console.log('🧪 Sending test notification');

      const defaultData = {
        type: 'info',
        title: 'Test Notification',
        message: 'This is a test notification from AuraFit',
      };

      const response = await axiosInstance.post('/notifications/test', { ...defaultData, ...testData });

      if (isSuccess(response)) {
        const data = getResponseData(response);
        console.log('✅ Test notification sent successfully');
        return {
          success: true,
          notification: data,
          message: response.data.message,
        };
      }

      return { success: false, error: 'Failed to send test notification' };
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error('❌ Send test notification error:', errorInfo);
      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
      };
    }
  },

  /**
   * Get notification statistics
   * @returns {Promise<Object>} Notification statistics
   */
  getNotificationStats: async () => {
    try {
      console.log('📊 Fetching notification statistics');

      const response = await axiosInstance.get('/notifications/stats');

      if (isSuccess(response)) {
        const data = getResponseData(response);
        console.log('✅ Notification statistics fetched successfully');
        return {
          success: true,
          totalNotifications: data.totalNotifications,
          unreadNotifications: data.unreadNotifications,
          typeBreakdown: data.typeBreakdown,
          recentActivity: data.recentActivity,
          preferences: data.preferences,
        };
      }

      return { success: false, error: 'Failed to fetch notification statistics' };
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error('❌ Get notification stats error:', errorInfo);
      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
      };
    }
  },

  /**
   * Clear all notifications
   * @returns {Promise<Object>} Clear notifications response
   */
  clearAllNotifications: async () => {
    try {
      console.log('🗑️ Clearing all notifications');

      const response = await axiosInstance.delete('/notifications/clear');

      if (isSuccess(response)) {
        const data = getResponseData(response);
        console.log('✅ All notifications cleared successfully');
        return {
          success: true,
          clearedCount: data.clearedCount,
          message: response.data.message,
        };
      }

      return { success: false, error: 'Failed to clear notifications' };
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error('❌ Clear notifications error:', errorInfo);
      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
      };
    }
  },

  /**
   * Get unread notifications count
   * @returns {Promise<Object>} Unread notifications count
   */
  getUnreadCount: async () => {
    try {
      console.log('🔢 Getting unread notifications count');

      const response = await axiosInstance.get('/notifications/history', {
        params: { unreadOnly: true, limit: 1 }
      });

      if (isSuccess(response)) {
        const data = getResponseData(response);
        console.log('✅ Unread count fetched successfully');
        return {
          success: true,
          unreadCount: data.unreadCount,
        };
      }

      return { success: false, error: 'Failed to get unread count' };
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error('❌ Get unread count error:', errorInfo);
      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
      };
    }
  },

  /**
   * Update daily reminder settings
   * @param {boolean} enabled - Whether daily reminders are enabled
   * @param {string} time - Reminder time in HH:MM format
   * @returns {Promise<Object>} Update response
   */
  updateDailyReminder: async (enabled, time) => {
    try {
      console.log('⏰ Updating daily reminder settings');

      const preferences = {
        dailyReminder: {
          enabled,
          time,
        },
      };

      return await notificationApi.updateNotificationPreferences(preferences);
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error('❌ Update daily reminder error:', errorInfo);
      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
      };
    }
  },

  /**
   * Update milestone notification settings
   * @param {boolean} enabled - Whether milestone notifications are enabled
   * @returns {Promise<Object>} Update response
   */
  updateMilestoneNotifications: async (enabled) => {
    try {
      console.log('🏆 Updating milestone notification settings');

      const preferences = {
        milestoneNotifications: {
          enabled,
        },
      };

      return await notificationApi.updateNotificationPreferences(preferences);
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error('❌ Update milestone notifications error:', errorInfo);
      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
      };
    }
  },

  /**
   * Update achievement notification settings
   * @param {boolean} enabled - Whether achievement notifications are enabled
   * @returns {Promise<Object>} Update response
   */
  updateAchievementNotifications: async (enabled) => {
    try {
      console.log('🎯 Updating achievement notification settings');

      const preferences = {
        achievementNotifications: {
          enabled,
          personalBests: { enabled },
          newRecords: { enabled },
        },
      };

      return await notificationApi.updateNotificationPreferences(preferences);
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error('❌ Update achievement notifications error:', errorInfo);
      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
      };
    }
  },

  /**
   * Get recent notifications (last 10)
   * @returns {Promise<Object>} Recent notifications
   */
  getRecentNotifications: async () => {
    try {
      console.log('🕐 Getting recent notifications');

      return await notificationApi.getNotificationHistory({ limit: 10 });
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error('❌ Get recent notifications error:', errorInfo);
      return {
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
      };
    }
  },
};

export default notificationApi;

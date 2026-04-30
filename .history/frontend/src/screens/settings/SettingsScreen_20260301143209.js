import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import notificationApi from '../../api/notificationApi';
import authApi from '../../api/authApi';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { user, logout, changePassword, deleteAccount } = useAuth();
  
  // Notification preferences state
  const [notificationPreferences, setNotificationPreferences] = useState({
    dailyReminder: { enabled: true, time: '09:00' },
    milestoneNotifications: { enabled: true },
    achievementNotifications: { enabled: true },
    pushNotifications: { enabled: true },
    emailNotifications: { enabled: true },
  });

  // Profile update state
  const [profileData, setProfileData] = useState({
    name: '',
    goal: 'general_fitness',
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState('09:00');

  // API hooks
  const { execute: updateNotifications } = useApi(notificationApi.updateNotificationPreferences);
  const { execute: updateProfile } = useApi(authApi.updateProfile);
  const { execute: changePasswordApi } = useApi(authApi.changePassword);

  // Initialize data
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        goal: user.goal || 'general_fitness',
      });
    }
    fetchNotificationPreferences();
  }, [user]);

  /**
   * Fetch notification preferences
   */
  const fetchNotificationPreferences = async () => {
    try {
      const result = await notificationApi.getNotificationPreferences();
      if (result.success) {
        setNotificationPreferences(result.preferences);
      }
    } catch (error) {
      console.error('❌ Failed to fetch notification preferences:', error);
    }
  };

  /**
   * Update notification preferences
   */
  const handleNotificationUpdate = async (key, value) => {
    const updatedPreferences = {
      ...notificationPreferences,
      [key]: value,
    };

    setNotificationPreferences(updatedPreferences);

    const result = await updateNotifications(updatedPreferences);
    if (!result.success) {
      Alert.alert('Error', result.error || 'Failed to update notification preferences');
      // Revert on error
      setNotificationPreferences(notificationPreferences);
    }
  };

  /**
   * Update daily reminder time
   */
  const handleTimeUpdate = async (time) => {
    const updatedPreferences = {
      ...notificationPreferences,
      dailyReminder: {
        ...notificationPreferences.dailyReminder,
        time,
      },
    };

    setNotificationPreferences(updatedPreferences);
    setSelectedTime(time);
    setShowTimePicker(false);

    const result = await updateNotifications(updatedPreferences);
    if (!result.success) {
      Alert.alert('Error', result.error || 'Failed to update reminder time');
    }
  };

  /**
   * Update user profile
   */
  const handleProfileUpdate = async () => {
    if (!profileData.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    setLoading(true);
    const result = await updateProfile(profileData);
    setLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Profile updated successfully');
    } else {
      Alert.alert('Error', result.error || 'Failed to update profile');
    }
  };

  /**
   * Handle password change
   */
  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await changePasswordApi({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
    setLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Password changed successfully');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      Alert.alert('Error', result.error || 'Failed to change password');
    }
  };

  /**
   * Handle logout
   */
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            // Navigation will be handled by AuthContext
          },
        },
      ]
    );
  };

  /**
   * Handle account deletion
   */
  const handleDeleteAccount = async () => {
    const result = await deleteAccount();
    if (result.success) {
      // Navigation will be handled by AuthContext
    } else {
      Alert.alert('Error', result.error || 'Failed to delete account');
    }
  };

  /**
   * Render setting item
   */
  const renderSettingItem = (title, subtitle, onPress, rightComponent = null) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightComponent || <Text style={styles.settingArrow}>›</Text>}
    </TouchableOpacity>
  );

  /**
   * Render toggle setting
   */
  const renderToggleSetting = (title, subtitle, value, onToggle) => (
    <View style={styles.settingItem}>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#e5e7eb', true: '#dbeafe' }}
        thumbColor={value ? '#3b82f6' : '#f3f4f6'}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your account and preferences</Text>
      </View>

      {/* Profile Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        
        <View style={styles.profileInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(profileData.name || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.profileDetails}>
            <Text style={styles.profileName}>{user?.name || 'User'}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>
            <Text style={styles.profileStatus}>
              {user?.subscriptionStatus === 'PREMIUM' ? '⭐ Premium' : 'Free Plan'}
            </Text>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Name</Text>
          <TextInput
            style={styles.input}
            value={profileData.name}
            onChangeText={(value) => setProfileData(prev => ({ ...prev, name: value }))}
            placeholder="Enter your name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Fitness Goal</Text>
          <TouchableOpacity
            style={styles.goalSelector}
            onPress={() => {
              Alert.alert(
                'Select Goal',
                'Choose your fitness goal',
                [
                  { text: 'Weight Loss', onPress: () => setProfileData(prev => ({ ...prev, goal: 'weight_loss' })) },
                  { text: 'Muscle Gain', onPress: () => setProfileData(prev => ({ ...prev, goal: 'muscle_gain' })) },
                  { text: 'Endurance', onPress: () => setProfileData(prev => ({ ...prev, goal: 'endurance' })) },
                  { text: 'General Fitness', onPress: () => setProfileData(prev => ({ ...prev, goal: 'general_fitness' })) },
                ]
              );
            }}
          >
            <Text style={styles.goalText}>
              {profileData.goal === 'weight_loss' ? 'Weight Loss 🏃‍♂️' :
               profileData.goal === 'muscle_gain' ? 'Muscle Gain 💪' :
               profileData.goal === 'endurance' ? 'Endurance 🚴‍♀️' :
               'General Fitness ⭐'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleProfileUpdate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Update Profile</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        {renderToggleSetting(
          'Daily Workout Reminders',
          'Get reminded to work out every day',
          notificationPreferences.dailyReminder.enabled,
          (value) => handleNotificationUpdate('dailyReminder', { ...notificationPreferences.dailyReminder, enabled: value })
        )}

        {notificationPreferences.dailyReminder.enabled && (
          <TouchableOpacity
            style={styles.timeSelector}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.timeLabel}>Reminder Time</Text>
            <Text style={styles.timeValue}>{notificationPreferences.dailyReminder.time}</Text>
          </TouchableOpacity>
        )}

        {renderToggleSetting(
          'Milestone Notifications',
          'Celebrate your fitness achievements',
          notificationPreferences.milestoneNotifications.enabled,
          (value) => handleNotificationUpdate('milestoneNotifications', { enabled: value })
        )}

        {renderToggleSetting(
          'Achievement Notifications',
          'Get notified about personal bests',
          notificationPreferences.achievementNotifications.enabled,
          (value) => handleNotificationUpdate('achievementNotifications', { enabled: value })
        )}

        {renderToggleSetting(
          'Push Notifications',
          'Receive notifications on your device',
          notificationPreferences.pushNotifications.enabled,
          (value) => handleNotificationUpdate('pushNotifications', { enabled: value })
        )}

        {renderToggleSetting(
          'Email Notifications',
          'Receive updates via email',
          notificationPreferences.emailNotifications.enabled,
          (value) => handleNotificationUpdate('emailNotifications', { enabled: value })
        )}
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        {renderSettingItem(
          'Change Password',
          'Update your account password',
          () => setShowPasswordModal(true)
        )}

        {renderSettingItem(
          'Privacy Policy',
          'Read our privacy policy',
          () => Alert.alert('Privacy Policy', 'Privacy policy will open in web view')
        )}

        {renderSettingItem(
          'Terms of Service',
          'Read our terms of service',
          () => Alert.alert('Terms of Service', 'Terms of service will open in web view')
        )}

        {renderSettingItem(
          'About',
          'AuraFit v1.0.0',
          () => Alert.alert('About', 'AuraFit - Transform Your Fitness Journey\n\nVersion 1.0.0\n\n© 2024 AuraFit')
        )}
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Danger Zone</Text>
        
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleLogout}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>Logout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={handleDeleteAccount}
        >
          <Text style={styles.dangerButtonText}>Delete Account</Text>
        </TouchableOpacity>
      </View>

      {/* Password Change Modal */}
      <Modal
        visible={showPasswordModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Change Password</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <TextInput
                style={styles.input}
                value={passwordData.currentPassword}
                onChangeText={(value) => setPasswordData(prev => ({ ...prev, currentPassword: value }))}
                placeholder="Enter current password"
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>New Password</Text>
              <TextInput
                style={styles.input}
                value={passwordData.newPassword}
                onChangeText={(value) => setPasswordData(prev => ({ ...prev, newPassword: value }))}
                placeholder="Enter new password"
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <TextInput
                style={styles.input}
                value={passwordData.confirmPassword}
                onChangeText={(value) => setPasswordData(prev => ({ ...prev, confirmPassword: value }))}
                placeholder="Confirm new password"
                secureTextEntry
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => {
                  setShowPasswordModal(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
              >
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handlePasswordChange}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Change Password</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Time Picker Modal */}
      <Modal
        visible={showTimePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Set Reminder Time</Text>
            
            <View style={styles.timeOptions}>
              {['06:00', '08:00', '09:00', '12:00', '18:00', '20:00'].map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeOption,
                    selectedTime === time && styles.timeOptionSelected,
                  ]}
                  onPress={() => handleTimeUpdate(time)}
                >
                  <Text style={[
                    styles.timeOptionText,
                    selectedTime === time && styles.timeOptionTextSelected,
                  ]}>
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => setShowTimePicker(false)}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  profileEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  profileStatus: {
    fontSize: 12,
    color: '#3b82f6',
    marginTop: 4,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    color: '#1f2937',
  },
  goalSelector: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f9fafb',
  },
  goalText: {
    fontSize: 16,
    color: '#1f2937',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  dangerButton: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButtonText: {
    color: '#374151',
  },
  dangerButtonText: {
    color: '#fff',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  settingArrow: {
    fontSize: 20,
    color: '#9ca3af',
  },
  timeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingLeft: 0,
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  timeValue: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  timeOptions: {
    gap: 8,
    marginBottom: 20,
  },
  timeOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  timeOptionSelected: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  timeOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  timeOptionTextSelected: {
    color: '#3b82f6',
    fontWeight: '500',
  },
});

export default SettingsScreen;

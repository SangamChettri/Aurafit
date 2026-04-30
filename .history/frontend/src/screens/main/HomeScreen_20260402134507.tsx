import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import Icon from 'react-native-vector-icons/MaterialIcons';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Array<{id: string, message: string, type: 'success' | 'info' | 'warning' | 'error', timestamp: Date}>>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const addNotification = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const newNotification = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date()
    };
    
    setNotifications(prev => [newNotification, ...prev].slice(0, 10));
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <View style={styles.container}>
      {/* Notification Bell */}
      <View style={styles.notificationContainer}>
        <TouchableOpacity
          style={styles.notificationBell}
          onPress={() => setShowNotifications(!showNotifications)}
        >
          <Ionicons name="notifications" size={24} color="#f59e0b" />
          {notifications.length > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>{notifications.length}</Text>
            </View>
          )}
        </TouchableOpacity>
        
        {/* Notification Dropdown */}
        {showNotifications && (
          <View style={styles.notificationDropdown}>
            <View style={styles.notificationHeader}>
              <Text style={styles.notificationTitle}>Notifications</Text>
              <TouchableOpacity
                style={styles.clearNotificationsButton}
                onPress={() => setNotifications([])}
              >
                <Ionicons name="close-circle" size={16} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.notificationList} nestedScrollEnabled={false}>
              {notifications.length === 0 ? (
                <View style={styles.noNotifications}>
                  <Ionicons name="notifications-outline" size={32} color="#9ca3af" />
                  <Text style={styles.noNotificationsText}>No notifications</Text>
                </View>
              ) : (
                notifications.map(notification => (
                  <View key={notification.id} style={styles.notificationItem}>
                    <View style={[
                      styles.notificationIcon,
                      {
                        backgroundColor: 
                          notification.type === 'success' ? '#10b981' :
                          notification.type === 'error' ? '#ef4444' :
                          notification.type === 'warning' ? '#f59e0b' : '#3b82f6'
                      }
                    ]}>
                      <Ionicons 
                        name={
                          notification.type === 'success' ? 'checkmark-circle' :
                          notification.type === 'error' ? 'close-circle' :
                          notification.type === 'warning' ? 'warning' : 'information-circle'
                        } 
                        size={16} 
                        color="#fff" 
                      />
                    </View>
                    <View style={styles.notificationContent}>
                      <Text style={styles.notificationMessage}>{notification.message}</Text>
                      <Text style={styles.notificationTime}>
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.removeNotificationButton}
                      onPress={() => removeNotification(notification.id)}
                    >
                      <Ionicons name="close" size={16} color="#9ca3af" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        )}
      </View>

      <ScrollView style={styles.form}>
        <StatusBar barStyle="light-content" backgroundColor="#1e293b" />
        
        <View style={styles.header}>
          <View style={styles.brandContainer}>
            <View style={styles.logoContainer}>
              <Ionicons name="fitness-center" size={32} color="#f59e0b" />
              <Text style={styles.brandName}>AuraFit</Text>
            </View>
            <Text style={styles.brandTagline}>Transform Your Fitness Journey</Text>
          </View>
          
          <View style={styles.welcomeContainer}>
            <Text style={styles.greeting}>
              Welcome back, {user?.firstName || 'User'}!
            </Text>
            <View style={styles.subscriptionBadge}>
              <Ionicons 
                name={user?.subscriptionStatus === 'PREMIUM' ? 'star' : 'lock-open'} 
                size={16} 
                color={user?.subscriptionStatus === 'PREMIUM' ? '#f59e0b' : '#64748b'} 
              />
              <Text style={[
                styles.subtitle, 
                { color: user?.subscriptionStatus === 'PREMIUM' ? '#f59e0b' : '#64748b' }
              ]}>
                {user?.subscriptionStatus === 'PREMIUM' ? 'Premium Member' : 'Free Plan'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Workouts' as never)}
          >
            <Ionicons name="fitness-center" size={32} color="#0ea5e9" />
            <Text style={styles.actionText}>Log Workout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Profile' as never)}
          >
            <Ionicons name="trending-up" size={32} color="#0ea5e9" />
            <Text style={styles.actionText}>Track Progress</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Profile' as never)}
          >
            <Ionicons name="flag" size={32} color="#0ea5e9" />
            <Text style={styles.actionText}>Set Goals</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.stats}>
          <Text style={styles.sectionTitle}>Today's Summary</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: '#fee2e2' }]}>
                <Ionicons name="flame" size={20} color="#ef4444" />
              </View>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: '#dbeafe' }]}>
                <Ionicons name="time" size={20} color="#3b82f6" />
              </View>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Minutes</Text>
            </View>
          </View>
        </View>

        <View style={styles.motivationSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bulb" size={20} color="#1e293b" />
            <Text style={styles.sectionTitle}>Daily Inspiration</Text>
          </View>
          <View style={styles.motivationCard}>
            <View style={styles.motivationIconContainer}>
              <Ionicons name="psychology" size={28} color="#f59e0b" />
            </View>
            <View style={styles.motivationContent}>
              <Text style={styles.motivationTitle}>Stay Motivated</Text>
              <Text style={styles.motivationText}>
                Consistency is key! Even a 15-minute workout can make a difference in your fitness journey.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    marginBottom: 24,
    backgroundColor: '#1e293b',
  },
  brandContainer: {
    marginBottom: 32,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 12,
  },
  brandTagline: {
    fontSize: 16,
    color: '#cbd5e1',
    marginLeft: 44,
  },
  welcomeContainer: {
    marginLeft: 44,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subscriptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: '31%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 4,
  },
  actionSubtext: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  stats: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: '31%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  motivationSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  motivationCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  motivationIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  motivationContent: {
    flex: 1,
  },
  motivationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 6,
  },
  motivationText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    flex: 1,
  },
  // Notification styles
  notificationContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
  },
  notificationBell: {
    position: 'relative',
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  notificationDropdown: {
    position: 'absolute',
    top: 60,
    right: 0,
    width: 320,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    maxHeight: 400,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  clearNotificationsButton: {
    padding: 4,
  },
  notificationList: {
    maxHeight: 300,
  },
  noNotifications: {
    padding: 40,
    alignItems: 'center',
  },
  noNotificationsText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  notificationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#1f2937',
    marginBottom: 2,
  },
  notificationTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  removeNotificationButton: {
    padding: 4,
  },
});

export default HomeScreen;

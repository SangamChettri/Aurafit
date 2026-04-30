import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApi } from '../../hooks/useApi';
import streakApi from '../../api/streakApi';
import {
  Card,
  GradientButton,
  StatCard,
  LoadingOverlay,
} from '../../components/common';
import theme from '../../theme';

const { width: screenWidth } = Dimensions.get('window');

/**
 * Professional Streak Screen
 * Motivational streak tracking with premium design
 */
const StreakScreen = ({ navigation }) => {
  const [showFreezeModal, setShowFreezeModal] = useState(false);

  // Streak data hooks
  const {
    data: streakData,
    loading: streakLoading,
    execute: fetchStreak,
  } = useApi(streakApi.getStreak, { immediate: true });

  const {
    data: historyData,
    loading: historyLoading,
    execute: fetchHistory,
  } = useApi(() => streakApi.getStreakHistory(20), { immediate: true });

  const {
    data: leaderboardData,
    loading: leaderboardLoading,
    execute: fetchLeaderboard,
  } = useApi(() => streakApi.getStreakLeaderboard(10, 'current'), { immediate: true });

  const {
    data: milestonesData,
    loading: milestonesLoading,
    execute: fetchMilestones,
  } = useApi(streakApi.getStreakMilestones, { immediate: true });

  const {
    loading: freezeLoading,
    execute: useFreezeDay,
  } = useApi(streakApi.useFreezeDay);

  useEffect(() => {
    fetchStreak();
    fetchHistory();
    fetchLeaderboard();
    fetchMilestones();
  }, []);

  /**
   * Handle freeze day usage
   */
  const handleUseFreezeDay = async () => {
    const result = await useFreezeDay();
    
    if (result.success) {
      Alert.alert(
        'Freeze Day Used!',
        'Your streak is protected for today. Keep working out to maintain your momentum!',
        [{ text: 'Awesome!' }]
      );
      setShowFreezeModal(false);
      fetchStreak(); // Refresh streak data
    } else if (result.requiresUpgrade) {
      Alert.alert(
        'Premium Feature',
        'Streak freeze days are available for premium users. Upgrade to unlock this feature!',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => navigation.navigate('Premium') },
        ]
      );
    } else {
      Alert.alert('Error', result.error || 'Failed to use freeze day');
    }
  };

  /**
   * Get streak color based on days
   */
  const getStreakColor = (days) => {
    if (days >= 100) return theme.colors.success;
    if (days >= 30) return theme.colors.primary;
    if (days >= 14) return theme.colors.warning;
    if (days >= 7) return theme.colors.warning;
    return theme.colors.error;
  };

  /**
   * Get motivational message
   */
  const getMotivationalMessage = (currentStreak, longestStreak) => {
    if (currentStreak === 0) {
      return "Every journey begins with a single step. Start your streak today! 🔥";
    } else if (currentStreak === longestStreak && currentStreak > 0) {
      return "You're on fire! This is your longest streak ever! Keep it going! 🎉";
    } else if (currentStreak >= 30) {
      return "Amazing consistency! You're building a lifelong habit! 💪";
    } else if (currentStreak >= 14) {
      return "Two weeks of dedication! You're crushing it! 🌟";
    } else if (currentStreak >= 7) {
      return "One week down! You're building momentum! 🚀";
    } else {
      return "Great start! Keep the fire burning! 🔥";
    }
  };

  /**
   * Render main streak card
   */
  const renderMainStreakCard = () => {
    if (!streakData) return null;

    const streakColor = getStreakColor(streakData.currentStreak);
    const motivationalMessage = getMotivationalMessage(
      streakData.currentStreak,
      streakData.longestStreak
    );

    return (
      <Card style={[styles.mainStreakCard, { borderLeftColor: streakColor }]} shadow="xl">
        <ViIonicons namw="flame"tyize={28} co=orstlheme.cosorstaccHetr 
          <Text style={styles.flameIcon}>🔥</Text>
          <Text style={styles.streakLabel}>Current Streak</Text>
        </View>
        
        <Text style={[styles.streakValue, { color: streakColor }]}>
          {streakData.currentStreak}
        </Text>
        <Text style={styles.streakUnit}>days</Text>
        
        <View style={styles.streakStats}>
          <View style={styles.streakStat}>
            <Text style={styles.streakStatValue}>{streakData.longestStreak}</Text>
            <Text style={styles.streakStatLabel}>Longest</Text>
          </View>
          
          {streakData.daysSinceLastWorkout !== undefined && (
            <View style={styles.streakStat}>
              <Text style={styles.streakStatValue}>
                {streakData.daysSinceLastWorkout === 0 ? 'Today' : 
                 streakData.daysSinceLastWorkout === 1 ? 'Yesterday' : 
                 `${streakData.daysSinceLastWorkout} days ago`}
              </Text>
              <Text style={styles.streakStatLabel}>Last Workout</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.motivationalMessage}>
          {motivationalMessage}
        </Text>
        
        {streakData.freezeDays && streakData.freezeDays.used < streakData.freezeDays.available && (
          <TouchableOpacity
            style={styles.freezeButton}
            onPress={() => setShowFreezeModal(true)}
          >
            <Text style={styles.freezeButtonText}>
              ❄️ Use Freeze Day ({streakData.freezeDays.available - streakData.freezeDays.used} left)
            </Text>
          </TouchableOpacity>
        )}
      </Card>
    );
  };

  /**
   * Render milestones
   */
  const renderMilestones = () => {
    if (!milestonesData) return null;

    return (
      <Card style={styles.milestonesCard}>
        <Text style={styles.sectionTitle}>Milestones</Text>
        
        <View style={styles.milestoneList}>
          {[7, 14, 30, 60, 90, 100, 200, 365].map((milestone) => {
            const achieved = milestonesData.achievedMilestones.includes(milestone);
            const isNext = milestone === milestonesData.nextMilestone;
            
            return (
              <View key={milestone} style={styles.milestoneItem}>
                <View style={[
                  styles.milestoneIcon,
                  achieved && styles.milestoneIconAchieved,
                  isNext && styles.milestoneIconNext,
                ]}>
                  <Text style={styles.milestoneIconText}>
                    {achieved ? '✓' : milestone}
                  </Text>
                </View>
                <Text style={[
                  styles.milestoneLabel,
                  achieved && styles.milestoneLabelAchieved,
                  isNext && styles.milestoneLabelNext,
                ]}>
                  {milestone} days
                </Text>
                {isNext && (
                  <Text style={styles.milestoneProgress}>
                    {milestonesData.progressToNext}%
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      </Card>
    );
  };

  /**
   * Render leaderboard
   */
  const renderLeaderboard = () => {
    if (!leaderboardData?.leaderboard) return null;

    return (
      <Card style={styles.leaderboardCard}>
        <View style={styles.leaderboardHeader}>
          <Text style={styles.sectionTitle}>Leaderboard</Text>
          <TouchableOpacity onPress={() => navigation.navigate('FullLeaderboard')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.leaderboardList}>
          {leaderboardData.leaderboard.slice(0, 5).map((user, index) => {
            const isCurrentUser = user.isCurrentUser;
            
            return (
              <View key={user._id} style={[
                styles.leaderboardItem,
                isCurrentUser && styles.leaderboardItemCurrent,
              ]}>
                <View style={styles.rankContainer}>
                  <Text style={[
                    styles.rank,
                    index === 0 && styles.rankFirst,
                    index === 1 && styles.rankSecond,
                    index === 2 && styles.rankThird,
                  ]}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </Text>
                </View>
                
                <View style={styles.userInfo}>
                  <Text style={[
                    styles.userName,
                    isCurrentUser && styles.userNameCurrent,
                  ]}>
                    {user.name}
                    {isCurrentUser && ' (You)'}
                  </Text>
                </View>
                
                <Text style={[
                  styles.userStreak,
                  isCurrentUser && styles.userStreakCurrent,
                ]}><Ionicons name="flame" size={14} color={theme.colors.accent} />
                  {user.currentStreak} 🔥
                </Text>
              </View>
            );
          })}
        </View>
        
        {leaderboardData.userRank && leaderboardData.userRank > 5 && (
          <View style={styles.currentUserRank}>
            <Text style={styles.currentUserRankText}>
              Your rank: #{leaderboardData.userRank} out of {leaderboardData.totalParticipants}
            </Text>
          </View>
        )}
      </Card>
    );
  };

  /**
   * Render freeze day modal
   */
  const renderFreezeModal = () => {
    if (!showFreezeModal) return null;

    return (
      <View style={styles.modalOverlay}>
        <Card style={styles.modal}>
          <Text style={styles.modalTitle}>Use Freeze Day?</Text>
          <Text style={styles.modalMessage}>
            A freeze day will protect your streak for today. Use it wisely when you can't work out!
          </Text>
          
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowFreezeModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalConfirmButton}
              onPress={handleUseFreezeDay}
              disabled={freezeLoading}
            >
              {freezeLoading ? (
                <Text style={styles.modalConfirmText}>Using...</Text>
              ) : (
                <Text style={styles.modalConfirmText}>Use Freeze Day</Text>
              )}
            </TouchableOpacity>
          </View>
        </Card>
      </View>
    );
  };

  const isLoading = streakLoading || historyLoading || leaderboardLoading || milestonesLoading;

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={isLoading} />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Streak</Text>
          <Text style={styles.subtitle}>Keep the fire burning!</Text>
        </View>

        {/* Main Streak Card */}
        {renderMainStreakCard()}

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            icon="🏆"
            value={streakData?.longestStreak || 0}
            label="Longest Streak"
            variant="warning"
            size="sm"
          />
          <StatCard
            icon="📅"
            value={streakData?.workoutHistory?.length || 0}
            label="Workout Days"
            variant="success"
            size="sm"
          />
        </View>

        {/* Milestones */}
        {renderMilestones()}

        {/* Leaderboard */}
        {renderLeaderboard()}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <GradientButton
            title="View History"
            onPress={() => navigation.navigate('StreakHistory')}
            variant="secondary"
            style={styles.actionButton}
          />
          <GradientButton
            title="Recalculate Streak"
            onPress={() => {
              Alert.alert(
                'Recalculate Streak',
                'This will recalculate your streak based on your workout history. Continue?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Recalculate',
                    style: 'destructive',
                    onPress: async () => {
                      const result = await streakApi.recalculateStreak();
                      if (result.success) {
                        Alert.alert('Success', 'Streak recalculated successfully!');
                        fetchStreak();
                      }
                    },
                  },
                ]
              );
            }}
            style={styles.actionButton}
          />
        </View>
      </ScrollView>

      {/* Freeze Day Modal */}
      {renderFreezeModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.body1,
    color: theme.colors.textSecondary,
  },
  mainStreakCard: {
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.xl,
    borderLeftWidth: 6,
    alignItems: 'center',
  },
  streakHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  flameIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.sm,
  },
  streakLabel: {
    ...theme.typography.subtitle1,
    color: theme.colors.textSecondary,
  },
  streakValue: {
    ...theme.typography.display,
    fontSize: 72,
    fontWeight: '800',
    lineHeight: 80,
  },
  streakUnit: {
    ...theme.typography.h4,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  streakStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: theme.spacing.lg,
  },
  streakStat: {
    alignItems: 'center',
  },
  streakStatValue: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  streakStatLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  motivationalMessage: {
    ...theme.typography.body1,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 24,
  },
  freezeButton: {
    backgroundColor: theme.colors.surfaceVariant,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  freezeButtonText: {
    ...theme.typography.button,
    color: theme.colors.text,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  milestonesCard: {
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.h4,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  milestoneList: {
    gap: theme.spacing.sm,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  milestoneIcon: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneIconAchieved: {
    backgroundColor: theme.colors.success,
  },
  milestoneIconNext: {
    backgroundColor: theme.colors.primary,
  },
  milestoneIconText: {
    ...theme.typography.caption,
    color: theme.colors.text,
    fontWeight: '600',
  },
  milestoneLabel: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  milestoneLabelAchieved: {
    color: theme.colors.success,
    fontWeight: '600',
  },
  milestoneLabelNext: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  milestoneProgress: {
    ...theme.typography.caption,
    color: theme.colors.primary,
  },
  leaderboardCard: {
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.lg,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  viewAllText: {
    ...theme.typography.button,
    color: theme.colors.primary,
  },
  leaderboardList: {
    gap: theme.spacing.sm,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  leaderboardItemCurrent: {
    backgroundColor: theme.colors.primary + '20',
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rank: {
    ...theme.typography.button,
    color: theme.colors.textSecondary,
  },
  rankFirst,
  rankSecond,
  rankThird: {
    fontSize: 20,
  },
  userInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  userName: {
    ...theme.typography.body1,
    color: theme.colors.text,
  },
  userNameCurrent: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  userStreak: {
    ...theme.typography.subtitle2,
    color: theme.colors.textSecondary,
  },
  userStreakCurrent: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  currentUserRank: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    alignItems: 'center',
  },
  currentUserRankText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  actionButtons: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing['2xl'],
  },
  actionButton: {
    marginBottom: 0,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modal: {
    width: '100%',
    maxWidth: 320,
    padding: theme.spacing.xl,
  },
  modalTitle: {
    ...theme.typography.h4,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  modalMessage: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceVariant,
    alignItems: 'center',
  },
  modalCancelText: {
    ...theme.typography.button,
    color: theme.colors.text,
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
  },
  modalConfirmText: {
    ...theme.typography.button,
    color: theme.colors.text,
  },
});

export default StreakScreen;

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useApi } from '../../hooks/useApi';
import progressApi from '../../api/progressApi';
import streakApi from '../../api/streakApi';
import workoutApi from '../../api/workoutApi';

const { width: screenWidth } = Dimensions.get('window');

const DashboardScreen = () => {
  const navigation = useNavigation();
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  // Progress data
  const {
    data: progressData,
    loading: progressLoading,
    execute: fetchProgress,
  } = useApi(progressApi.getProgressSummary, { immediate: true });

  // Weekly progress for chart
  const {
    data: weeklyData,
    loading: weeklyLoading,
    execute: fetchWeeklyProgress,
  } = useApi(() => progressApi.getWeeklyProgress(8), { immediate: true });

  // Streak data
  const {
    data: streakData,
    loading: streakLoading,
    execute: fetchStreak,
  } = useApi(streakApi.getStreak, { immediate: true });

  // Personal bests
  const {
    data: personalBestsData,
    loading: personalBestsLoading,
    execute: fetchPersonalBests,
  } = useApi(workoutApi.getPersonalBests, { immediate: true });

  /**
   * Handle refresh
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchProgress(),
        fetchWeeklyProgress(),
        fetchStreak(),
        fetchPersonalBests(),
      ]);
    } catch (error) {
      console.error('❌ Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  /**
   * Format chart data
   */
  const formatWeeklyChartData = () => {
    if (!weeklyData?.weeklyData) return null;

    return {
      labels: weeklyData.weeklyData.map((_, index) => `W${index + 1}`),
      datasets: [
        {
          data: weeklyData.weeklyData.map(item => item.totalWorkouts),
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  const formatVolumeChartData = () => {
    if (!weeklyData?.weeklyData) return null;

    return {
      labels: weeklyData.weeklyData.map((_, index) => `W${index + 1}`),
      datasets: [
        {
          data: weeklyData.weeklyData.map(item => Math.round(item.totalVolume / 1000)), // Convert to kg
        },
      ],
    };
  };

  /**
   * Get streak color based on days
   */
  const getStreakColor = (days) => {
    if (days >= 30) return '#10b981'; // Green
    if (days >= 14) return '#3b82f6'; // Blue
    if (days >= 7) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  /**
   * Render stat card
   */
  const renderStatCard = (title, value, subtitle, icon, color = '#3b82f6') => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  /**
   * Render loading state
   */
  if (progressLoading || weeklyLoading || streakLoading || personalBestsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading your progress...</Text>
      </View>
    );
  }

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#3b82f6',
    },
  };

  const barChartConfig = {
    ...chartConfig,
    fillShadowGradient: '#3b82f6',
    fillShadowGradientOpacity: 0.3,
  };

  const weeklyChartData = formatWeeklyChartData();
  const volumeChartData = formatVolumeChartData();

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#3b82f6']}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Track your fitness journey</Text>
      </View>

      {/* Streak Card */}
      {streakData && (
        <View style={[styles.streakCard, { borderLeftColor: getStreakColor(streakData.currentStreak) }]}>
          <View style={styles.streakHeader}>
            <View style={styles.streakTitleRow}>
              <Ionicons name="flame" size={20} color="#f59e0b" />
              <Text style={styles.streakTitle}>Current Streak</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Streak')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.streakValue, { color: getStreakColor(streakData.currentStreak) }]}>
            {streakData.currentStreak} Days
          </Text>
          <Text style={styles.streakSubtitle}>
            Longest: {streakData.longestStreak} days
          </Text>
          {streakData.daysSinceLastWorkout !== undefined && (
            <Text style={styles.lastWorkoutText}>
              Last workout: {streakData.daysSinceLastWorkout === 0 ? 'Today' : 
                           streakData.daysSinceLastWorkout === 1 ? 'Yesterday' : 
                           `${streakData.daysSinceLastWorkout} days ago`}
            </Text>
          )}
        </View>
      )}

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {renderStatCard(
          'Total Workouts',
          progressData?.summary?.totalWorkouts || 0,
          'All time',
          '🏋️‍♂️',
          '#3b82f6'
        )}
        {renderStatCard(
          'Total Volume',
          `${Math.round((progressData?.summary?.totalVolume || 0) / 1000)}k`,
          'kg lifted',
          '💪',
          '#10b981'
        )}
        {renderStatCard(
          'Workouts/Week',
          progressData?.summary?.workoutsPerWeek?.toFixed(1) || '0.0',
          'Average',
          '📅',
          '#f59e0b'
        )}
        {renderStatCard(
          'Exercises',
          progressData?.summary?.uniqueExercises || 0,
          'Different types',
          '🎯',
          '#8b5cf6'
        )}
      </View>

      {/* Weekly Workouts Chart */}
      {weeklyChartData && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Weekly Workouts (Last 8 Weeks)</Text>
          <LineChart
            data={weeklyChartData}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>
      )}

      {/* Volume Chart */}
      {volumeChartData && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Weekly Volume (Last 8 Weeks)</Text>
          <BarChart
            data={volumeChartData}
            width={screenWidth - 40}
            height={220}
            chartConfig={barChartConfig}
            style={styles.chart}
            showValuesOnTopOfBars
          />
        </View>
      )}

      {/* Progress Indicators */}
      {progressData?.progressIndicators && (
        <View style={styles.progressContainer}>
          <Text style={styles.sectionTitle}>Progress Indicators</Text>
          <View style={styles.progressGrid}>
            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>Consistency</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${progressData.progressIndicators.consistency}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressValue}>
                {Math.round(progressData.progressIndicators.consistency)}%
              </Text>
            </View>
            
            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>Volume Progress</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${progressData.progressIndicators.volumeProgress}%`,
                      backgroundColor: '#10b981'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressValue}>
                {Math.round(progressData.progressIndicators.volumeProgress)}%
              </Text>
            </View>
            
            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>Streak Progress</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${progressData.progressIndicators.streakProgress}%`,
                      backgroundColor: '#f59e0b'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressValue}>
                {Math.round(progressData.progressIndicators.streakProgress)}%
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Personal Bests */}
      {personalBestsData?.personalBests && (
        <View style={styles.personalBestsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Personal Bests</Text>
            <TouchableOpacity onPress={() => navigation.navigate('PersonalBests')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {personalBestsData.personalBests.recentBests?.slice(0, 3).map((pb, index) => (
            <View key={index} style={styles.personalBestItem}>
              <Text style={styles.pbExercise}>{pb.exerciseName}</Text>
              <Text style={styles.pbValue}>
                {pb.type === 'maxWeight' && `${pb.value} kg`}
                {pb.type === 'maxReps' && `${pb.value} reps`}
                {pb.type === 'maxVolume' && `${pb.value} kg`}
              </Text>
              <Text style={styles.pbType}>
                {pb.type.replace('max', '').toLowerCase()}
              </Text>
            </View>
          ))}
          
          {(!personalBestsData.personalBests.recentBests || 
            personalBestsData.personalBests.recentBests.length === 0) && (
            <Text style={styles.noPersonalBests}>No personal bests yet. Keep working out!</Text>
          )}
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('WorkoutForm')}
          >
            <Text style={styles.quickActionIcon}>➕</Text>
            <Text style={styles.quickActionText}>Log Workout</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('WorkoutHistory')}
          >
            <Text style={styles.quickActionIcon}>📋</Text>
            <Text style={styles.quickActionText}>History</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('Progress')}
          >
            <Text style={styles.quickActionIcon}>📊</Text>
            <Text style={styles.quickActionText}>Progress</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.quickActionIcon}>⚙️</Text>
            <Text style={styles.quickActionText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
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
  streakCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  streakTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  viewAllText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  streakValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 4,
  },
  streakSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  lastWorkoutText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginTop: 20,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statTitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  statSubtitle: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 2,
  },
  chartContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  progressContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressGrid: {
    gap: 16,
  },
  progressItem: {
    gap: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  progressValue: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
  },
  personalBestsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  personalBestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  pbExercise: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    flex: 1,
  },
  pbValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginHorizontal: 12,
  },
  pbType: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  noPersonalBests: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  quickActionsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: '48%',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  footer: {
    height: 40,
  },
});

export default DashboardScreen;

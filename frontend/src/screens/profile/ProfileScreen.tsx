import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import userApi from '../../api/userApi';
import axiosInstance from '../../api/axiosInstance';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import {
  LineChart,
  BarChart,
} from 'react-native-chart-kit';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, parseISO } from 'date-fns';

const { width } = Dimensions.get('window');
const PRIMARY_COLOR = '#0ea5e9';
const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const EMPTY_WEEKLY_WEIGHT_VALUES = [0, 0, 0, 0, 0, 0, 0];

const getWeeklyWeightIncrement = (maxValue: number) => {
  if (maxValue <= 500) {
    return 100;
  }

  if (maxValue <= 2000) {
    return 500;
  }

  if (maxValue <= 5000) {
    return 1000;
  }

  return 2000;
};

const getWeeklyWeightChartMax = (values: number[]) => {
  const maxValue = values.reduce((currentMax, value) => Math.max(currentMax, value), 0);
  const increment = getWeeklyWeightIncrement(maxValue);
  const roundedMax = maxValue > 0 ? Math.ceil(maxValue / increment) * increment : increment;
  const segmentStep = Math.max(increment, Math.ceil(roundedMax / 4 / increment) * increment);

  return segmentStep * 4;
};

const formatWeeklyWeightAxisLabel = (label: string) => {
  const value = Number(label);

  if (!Number.isFinite(value)) {
    return '0 kg';
  }

  if (value >= 1000) {
    const shortenedValue = Math.round((value / 1000) * 10) / 10;
    const formattedValue = Number.isInteger(shortenedValue)
      ? shortenedValue.toFixed(0)
      : shortenedValue.toFixed(1);

    return `${formattedValue}k kg`;
  }

  return `${Math.round(value)} kg`;
};

// Helper functions
const getInitials = (firstName?: string, lastName?: string) => {
  const first = firstName?.charAt(0) || '';
  const last = lastName?.charAt(0) || '';
  return (first + last).toUpperCase();
};

const splitName = (name?: string) => {
  const trimmedName = name?.trim() || '';

  if (!trimmedName) {
    return { firstName: '', lastName: '' };
  }

  const [firstName, ...rest] = trimmedName.split(/\s+/);
  return {
    firstName,
    lastName: rest.join(' '),
  };
};

const calculateBMI = (weight: number, height: number, weightUnit: string, heightUnit: string) => {
  let w = weight;
  let h = height;
  if (weightUnit === 'lbs') w = weight * 0.453592;
  if (heightUnit === 'ft') h = height * 30.48;
  const bmi = w / ((h / 100) ** 2);
  return parseFloat(bmi.toFixed(1));
};

const getBMICategory = (bmi: number) => {
  if (bmi < 18.5) return { label: 'Underweight', color: '#3b82f6' };
  if (bmi < 25) return { label: 'Normal', color: '#22c55e' };
  if (bmi < 30) return { label: 'Overweight', color: '#f59e0b' };
  return { label: 'Obese', color: '#ef4444' };
};

interface BodyMetrics {
  height: number;
  weight: number;
  bodyFat: number;
  muscleMass: number;
  heightUnit: 'cm' | 'ft';
  weightUnit: 'kg' | 'lbs';
}

interface WorkoutDay {
  date: string;
  workoutCount: number;
  totalDuration: number;
}

interface MonthlySummary {
  workoutsCount: number;
  totalVolumeKg: number;
}

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const fallbackName = splitName((user as any)?.name);
  const [activeTab, setActiveTab] = useState('stats');
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalWorkouts: 156,
    monthlyVolumeKg: 0,
    streakDays: 12,
    personalBestStreak: 21,
    joinedDate: new Date().toISOString(),
  });

  const [bodyMetrics, setBodyMetrics] = useState<BodyMetrics>({
    height: 175,
    weight: 70,
    bodyFat: 15,
    muscleMass: 60,
    heightUnit: 'cm',
    weightUnit: 'kg',
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: (user as any)?.firstName || fallbackName.firstName,
    lastName: (user as any)?.lastName || fallbackName.lastName,
    age: 25,
    gender: 'male' as 'male' | 'female' | 'other',
  });

  const [metricModal, setMetricModal] = useState({ visible: false, metric: '', value: '' });
  const [allMetricsModal, setAllMetricsModal] = useState(false);
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([]);
  const [weeklyWeightData, setWeeklyWeightData] = useState<{ day: string, totalWeight: number }[]>([]);
  const [weightDataError, setWeightDataError] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dateModal, setDateModal] = useState(false);
  const [viewedMonth, setViewedMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary>({
    workoutsCount: 0,
    totalVolumeKg: 0,
  });
  const [monthlySummaryLoading, setMonthlySummaryLoading] = useState(true);
  const monthlySummaryRequestRef = useRef(0);

  /* 
  const [achievements] = useState([
    { id: '1', name: 'First Workout', icon: 'fitness-center', earned: true },
    { id: '2', name: 'Week Warrior', icon: 'local-fire-department', earned: true },
    { id: '3', name: 'Century Club', icon: 'emoji-events', earned: false },
    { id: '4', name: 'Marathoner', icon: 'stars', earned: false },
  ]);
  */

  const [notifications, setNotifications] = useState<Array<{ id: string, message: string, type: 'success' | 'info' | 'warning' | 'error' }>>([]);

  const addNotification = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  useEffect(() => {
    loadData();
  }, []);

  const getMonthParams = (date: Date) => ({
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  });

  const fetchProfileData = async (date: Date) => {
    const response = await axiosInstance.get('/users/profile', {
      params: getMonthParams(date),
    });

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Failed to fetch profile');
    }

    return response.data.data;
  };

  const updateMonthlySummary = (userStats: any) => {
    setMonthlySummary({
      workoutsCount: Number(userStats?.workoutsCount) || 0,
      totalVolumeKg: Number(userStats?.totalVolumeKg) || 0,
    });
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setMonthlySummaryLoading(true);

      // Fetch profile and stats
      const profileData = await fetchProfileData(viewedMonth);
      if (profileData) {
        const { user: userData, stats: userStats, lastMeasurement, weeklyWeightData: weightData, workoutDays: workoutDayData } = profileData;

        setStats({
          totalWorkouts: userStats?.totalWorkouts || 0,
          monthlyVolumeKg: Number(userStats?.totalVolumeKg) || 0,
          streakDays: userStats?.currentStreak || 0,
          personalBestStreak: userStats?.personalBestStreak || 0,
          joinedDate: userData?.createdAt || new Date().toISOString(),
        });
        updateMonthlySummary(userStats);

        setWorkoutDays(Array.isArray(workoutDayData) ? workoutDayData : []);

        if (weightData) {
          setWeeklyWeightData(weightData);
          setWeightDataError(false);
        } else {
          setWeightDataError(true);
        }

        if (lastMeasurement) {
          setBodyMetrics(prev => ({
            ...prev,
            height: lastMeasurement.height || prev.height,
            weight: lastMeasurement.weight || prev.weight,
            bodyFat: lastMeasurement.bodyFat || prev.bodyFat,
            muscleMass: lastMeasurement.muscleMass || prev.muscleMass,
          }));
        }

        const derivedName = splitName(userData?.name);
        setProfileData({
          firstName: userData?.firstName || derivedName.firstName,
          lastName: userData?.lastName || derivedName.lastName,
          age: userData.age || 25,
          gender: userData.gender || 'male',
        });
      }
    } catch (err) {
      console.error('Error loading dynamic data:', err);
      Alert.alert('Error', 'Failed to load profile data');
      setWeightDataError(true);
      setMonthlySummary({
        workoutsCount: 0,
        totalVolumeKg: 0,
      });
    } finally {
      setLoading(false);
      setMonthlySummaryLoading(false);
    }
  };

  const loadMonthlySummary = async (date: Date) => {
    const requestId = monthlySummaryRequestRef.current + 1;
    monthlySummaryRequestRef.current = requestId;

    try {
      setMonthlySummaryLoading(true);
      const profileData = await fetchProfileData(date);

      if (requestId !== monthlySummaryRequestRef.current) {
        return;
      }

      updateMonthlySummary(profileData?.stats);
    } catch (error) {
      if (requestId !== monthlySummaryRequestRef.current) {
        return;
      }

      console.error('Error loading monthly summary:', error);
      setMonthlySummary({
        workoutsCount: 0,
        totalVolumeKg: 0,
      });
    } finally {
      if (requestId === monthlySummaryRequestRef.current) {
        setMonthlySummaryLoading(false);
      }
    }
  };

  const saveBodyMetrics = async (newMetrics: BodyMetrics) => {
    try {
      const result = await userApi.addMeasurement({
        weight: newMetrics.weight,
        height: newMetrics.height,
        bodyFat: newMetrics.bodyFat,
        muscleMass: newMetrics.muscleMass,
      }) as any;

      if (result.success) {
        setBodyMetrics(newMetrics);
        addNotification('Measurements saved!', 'success');
      } else {
        Alert.alert('Error', result.error || 'Failed to save measurements');
      }
    } catch (error) {
      console.error('Save metrics error:', error);
    }
  };

  const saveProfileData = async () => {
    try {
      const result = await userApi.updateProfile({
        name: `${profileData.firstName} ${profileData.lastName}`.trim(),
        age: profileData.age,
        gender: profileData.gender,
      }) as any;

      if (result.success) {
        setIsEditingProfile(false);
        addNotification('Profile updated!', 'success');
      } else {
        Alert.alert('Error', result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Save profile error:', error);
    }
  };

  const daysActive = Math.floor((new Date().getTime() - new Date(stats.joinedDate).getTime()) / (1000 * 60 * 60 * 24));
  const displayFirstName = profileData.firstName || (user as any)?.firstName || fallbackName.firstName;
  const displayLastName = profileData.lastName || (user as any)?.lastName || fallbackName.lastName;
  const displayName = `${displayFirstName} ${displayLastName}`.trim() || (user as any)?.name || 'User';

  const getWeeklyWorkoutData = () => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const workout = workoutDays.find(w => w.date === dayStr);
      return workout ? workout.workoutCount : 0;
    });
  };

  const getMarkedDates = () => {
    const marked: any = {};
    workoutDays.forEach(day => {
      marked[day.date] = { marked: true, dotColor: PRIMARY_COLOR };
    });
    const today = format(new Date(), 'yyyy-MM-dd');
    if (marked[today]) {
      marked[today] = { ...marked[today], selected: true, selectedColor: PRIMARY_COLOR };
    } else {
      marked[today] = { selected: true, selectedColor: PRIMARY_COLOR };
    }
    return marked;
  };

  const streak = { current: stats.streakDays, best: stats.personalBestStreak };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          // Navigation will be handled by AuthContext state change
        }
      },
    ]);
  };

  const handleMetricSave = () => {
    const value = parseFloat(metricModal.value);
    if (isNaN(value)) return;
    const newMetrics = { ...bodyMetrics };
    switch (metricModal.metric) {
      case 'height': newMetrics.height = value; break;
      case 'weight': newMetrics.weight = value; break;
      case 'bodyFat': newMetrics.bodyFat = value; break;
      case 'muscleMass': newMetrics.muscleMass = value; break;
    }
    saveBodyMetrics(newMetrics);
    setMetricModal({ visible: false, metric: '', value: '' });
  };

  const handleDatePress = (date: any) => {
    setSelectedDate(date.dateString);
    setDateModal(true);
  };

  const handleMonthChange = (month: { year: number; month: number }) => {
    const nextViewedMonth = new Date(month.year, month.month - 1, 1);
    setViewedMonth(nextViewedMonth);
    loadMonthlySummary(nextViewedMonth);
  };

  const getSelectedDateWorkout = () => {
    if (!selectedDate) return null;
    return workoutDays.find(w => w.date === selectedDate);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  const renderStatsTab = () => {
    const weeklyData = getWeeklyWorkoutData();
    const weeklyWeightLabels = weeklyWeightData.length > 0
      ? weeklyWeightData.map((day) => day.day)
      : WEEKDAY_LABELS;
    const weeklyWeightValues = weeklyWeightData.length > 0
      ? weeklyWeightData.map((day) => Number(day.totalWeight) || 0)
      : EMPTY_WEEKLY_WEIGHT_VALUES;
    const weeklyWeightChartMax = getWeeklyWeightChartMax(weeklyWeightValues);

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.heroAvatar}>
            <Text style={styles.heroAvatarText}>{getInitials(displayFirstName, displayLastName)}</Text>
          </View>
          <View style={styles.heroInfo}>
            <Text style={styles.heroName}>{displayName}</Text>
            <View style={styles.membershipBadge}>
              <Icon name="verified" size={14} color="#fbbf24" />
              <Text style={styles.membershipText}>Premium Member</Text>
            </View>
            <Text style={styles.daysActiveText}>Active for {daysActive} days</Text>
          </View>
        </View>

        {/* Streak Banner */}
        <View style={styles.streakBanner}>
          <View style={styles.streakIconContainer}>
            <Icon name="local-fire-department" size={32} color="#fff" />
          </View>
          <View style={styles.streakInfo}>
            <Text style={styles.streakCount}>{streak.current}</Text>
            <Text style={styles.streakLabel}>Day Streak</Text>
            <Text style={styles.streakBest}>Personal best: {streak.best} days</Text>
          </View>
        </View>

        {/* Stats Cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
          <View style={[styles.statCard, { borderLeftColor: '#0ea5e9' }]}>
            <Icon name="fitness-center" size={24} color="#0ea5e9" />
            <Text style={styles.statValue}>{stats.totalWorkouts}</Text>
            <Text style={styles.statLabel}>Total Workouts</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: '#10b981' }]}>
            <Ionicons name="barbell-outline" size={28} color="#0ea5e9" />
            <Text style={styles.statValue}>{stats.monthlyVolumeKg.toFixed(1)} kg</Text>
            <Text style={styles.statLabel}>Weight Lifted</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: '#f59e0b' }]}>
            <Icon name="emoji-events" size={24} color="#f59e0b" />
            <Text style={styles.statValue}>{stats.streakDays}</Text>
            <Text style={styles.statLabel}>Streak Days</Text>
          </View>
        </ScrollView>

        {/* Charts */}
        <>
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Weekly Workouts</Text>
            <BarChart
              data={{
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{ data: weeklyData }],
              }}
              width={width - 60}
              height={180}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(14, 165, 233, ${opacity})`,
                labelColor: () => '#6b7280',
              }}
              fromZero
              style={styles.chart}
            />
            {workoutDays.length === 0 ? (
              <Text style={{ textAlign: 'center', color: '#6b7280', fontSize: 12, marginTop: 10 }}>No workouts logged yet for your calendar history</Text>
            ) : null}
          </View>

          <View style={styles.chartCard}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#1e293b', marginBottom: 12 }}>Weekly Weight Lifted</Text>
            {weightDataError ? (
              <Text style={{ textAlign: 'center', color: '#ef4444', marginVertical: 20 }}>Could not load weight data</Text>
            ) : (
              <>
                <LineChart
                  data={{
                    labels: weeklyWeightLabels,
                    datasets: [{ data: weeklyWeightValues }]
                  }}
                  width={width - 60}
                  height={180}
                  yAxisLabel=""
                  yAxisSuffix=""
                  chartConfig={{
                    backgroundColor: '#fff',
                    backgroundGradientFrom: '#fff',
                    backgroundGradientTo: '#fff',
                    decimalPlaces: 0,
                    color: () => PRIMARY_COLOR,
                    labelColor: () => '#6b7280',
                    fillShadowGradientFrom: PRIMARY_COLOR,
                    fillShadowGradientFromOpacity: 0.3,
                    fillShadowGradientTo: PRIMARY_COLOR,
                    fillShadowGradientToOpacity: 0,
                    fillShadowGradientToOffset: 1,
                    propsForBackgroundLines: {
                      stroke: '#e2e8f0',
                      strokeDasharray: '0',
                    },
                    propsForDots: {
                      r: "5",
                      strokeWidth: "2",
                      stroke: "#ffffff",
                      fill: PRIMARY_COLOR,
                    }
                  }}
                  formatYLabel={formatWeeklyWeightAxisLabel}
                  segments={4}
                  bezier
                  fromZero
                  fromNumber={weeklyWeightChartMax}
                  style={styles.weightChart}
                />
                {weeklyWeightData.length > 0 && weeklyWeightData.every(d => d.totalWeight === 0) ? (
                  <Text style={{ textAlign: 'center', color: '#6b7280', fontSize: 12, marginTop: 10 }}>Log your first completed sets with weight and reps to see weekly lifting volume</Text>
                ) : (
                  <Text style={{ textAlign: 'center', color: '#6b7280', fontSize: 12, marginTop: 10 }}>Total weight lifted this week</Text>
                )}
              </>
            )}
          </View>
        </>

        {/* 
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {achievements.map((badge) => (
              <View key={badge.id} style={[styles.badge, !badge.earned && styles.badgeLocked]}>
                <View style={[styles.badgeIcon, !badge.earned && styles.badgeIconLocked]}>
                  <Icon name={badge.icon} size={24} color={badge.earned ? '#fff' : '#9ca3af'} />
                </View>
                <Text style={[styles.badgeName, !badge.earned && styles.badgeNameLocked]}>{badge.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
        */}
      </ScrollView>
    );
  };

  const renderMeasuresTab = () => {
    const bmi = calculateBMI(bodyMetrics.weight, bodyMetrics.height, bodyMetrics.weightUnit, bodyMetrics.heightUnit);
    const bmiCategory = getBMICategory(bmi);
    const sparkData = [bodyMetrics.weight - 2, bodyMetrics.weight - 1, bodyMetrics.weight];

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {/* Profile Setup */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Profile Setup</Text>
            <TouchableOpacity onPress={() => isEditingProfile ? saveProfileData() : setIsEditingProfile(true)}>
              <Text style={styles.editButton}>{isEditingProfile ? 'Save' : 'Edit'}</Text>
            </TouchableOpacity>
          </View>

          {isEditingProfile ? (
            <View style={styles.editForm}>
              <Text style={styles.inputLabel}>First Name</Text>
              <TextInput
                style={styles.textInput}
                value={profileData.firstName}
                onChangeText={(text) => setProfileData({ ...profileData, firstName: text })}
              />
              <Text style={styles.inputLabel}>Last Name</Text>
              <TextInput
                style={styles.textInput}
                value={profileData.lastName}
                onChangeText={(text) => setProfileData({ ...profileData, lastName: text })}
              />
              <Text style={styles.inputLabel}>Age</Text>
              <TextInput
                style={styles.textInput}
                value={profileData.age.toString()}
                onChangeText={(text) => setProfileData({ ...profileData, age: parseInt(text) || 0 })}
                keyboardType="numeric"
              />
              <Text style={styles.inputLabel}>Gender</Text>
              <View style={styles.genderSelector}>
                {(['male', 'female', 'other'] as const).map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.genderOption, profileData.gender === g && styles.genderOptionActive]}
                    onPress={() => setProfileData({ ...profileData, gender: g })}
                  >
                    <Text style={[styles.genderText, profileData.gender === g && styles.genderTextActive]}>
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.profileDisplay}>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Full Name</Text>
                <Text style={styles.profileValue}>{profileData.firstName} {profileData.lastName}</Text>
              </View>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Age</Text>
                <Text style={styles.profileValue}>{profileData.age} years</Text>
              </View>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Gender</Text>
                <Text style={styles.profileValue}>{profileData.gender.charAt(0).toUpperCase() + profileData.gender.slice(1)}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Body Metrics */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Body Metrics</Text>

          <TouchableOpacity style={styles.metricCard} onPress={() => setMetricModal({ visible: true, metric: 'height', value: bodyMetrics.height.toString() })}>
            <View style={styles.metricLeft}>
              <Icon name="height" size={20} color={PRIMARY_COLOR} />
              <View style={styles.metricInfo}>
                <Text style={styles.metricName}>Height</Text>
                <Text style={styles.metricValue}>{bodyMetrics.height} {bodyMetrics.heightUnit}</Text>
              </View>
            </View>

          </TouchableOpacity>

          <TouchableOpacity style={styles.metricCard} onPress={() => setMetricModal({ visible: true, metric: 'weight', value: bodyMetrics.weight.toString() })}>
            <View style={styles.metricLeft}>
              <Icon name="monitor-weight" size={20} color="#ef4444" />
              <View style={styles.metricInfo}>
                <Text style={styles.metricName}>Weight</Text>
                <Text style={styles.metricValue}>{bodyMetrics.weight} {bodyMetrics.weightUnit}</Text>
                <Text style={styles.metricChange}>+0.5 from last</Text>
              </View>
            </View>

          </TouchableOpacity>

          <TouchableOpacity style={styles.metricCard} onPress={() => setMetricModal({ visible: true, metric: 'bodyFat', value: bodyMetrics.bodyFat.toString() })}>
            <View style={styles.metricLeft}>
              <Icon name="percent" size={20} color="#8b5cf6" />
              <View style={styles.metricInfo}>
                <Text style={styles.metricName}>Body Fat</Text>
                <Text style={styles.metricValue}>{bodyMetrics.bodyFat}%</Text>
                <Text style={styles.metricChangeNegative}>-0.8% from last</Text>
              </View>
            </View>

          </TouchableOpacity>

          <View style={styles.metricCard}>
            <View style={styles.metricLeft}>
              <Icon name="calculate" size={20} color={bmiCategory.color} />
              <View style={styles.metricInfo}>
                <Text style={styles.metricName}>BMI</Text>
                <Text style={[styles.metricValue, { color: bmiCategory.color }]}>{bmi}</Text>
                <View style={[styles.bmiBadge, { backgroundColor: bmiCategory.color + '20' }]}>
                  <Text style={[styles.bmiBadgeText, { color: bmiCategory.color }]}>{bmiCategory.label}</Text>
                </View>
              </View>
            </View>
            <Text style={styles.bmiNote}>Auto-calculated</Text>
          </View>
        </View>

        {/* Unit Preferences */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Unit Preferences</Text>
          <View style={styles.unitToggle}>
            <Text style={styles.unitLabel}>Weight</Text>
            <View style={styles.unitButtons}>
              <TouchableOpacity
                style={[styles.unitButton, bodyMetrics.weightUnit === 'kg' && styles.unitButtonActive]}
                onPress={() => saveBodyMetrics({ ...bodyMetrics, weightUnit: 'kg' })}
              >
                <Text style={[styles.unitText, bodyMetrics.weightUnit === 'kg' && styles.unitTextActive]}>kg</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.unitButton, bodyMetrics.weightUnit === 'lbs' && styles.unitButtonActive]}
                onPress={() => saveBodyMetrics({ ...bodyMetrics, weightUnit: 'lbs' })}
              >
                <Text style={[styles.unitText, bodyMetrics.weightUnit === 'lbs' && styles.unitTextActive]}>lbs</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.updateAllButton} onPress={() => setAllMetricsModal(true)}>
          <Icon name="edit" size={20} color="#fff" />
          <Text style={styles.updateAllText}>Update All Measurements</Text>
        </TouchableOpacity>

        {/* Metric Modal */}
        <Modal visible={metricModal.visible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit {metricModal.metric}</Text>
              <TextInput
                style={styles.modalInput}
                value={metricModal.value}
                onChangeText={(text) => setMetricModal({ ...metricModal, value: text })}
                keyboardType="numeric"
                autoFocus
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalCancelButton} onPress={() => setMetricModal({ visible: false, metric: '', value: '' })}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalSaveButton} onPress={handleMetricSave}>
                  <Text style={styles.modalSaveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* All Metrics Modal */}
        <Modal visible={allMetricsModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <ScrollView style={styles.allMetricsModal}>
              <View style={styles.allMetricsContent}>
                <Text style={styles.modalTitle}>Update All Measurements</Text>
                <Text style={styles.inputLabel}>Height ({bodyMetrics.heightUnit})</Text>
                <TextInput
                  style={styles.textInput}
                  value={bodyMetrics.height.toString()}
                  onChangeText={(text) => setBodyMetrics({ ...bodyMetrics, height: parseFloat(text) || 0 })}
                  keyboardType="numeric"
                />
                <Text style={styles.inputLabel}>Weight ({bodyMetrics.weightUnit})</Text>
                <TextInput
                  style={styles.textInput}
                  value={bodyMetrics.weight.toString()}
                  onChangeText={(text) => setBodyMetrics({ ...bodyMetrics, weight: parseFloat(text) || 0 })}
                  keyboardType="numeric"
                />
                <Text style={styles.inputLabel}>Body Fat %</Text>
                <TextInput
                  style={styles.textInput}
                  value={bodyMetrics.bodyFat.toString()}
                  onChangeText={(text) => setBodyMetrics({ ...bodyMetrics, bodyFat: parseFloat(text) || 0 })}
                  keyboardType="numeric"
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity style={styles.modalCancelButton} onPress={() => setAllMetricsModal(false)}>
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalSaveButton}
                    onPress={() => { saveBodyMetrics(bodyMetrics); setAllMetricsModal(false); }}
                  >
                    <Text style={styles.modalSaveText}>Save All</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </Modal>
      </ScrollView>
    );
  };

  const renderCalendarTab = () => {
    const selectedWorkout = getSelectedDateWorkout();
    const monthlyWorkoutsValue = monthlySummaryLoading ? '-' : monthlySummary.workoutsCount.toString();
    const monthlyVolumeValue = monthlySummaryLoading ? '-' : `${monthlySummary.totalVolumeKg.toFixed(1)} kg`;

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <View style={styles.calendarCard}>
          <Calendar
            current={format(viewedMonth, 'yyyy-MM-dd')}
            onDayPress={handleDatePress}
            onMonthChange={handleMonthChange}
            markedDates={getMarkedDates()}
            theme={{
              backgroundColor: '#fff',
              calendarBackground: '#fff',
              textSectionTitleColor: '#6b7280',
              selectedDayBackgroundColor: PRIMARY_COLOR,
              selectedDayTextColor: '#fff',
              todayTextColor: PRIMARY_COLOR,
              dayTextColor: '#374151',
              textDisabledColor: '#d1d5db',
              dotColor: PRIMARY_COLOR,
              arrowColor: PRIMARY_COLOR,
              monthTextColor: '#1f2937',
              textMonthFontWeight: 'bold',
            }}
          />
        </View>

        <View style={styles.streakCounterCard}>
          <View style={styles.streakCounterItem}>
            <Icon name="local-fire-department" size={28} color="#ef4444" />
            <View>
              <Text style={styles.streakCounterValue}>{streak.current}</Text>
              <Text style={styles.streakCounterLabel}>Current Streak</Text>
            </View>
          </View>
          <View style={styles.streakDivider} />
          <View style={styles.streakCounterItem}>
            <Icon name="emoji-events" size={28} color="#fbbf24" />
            <View>
              <Text style={styles.streakCounterValue}>{streak.best}</Text>
              <Text style={styles.streakCounterLabel}>Best Streak</Text>
            </View>
          </View>
        </View>

        <View style={styles.monthlySummary}>
          <Text style={styles.monthlySummaryTitle}>This Month</Text>
          <View style={styles.monthlyStats}>
            <View style={styles.monthlyStat}>
              <Text style={styles.monthlyStatValue}>{monthlyWorkoutsValue}</Text>
              <Text style={styles.monthlyStatLabel}>Workouts</Text>
            </View>
            <View style={styles.monthlyStat}>
              <Text style={styles.monthlyStatValue}>{monthlyVolumeValue}</Text>
              <Text style={styles.monthlyStatLabel}>Total Volume</Text>
            </View>
          </View>
        </View>

        <Modal visible={dateModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.dateModalContent}>
              <View style={styles.dateModalHeader}>
                <Text style={styles.dateModalTitle}>
                  {selectedDate ? format(parseISO(selectedDate), 'MMMM d, yyyy') : ''}
                </Text>
                <TouchableOpacity onPress={() => setDateModal(false)}>
                  <Icon name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              {selectedWorkout ? (
                <View style={styles.workoutDetail}>
                  <View style={styles.workoutDetailItem}>
                    <Icon name="fitness-center" size={24} color={PRIMARY_COLOR} />
                    <View>
                      <Text style={styles.workoutDetailLabel}>Workouts</Text>
                      <Text style={styles.workoutDetailValue}>{selectedWorkout.workoutCount} sessions</Text>
                    </View>
                  </View>
                  <View style={styles.workoutDetailItem}>
                    <Icon name="schedule" size={24} color="#10b981" />
                    <View>
                      <Text style={styles.workoutDetailLabel}>Duration</Text>
                      <Text style={styles.workoutDetailValue}>{selectedWorkout.totalDuration} min</Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.noWorkoutState}>
                  <Icon name="event-busy" size={48} color="#d1d5db" />
                  <Text style={styles.noWorkoutTitle}>No workout logged</Text>
                </View>
              )}
            </View>
          </View>
        </Modal>
      </ScrollView>
    );
  };

  const renderExercisesTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.exerciseList}>
        {['Bench Press', 'Squats', 'Deadlifts', 'Pull-ups', 'Push-ups', 'Lunges'].map((exercise, index) => (
          <TouchableOpacity key={index} style={styles.exerciseItem}>
            <View style={styles.exerciseIcon}>
              <Icon name="fitness-center" size={20} color="#0ea5e9" />
            </View>
            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseName}>{exercise}</Text>
              <Text style={styles.exerciseDetail}>Last: {index + 1} days ago</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#9ca3af" />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* Notifications overlay */}
      <View style={styles.notificationOverlay}>
        {notifications.map(n => (
          <View key={n.id} style={[styles.notificationToast, styles[n.type]]}>
            <Text style={styles.notificationToastText}>{n.message}</Text>
          </View>
        ))}
      </View>

      {/* Header with Settings */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(displayFirstName, displayLastName)}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{displayName}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.settingsButton} onPress={() => setShowSettings(true)}>
          <Ionicons name="settings-outline" size={24} color="#1e293b" />
        </TouchableOpacity>
      </View>

      {/* Settings Menu */}
      <Modal visible={showSettings} transparent animationType="fade">
        <TouchableOpacity
          style={styles.settingsOverlay}
          activeOpacity={1}
          onPress={() => setShowSettings(false)}
        >
          <View style={styles.settingsMenu}>
            <View style={styles.settingsMenuHeader}>
              <Text style={styles.settingsMenuTitle}>Account</Text>
              <TouchableOpacity onPress={() => setShowSettings(false)} style={styles.closeMenuButton}>
                <Icon name="close" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.settingsItem}>
              <Icon name="settings" size={20} color="#374151" />
              <Text style={styles.settingsItemText}>Settings</Text>
            </TouchableOpacity>
            <View style={styles.settingsDivider} />
            <TouchableOpacity style={styles.settingsItem} onPress={handleLogout}>
              <Icon name="logout" size={20} color="#ef4444" />
              <Text style={[styles.settingsItemText, { color: '#ef4444' }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {[
          { id: 'stats', icon: 'bar-chart', label: 'Stats' },
          { id: 'measures', icon: 'straighten', label: 'Measures' },
          { id: 'calendar', icon: 'calendar-today', label: 'Calendar' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Icon name={tab.icon} size={20} color={activeTab === tab.id ? PRIMARY_COLOR : '#9ca3af'} />
            <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <View style={styles.contentContainer}>
        {activeTab === 'stats' && renderStatsTab()}
        {activeTab === 'measures' && renderMeasuresTab()}
        {activeTab === 'calendar' && renderCalendarTab()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#6b7280', fontSize: 14 },

  header: {
    backgroundColor: '#fff',
    padding: 16,
    paddingTop: 55,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  profileSection: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  profileInfo: { flex: 1 },
  name: { fontSize: 17, fontWeight: '600', color: '#1f2937' },
  email: { fontSize: 13, color: '#6b7280' },
  settingsButton: {
    padding: 8,
    marginRight: 24,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  settingsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 16,
  },
  settingsMenu: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    overflow: 'hidden',
  },
  settingsMenuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#f8fafc',
  },
  settingsMenuTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  closeMenuButton: {
    padding: 4,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#fff',
  },
  settingsItemText: { fontSize: 16, marginLeft: 10, color: '#374151', fontWeight: '500' },
  settingsDivider: { height: 1, backgroundColor: '#f1f5f9' },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: { borderBottomColor: PRIMARY_COLOR },
  tabText: { fontSize: 12, color: '#9ca3af', marginTop: 4, fontWeight: '500' },
  activeTabText: { color: PRIMARY_COLOR, fontWeight: '600' },
  contentContainer: { flex: 1 },
  tabContent: { flex: 1, padding: 16 },

  // Stats Tab
  heroBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  heroAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  heroAvatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  heroInfo: { flex: 1 },
  heroName: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  membershipBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  membershipText: { fontSize: 12, color: '#fbbf24', marginLeft: 4, fontWeight: '500' },
  daysActiveText: { fontSize: 12, color: '#6b7280', marginTop: 2 },

  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  streakIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f97316',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  streakInfo: { flex: 1 },
  streakCount: { fontSize: 32, fontWeight: 'bold', color: '#1f2937' },
  streakLabel: { fontSize: 14, color: '#6b7280' },
  streakBest: { fontSize: 12, color: '#9ca3af', marginTop: 2 },

  statsScroll: { marginBottom: 16 },
  statCard: {
    width: 140,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginTop: 8 },
  statLabel: { fontSize: 12, color: '#6b7280', marginTop: 4 },

  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 12 },
  chart: { borderRadius: 12, marginLeft: -10 },
  weightChart: {
    borderRadius: 16,
    marginLeft: -10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  emptyState: { alignItems: 'center', padding: 32 },
  emptyStateTitle: { fontSize: 16, fontWeight: '600', color: '#6b7280', marginTop: 16 },
  emptyStateText: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 8 },

  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 12 },
  badge: { width: 80, alignItems: 'center', marginRight: 16 },
  badgeLocked: { opacity: 0.5 },
  badgeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeIconLocked: { backgroundColor: '#e5e7eb' },
  badgeName: { fontSize: 11, color: '#374151', textAlign: 'center', marginTop: 8, fontWeight: '500' },
  badgeNameLocked: { color: '#9ca3af' },

  // Measures Tab
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  editButton: { color: PRIMARY_COLOR, fontWeight: '600', fontSize: 14 },
  profileDisplay: { gap: 12 },
  profileRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  profileLabel: { fontSize: 14, color: '#6b7280' },
  profileValue: { fontSize: 14, fontWeight: '500', color: '#1f2937' },
  editForm: { gap: 16 },
  inputLabel: { fontSize: 14, color: '#6b7280', fontWeight: '500', marginBottom: 8 },
  textInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  genderSelector: { flexDirection: 'row', gap: 8 },
  genderOption: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#f3f4f6', alignItems: 'center' },
  genderOptionActive: { backgroundColor: PRIMARY_COLOR },
  genderText: { color: '#6b7280', fontWeight: '500' },
  genderTextActive: { color: '#fff' },

  metricCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  metricLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  metricInfo: { marginLeft: 12 },
  metricName: { fontSize: 13, color: '#6b7280' },
  metricValue: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginTop: 2 },
  metricChange: { fontSize: 11, color: '#10b981', marginTop: 2 },
  metricChangeNegative: { fontSize: 11, color: '#ef4444', marginTop: 2 },
  sparkline: { marginLeft: 8 },
  bmiBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  bmiBadgeText: { fontSize: 11, fontWeight: '500' },
  bmiNote: { fontSize: 11, color: '#9ca3af', fontStyle: 'italic' },

  unitToggle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  unitLabel: { fontSize: 14, color: '#6b7280' },
  unitButtons: { flexDirection: 'row', gap: 8 },
  unitButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, backgroundColor: '#f3f4f6' },
  unitButtonActive: { backgroundColor: PRIMARY_COLOR },
  unitText: { color: '#6b7280', fontWeight: '500', fontSize: 14 },
  unitTextActive: { color: '#fff' },

  updateAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY_COLOR,
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
    gap: 8,
  },
  updateAllText: { color: '#fff', fontWeight: '600', fontSize: 16 },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 16 },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 20,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalCancelButton: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#f3f4f6', alignItems: 'center' },
  modalCancelText: { color: '#6b7280', fontWeight: '600', fontSize: 16 },
  modalSaveButton: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: PRIMARY_COLOR, alignItems: 'center' },
  modalSaveText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  allMetricsModal: { backgroundColor: '#fff', maxHeight: '80%' },
  allMetricsContent: { padding: 24 },

  // Calendar
  calendarCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  streakCounterCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  streakCounterItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  streakDivider: { width: 1, backgroundColor: '#e5e7eb', marginHorizontal: 16 },
  streakCounterValue: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  streakCounterLabel: { fontSize: 12, color: '#6b7280' },
  monthlySummary: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  monthlySummaryTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 16 },
  monthlyStats: { flexDirection: 'row', justifyContent: 'space-around' },
  monthlyStat: { alignItems: 'center' },
  monthlyStatValue: { fontSize: 20, fontWeight: 'bold', color: PRIMARY_COLOR },
  monthlyStatLabel: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  dateModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    minHeight: 300,
  },
  dateModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  dateModalTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937' },
  workoutDetail: { gap: 20 },
  workoutDetailItem: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  workoutDetailLabel: { fontSize: 13, color: '#6b7280' },
  workoutDetailValue: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginTop: 2 },
  noWorkoutState: { alignItems: 'center', paddingVertical: 40 },
  noWorkoutTitle: { fontSize: 16, fontWeight: '500', color: '#6b7280', marginTop: 16 },

  // Exercises
  exerciseList: { gap: 12 },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  exerciseIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  exerciseInfo: { flex: 1 },
  exerciseName: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  exerciseDetail: { fontSize: 13, color: '#6b7280', marginTop: 4 },

  // Notifications
  notificationOverlay: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 9999,
    alignItems: 'center',
  },
  notificationToast: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  notificationToastText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  info: { backgroundColor: '#3b82f6' },
  success: { backgroundColor: '#10b981' },
  warning: { backgroundColor: '#f59e0b' },
  error: { backgroundColor: '#ef4444' },
});

export default ProfileScreen;

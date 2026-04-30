import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';
import workoutApi from '../../api/workoutApi';
import { useApi } from '../../hooks/useApi';
import theme from '../../theme';

const WorkoutDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { workoutId } = route.params;

  // Fetch workout details
  const {
    data: workout,
    loading,
    error,
    execute: fetchWorkout,
  } = useApi(workoutApi.getWorkoutById);

  // Delete workout
  const { loading: deleting, execute: deleteWorkout } = useApi(workoutApi.deleteWorkout);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (workoutId) {
      fetchWorkout(workoutId);
    }
  }, [workoutId]);

  useEffect(() => {
    if (workout) {
      navigation.setOptions({
        title: workout.name || 'Workout Details',
        headerRight: () => (
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => handleEditWorkout()}
          >
            <Icon name="edit" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        ),
      });
    }
  }, [workout]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchWorkout(workoutId);
    setRefreshing(false);
  };

  const handleEditWorkout = () => {
    navigation.navigate('WorkoutForm', { workoutId, workout });
  };

  const handleDeleteWorkout = () => {
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ]
    );
  };

  const confirmDelete = async () => {
    const result = await deleteWorkout(workoutId);
    if (result.success) {
      Alert.alert('Success', 'Workout deleted successfully');
      navigation.goBack();
    } else {
      Alert.alert('Error', result.error || 'Failed to delete workout');
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'EEEE, MMMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getTotalVolume = (exercises) => {
    return exercises?.reduce((total, exercise) => {
      return total + (exercise.sets?.reduce((setTotal, set) => {
        return setTotal + ((set.reps || 0) * (set.weight || 0));
      }, 0) || 0);
    }, 0) || 0;
  };

  const getTotalSets = (exercises) => {
    return exercises?.reduce((total, exercise) => {
      return total + (exercise.sets?.length || 0);
    }, 0) || 0;
  };

  const getWorkoutTypeIcon = (type) => {
    const icons = {
      STRENGTH: 'fitness',
      CARDIO: 'directions-run',
      MIXED: 'refresh',
      HIIT: 'flash',
      YOGA: 'self-improvement',
    };
    return icons[type] || 'fitness';
  };

  const getWorkoutTypeColor = (type) => {
    const colors = {
      STRENGTH: '#3b82f6',
      CARDIO: '#ef4444',
      MIXED: '#8b5cf6',
      HIIT: '#f59e0b',
      YOGA: '#10b981',
    };
    return colors[type] || '#3b82f6';
  };

  if (loading && !workout) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading workout...</Text>
      </View>
    );
  }

  if (error && !workout) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error" size={48} color="#ef4444" />
        <Text style={styles.errorTitle}>Failed to load workout</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchWorkout(workoutId)}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!workout) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="fitness-center" size={48} color="#6b7280" />
        <Text style={styles.errorTitle}>Workout not found</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[theme.colors.primary]}
        />
      }
    >
      {/* Workout Header */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <View style={styles.titleRow}>
            <View style={[styles.typeIcon, { backgroundColor: getWorkoutTypeColor(workout.type) }]}>
              <Icon name={getWorkoutTypeIcon(workout.type)} size={24} color="white" />
            </View>
            <Text style={styles.workoutName}>{workout.name}</Text>
          </View>
          <Text style={styles.workoutDate}>{formatDate(workout.date)}</Text>
        </View>
        
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteWorkout}>
          <Icon name="delete" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      {/* Workout Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{workout.exercises?.length || 0}</Text>
          <Text style={styles.statLabel}>Exercises</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatDuration(workout.duration)}</Text>
          <Text style={styles.statLabel}>Duration</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{getTotalVolume(workout.exercises)}</Text>
          <Text style={styles.statLabel}>Volume</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{workout.caloriesBurned || 0}</Text>
          <Text style={styles.statLabel}>Calories</Text>
        </View>
      </View>

      {/* Notes */}
      {workout.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesTitle}>Notes</Text>
          <Text style={styles.notesText}>{workout.notes}</Text>
        </View>
      )}

      {/* Exercises */}
      <View style={styles.exercisesContainer}>
        <Text style={styles.exercisesTitle}>Exercises</Text>
        {workout.exercises?.map((exercise, index) => (
          <View key={exercise.id} style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
              <Text style={styles.exerciseSets}>{exercise.sets?.length || 0} sets</Text>
            </View>
            
            <View style={styles.setsContainer}>
              {exercise.sets?.map((set, setIndex) => (
                <View key={set.id} style={styles.setRow}>
                  <Text style={styles.setNumber}>Set {setIndex + 1}</Text>
                  <View style={styles.setDetails}>
                    {set.reps && <Text style={styles.setValue}>{set.reps} reps</Text>}
                    {set.weight && <Text style={styles.setValue}>{set.weight} lbs</Text>}
                    {set.duration && <Text style={styles.setValue}>{set.duration}s</Text>}
                  </View>
                  <View style={[styles.setCompleted, { backgroundColor: set.isCompleted ? '#10b981' : '#6b7280' }]}>
                    <Icon name="check" size={16} color="white" />
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: 20,
  },
  headerButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  workoutName: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    flex: 1,
  },
  workoutDate: {
    fontSize: 16,
    color: '#6b7280',
  },
  deleteButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.card,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  notesContainer: {
    backgroundColor: theme.colors.card,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  notesText: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
  },
  exercisesContainer: {
    marginBottom: 24,
  },
  exercisesTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 16,
  },
  exerciseCard: {
    backgroundColor: theme.colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  exerciseSets: {
    fontSize: 14,
    color: '#6b7280',
  },
  setsContainer: {
    gap: 8,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  setNumber: {
    fontSize: 14,
    color: '#6b7280',
    width: 60,
  },
  setDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  setValue: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  setCompleted: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default WorkoutDetailScreen;

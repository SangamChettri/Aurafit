import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../../config/api';
import { Workout } from '../../types/workout';
import { WorkoutStackNavigationProp } from '../../types/navigation';

const WorkoutScreen = () => {
  const navigation = useNavigation<WorkoutStackNavigationProp>();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      const response = await api.get('/workouts');
      if (response.data.success) {
        setWorkouts(response.data.data);
      }
    } catch (error) {
      console.error('Load workouts error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRepeatWorkout = (item: Workout) => {
    // Navigate to WorkoutLog with the workout data as a template
    // @ts-ignore
    navigation.navigate('WorkoutLog', {
      templateWorkout: {
        name: item.name,
        type: item.type,
        exercises: item.exercises?.map(ex => ({
          ...ex,
          id: Date.now().toString() + Math.random(), // Unique ID for the temporary session
          sets: ex.sets.map(s => ({
            ...s,
            id: Date.now().toString() + Math.random(),
            completed: false
          }))
        })) || []
      }
    });
  };

  const renderWorkoutItem = ({ item }: { item: Workout }) => {
    const totalExercises = item.exercises?.length || 0;
    const totalSets = item.exercises?.reduce((sum, exercise) => sum + exercise.sets.length, 0) || 0;
    const totalVolume = item.exercises?.reduce((sum, exercise) => {
      return sum + exercise.sets.reduce((setSum, set) => setSum + (set.reps * (set.weight || 0)), 0);
    }, 0) || 0;

    return (
      <TouchableOpacity 
        style={styles.workoutCard}
        onPress={() => handleRepeatWorkout(item)}
        activeOpacity={0.7}
      >
        <View style={styles.workoutHeader}>
          <View style={styles.workoutTitleContainer}>
            <Text style={styles.workoutName}>
              {item.name || `${item.type} Workout`}
            </Text>
            <Text style={styles.workoutDate}>
              {new Date(item.date).toLocaleDateString()}
            </Text>
          </View>
          <View style={[styles.statusBadge, item.completed && styles.completedBadge]}>
            <Text style={[styles.statusText, item.completed && styles.completedText]}>
              {item.completed ? 'Completed' : 'In Progress'}
            </Text>
          </View>
        </View>
        
        <View style={styles.workoutStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalExercises}</Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalSets}</Text>
            <Text style={styles.statLabel}>Sets</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalVolume}</Text>
            <Text style={styles.statLabel}>Total lbs</Text>
          </View>
        </View>
        
        {item.exercises && item.exercises.length > 0 && (
          <View style={styles.exercisePreview}>
            <Text style={styles.exercisePreviewTitle}>Exercises:</Text>
            <Text style={styles.exercisePreviewText}>
              {item.exercises.slice(0, 3).map(ex => ex.exerciseName).join(', ')}
              {item.exercises.length > 3 && ` +${item.exercises.length - 3} more`}
            </Text>
          </View>
        )}

        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={styles.actionButtonPrimary}
            onPress={() => handleRepeatWorkout(item)}
          >
            <Icon name="play-arrow" size={20} color="#ffffff" />
            <Text style={styles.actionButtonTextPrimary}>Reuse Workout</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButtonSecondary}
            onPress={() => handleRepeatWorkout(item)}
          >
            <Icon name="history" size={20} color="#0ea5e9" />
            <Text style={styles.actionButtonTextSecondary}>Use as Template</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text style={styles.loadingText}>Loading your workouts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Workout History</Text>
          <Text style={styles.subtitle}>Tap any workout to reuse it</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('WorkoutLog' as never)}
        >
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id}
        renderItem={renderWorkoutItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon name="history" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No workout history yet</Text>
            <Text style={styles.emptySubtext}>
              Start logging workouts to build your history and reuse them later
            </Text>
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => navigation.navigate('WorkoutLog' as never)}
            >
              <Text style={styles.startButtonText}>Log Your First Workout</Text>
            </TouchableOpacity>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0ea5e9',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  addButton: {
    backgroundColor: '#0ea5e9',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  listContainer: {
    padding: 15,
  },
  workoutCard: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  workoutTitleContainer: {
    flex: 1,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  workoutDate: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#fef3c7',
  },
  completedBadge: {
    backgroundColor: '#d1fae5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400e',
  },
  completedText: {
    color: '#065f46',
  },
  workoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
    paddingVertical: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0ea5e9',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  workoutDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  exercisePreview: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  exercisePreviewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  exercisePreviewText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  empty: {
    padding: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  startButton: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cardActions: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  actionButtonTextSecondary: {
    color: '#0ea5e9',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  actionButtonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0ea5e9',
  },
  actionButtonTextPrimary: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default WorkoutScreen;

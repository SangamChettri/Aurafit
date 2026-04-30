import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Workout, WorkoutExercise, ExerciseSet, Exercise } from '../../types/workout';
import { EXERCISES, EXERCISE_CATEGORIES, searchExercises } from '../../data/exercises';
import api from '../../config/api';

interface WorkoutFormData {
  name: string;
  type: 'STRENGTH' | 'CARDIO' | 'MIXED' | 'HIIT' | 'YOGA';
  notes: string;
}

const WorkoutLogScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
  const [previousWorkoutData, setPreviousWorkoutData] = useState<{[key: string]: {reps: number, weight: number}}>({});
  const [activeTimers, setActiveTimers] = useState<{[key: string]: {minutes: number, seconds: number, isRunning: boolean}}>({});
  const [notifications, setNotifications] = useState<Array<{id: string, message: string, type: 'success' | 'info' | 'warning' | 'error', timestamp: Date}>>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const intervalRefs = useRef<{[key: string]: NodeJS.Timeout}>({});

  const { control, handleSubmit, setValue } = useForm<WorkoutFormData>({
    defaultValues: {
      name: '',
      type: 'STRENGTH',
      notes: '',
    },
  });

  const addExerciseToWorkout = (exercise: Exercise) => {
    // Fetch previous workout data for this exercise
    fetchPreviousWorkoutData(exercise.id);
    
    const newWorkoutExercise: WorkoutExercise = {
      id: Date.now().toString(),
      exerciseId: exercise.id,
      exercise,
      sets: [
        {
          id: Date.now().toString(),
          reps: previousWorkoutData[exercise.id]?.reps || 0,
          weight: previousWorkoutData[exercise.id]?.weight || 0,
          restTime: 60,
          completed: false,
        },
      ],
    };
    setWorkoutExercises([...workoutExercises, newWorkoutExercise]);
    setShowExerciseModal(false);
    setSearchQuery('');
    setSelectedCategory(null);
    
    addNotification(`Added ${exercise.name} to workout`, 'success');
  };

  const fetchPreviousWorkoutData = async (exerciseId: string) => {
    try {
      const response = await api.get(`/workouts/exercise/${exerciseId}/previous`);
      if (response.data.success && response.data.data) {
        setPreviousWorkoutData(prev => ({
          ...prev,
          [exerciseId]: {
            reps: response.data.data.reps,
            weight: response.data.data.weight
          }
        }));
      }
    } catch (error) {
      console.log('No previous workout data found for exercise:', exerciseId);
    }
  };

  const startTimer = (exerciseId: string, setId: string) => {
    const timerKey = `${exerciseId}-${setId}`;
    
    // Clear any existing interval
    if (intervalRefs.current[timerKey]) {
      clearInterval(intervalRefs.current[timerKey]);
    }
    
    // If timer is at 0:00, use the rest time from the set
    const workoutExercise = workoutExercises.find(ex => ex.id === exerciseId);
    const set = workoutExercise?.sets.find(s => s.id === setId);
    const restTime = set?.restTime || 60;
    
    const currentMinutes = activeTimers[timerKey]?.minutes || Math.floor(restTime / 60);
    const currentSeconds = activeTimers[timerKey]?.seconds || restTime % 60;
    
    // Only start if timer has time remaining
    if (currentMinutes === 0 && currentSeconds === 0) {
      setActiveTimers(prev => ({
        ...prev,
        [timerKey]: {
          minutes: Math.floor(restTime / 60),
          seconds: restTime % 60,
          isRunning: false
        }
      }));
      return;
    }
    
    setActiveTimers(prev => ({
      ...prev,
      [timerKey]: {
        minutes: currentMinutes,
        seconds: currentSeconds,
        isRunning: true
      }
    }));
    
    intervalRefs.current[timerKey] = setInterval(() => {
      setActiveTimers(prev => {
        const current = prev[timerKey];
        if (!current?.isRunning) return prev;
        
        let newMinutes = current.minutes;
        let newSeconds = current.seconds - 1;
        
        if (newSeconds < 0) {
          if (newMinutes > 0) {
            newMinutes = newMinutes - 1;
            newSeconds = 59;
          } else {
            // Timer reached 0:00
            clearInterval(intervalRefs.current[timerKey]);
            delete intervalRefs.current[timerKey];
            addNotification('Rest timer completed!', 'success');
            return {
              ...prev,
              [timerKey]: {
                minutes: 0,
                seconds: 0,
                isRunning: false
              }
            };
          }
        }
        
        return {
          ...prev,
          [timerKey]: {
            minutes: newMinutes,
            seconds: newSeconds,
            isRunning: true
          }
        };
      });
    }, 1000);
  };

  const stopTimer = (exerciseId: string, setId: string) => {
    const timerKey = `${exerciseId}-${setId}`;
    
    if (intervalRefs.current[timerKey]) {
      clearInterval(intervalRefs.current[timerKey]);
      delete intervalRefs.current[timerKey];
    }
    
    setActiveTimers(prev => ({
      ...prev,
      [timerKey]: {
        ...prev[timerKey],
        isRunning: false
      }
    }));
  };

  const updateTimerTime = (exerciseId: string, setId: string, field: 'minutes' | 'seconds', value: number) => {
    const timerKey = `${exerciseId}-${setId}`;
    setActiveTimers(prev => ({
      ...prev,
      [timerKey]: {
        ...prev[timerKey],
        [field]: Math.max(0, Math.min(field === 'minutes' ? 59 : 59, value))
      }
    }));
  };

  const canStartSet = (exerciseId: string, setId: string) => {
    const workoutExercise = workoutExercises.find(ex => ex.id === exerciseId);
    const set = workoutExercise?.sets.find(s => s.id === setId);
    return set && set.reps > 0 && (set.weight ?? 0) >= 0;
  };

  const addNotification = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const newNotification = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date()
    };
    
    setNotifications(prev => [newNotification, ...prev].slice(0, 10)); // Keep only last 10 notifications
    
    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const updateExerciseSet = (exerciseId: string, setId: string, field: keyof ExerciseSet, value: number) => {
    setWorkoutExercises(exercises =>
      exercises.map(exercise => {
        if (exercise.id === exerciseId) {
          return {
            ...exercise,
            sets: exercise.sets.map((set: ExerciseSet) =>
              set.id === setId ? { ...set, [field]: value } : set
            ),
          };
        }
        return exercise;
      })
    );
  };

  const addSet = (exerciseId: string) => {
    setWorkoutExercises(exercises =>
      exercises.map(exercise => {
        if (exercise.id === exerciseId) {
          const lastSet = exercise.sets[exercise.sets.length - 1];
          const newSet: ExerciseSet = {
            id: Date.now().toString(),
            reps: lastSet?.reps || 0,
            weight: lastSet?.weight || 0,
            restTime: lastSet?.restTime || 60,
            completed: false,
          };
          return {
            ...exercise,
            sets: [...exercise.sets, newSet],
          };
        }
        return exercise;
      })
    );
  };

  const removeSet = (exerciseId: string, setId: string) => {
    setWorkoutExercises(exercises =>
      exercises.map(exercise => {
        if (exercise.id === exerciseId && exercise.sets.length > 1) {
          return {
            ...exercise,
            sets: exercise.sets.filter(set => set.id !== setId),
          };
        }
        return exercise;
      })
    );
  };

  const removeExercise = (exerciseId: string) => {
    setWorkoutExercises(exercises => exercises.filter(exercise => exercise.id !== exerciseId));
  };

  const onSubmit = async (data: WorkoutFormData) => {
    if (workoutExercises.length === 0) {
      Alert.alert('Error', 'Please add at least one exercise to your workout');
      return;
    }

    try {
      setLoading(true);
      const workoutData: Partial<Workout> = {
        ...data,
        exercises: workoutExercises,
        date: new Date().toISOString(),
        completed: false,
      };

      const response = await api.post('/workouts', workoutData);
      if (response.data.success) {
        addNotification('Workout logged successfully!', 'success');
        navigation.goBack();
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to log workout');
    } finally {
      setLoading(false);
    }
  };

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      Object.values(intervalRefs.current).forEach(interval => {
        if (interval) clearInterval(interval);
      });
    };
  }, []);

  const getFilteredExercises = () => {
    let exercises = EXERCISES;
    
    if (selectedCategory) {
      exercises = exercises.filter((ex: Exercise) => ex.category === selectedCategory);
    }
    
    if (searchQuery) {
      exercises = searchExercises(searchQuery).filter((ex: Exercise) => 
        !selectedCategory || ex.category === selectedCategory
      );
    }
    
    return exercises;
  };

  const renderExerciseItem = ({ item }: { item: Exercise }) => (
    <TouchableOpacity
      style={styles.exerciseItem}
      onPress={() => addExerciseToWorkout(item)}
    >
      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseName}>{item.name}</Text>
        <Text style={styles.exerciseDetails}>
          {item.category} • {item.muscleGroups.join(', ')}
        </Text>
        {item.equipment && (
          <Text style={styles.exerciseEquipment}>Equipment: {item.equipment}</Text>
        )}
      </View>
      <Icon name="add-circle-outline" size={24} color="#0ea5e9" />
    </TouchableOpacity>
  );

  const renderWorkoutExercise = (workoutExercise: WorkoutExercise) => (
    <View key={workoutExercise.id} style={styles.workoutExerciseCard}>
      <View style={styles.exerciseHeader}>
        <View style={styles.exerciseTitleContainer}>
          <Text style={styles.exerciseTitle}>{workoutExercise.exercise.name}</Text>
          <Text style={styles.exerciseSubtitle}>
            {workoutExercise.exercise.category} • {workoutExercise.exercise.equipment || 'Bodyweight'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.removeExerciseButton}
          onPress={() => removeExercise(workoutExercise.id)}
        >
          <Icon name="close" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
      
      {/* Previous workout data display */}
      {previousWorkoutData[workoutExercise.exerciseId] && (
        <View style={styles.previousDataContainer}>
          <Text style={styles.previousDataTitle}>Previous Session:</Text>
          <View style={styles.previousDataValues}>
            <Text style={styles.previousDataText}>
              {previousWorkoutData[workoutExercise.exerciseId].reps} reps • {previousWorkoutData[workoutExercise.exerciseId].weight} lbs
            </Text>
          </View>
        </View>
      )}
      
      {/* Field labels header */}
      <View style={styles.setsHeader}>
        <Text style={styles.setsTitle}>Sets</Text>
        <TouchableOpacity
          style={styles.addSetButton}
          onPress={() => addSet(workoutExercise.id)}
        >
          <Icon name="add" size={16} color="#0ea5e9" />
          <Text style={styles.addSetText}>Add Set</Text>
        </TouchableOpacity>
      </View>
      
      {/* Column headers */}
      <View style={styles.columnHeaders}>
        <Text style={styles.columnHeader}>Set</Text>
        <View style={styles.columnHeaderContainer}>
          <Text style={styles.columnHeader}>Repetitions</Text>
        </View>
        <View style={styles.columnHeaderContainer}>
          <Text style={styles.columnHeader}>Weight</Text>
        </View>
        <View style={styles.columnHeaderContainer}>
          <Text style={styles.columnHeader}>Rest</Text>
        </View>
        <View style={styles.columnHeaderContainer}>
          <Text style={styles.columnHeader}></Text>
        </View>
      </View>
      
      {workoutExercise.sets.map((set: ExerciseSet, index) => (
        <View key={set.id} style={styles.setRow}>
          <Text style={styles.setNumber}>{index + 1}</Text>
          <View style={styles.setInputContainer}>
            <TextInput
              style={styles.setInput}
              value={set.reps.toString()}
              onChangeText={(value) => updateExerciseSet(workoutExercise.id, set.id, 'reps', parseInt(value) || 0)}
              keyboardType="numeric"
              placeholder="0"
            />
            <TextInput
              style={styles.setInput}
              value={set.weight?.toString() || ''}
              onChangeText={(value) => updateExerciseSet(workoutExercise.id, set.id, 'weight', parseFloat(value) || 0)}
              keyboardType="numeric"
              placeholder="0"
            />
            <TextInput
              style={[styles.setInput, styles.restInput]}
              value={set.restTime?.toString() || ''}
              onChangeText={(value) => updateExerciseSet(workoutExercise.id, set.id, 'restTime', parseInt(value) || 0)}
              keyboardType="numeric"
              placeholder="60"
            />
            {workoutExercise.sets.length > 1 && (
              <TouchableOpacity
                style={styles.removeSetButton}
                onPress={() => removeSet(workoutExercise.id, set.id)}
              >
                <Icon name="remove-circle-outline" size={20} color="#ef4444" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
      
      {/* Timer Interface */}
      {workoutExercise.sets.map((set: ExerciseSet, index) => {
        const timerKey = `${workoutExercise.id}-${set.id}`;
        const timer = activeTimers[timerKey];
        const totalSeconds = (timer?.minutes || 0) * 60 + (timer?.seconds || 0);
        const progress = timer?.isRunning ? (1 - totalSeconds / ((set?.restTime || 60))) : 0;
        
        return (
          <View key={`timer-${set.id}`} style={styles.timerContainer}>
            <Text style={styles.timerLabel}>Rest Timer</Text>
            
            {/* Circular Timer */}
            <View style={styles.circularTimerContainer}>
              <View style={styles.circularTimer}>
                <View 
                  style={[
                    styles.timerProgress,
                    {
                      transform: [{ rotate: `${progress * 360}deg` }]
                    }
                  ]}
                />
                <View style={styles.timerInnerCircle}>
                  <Text style={styles.timerText}>
                    {String(timer?.minutes || 0).padStart(2, '0')}:{String(timer?.seconds || 0).padStart(2, '0')}
                  </Text>
                </View>
              </View>
            </View>
            
            <TouchableOpacity
              style={[
                styles.startSetButton,
                !canStartSet(workoutExercise.id, set.id) && styles.startSetButtonDisabled,
                timer?.isRunning && styles.startSetButtonActive
              ]}
              onPress={() => {
                if (timer?.isRunning) {
                  stopTimer(workoutExercise.id, set.id);
                } else if (canStartSet(workoutExercise.id, set.id)) {
                  startTimer(workoutExercise.id, set.id);
                }
              }}
              disabled={!canStartSet(workoutExercise.id, set.id)}
            >
              <Icon 
                name={timer?.isRunning ? "pause" : "play-arrow"} 
                size={16} 
                color={timer?.isRunning ? "#fff" : canStartSet(workoutExercise.id, set.id) ? "#fff" : "#9ca3af"} 
              />
              <Text style={[
                styles.startSetText,
                !canStartSet(workoutExercise.id, set.id) && styles.startSetTextDisabled,
                timer?.isRunning && styles.startSetTextActive
              ]}>
                {timer?.isRunning ? 'Pause' : 'Start'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                const timerKey = `${workoutExercise.id}-${set.id}`;
                if (intervalRefs.current[timerKey]) {
                  clearInterval(intervalRefs.current[timerKey]);
                  delete intervalRefs.current[timerKey];
                }
                setActiveTimers(prev => ({
                  ...prev,
                  [timerKey]: {
                    minutes: 0,
                    seconds: 0,
                    isRunning: false
                  }
                }));
              }}
            >
              <Icon name="cancel" size={16} color="#ef4444" />
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Notification Bell */}
      <View style={styles.notificationContainer}>
        <TouchableOpacity
          style={styles.notificationBell}
          onPress={() => setShowNotifications(!showNotifications)}
        >
          <Icon name="notifications" size={24} color="#0ea5e9" />
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
                <Icon name="clear-all" size={16} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.notificationList} nestedScrollEnabled={false}>
              {notifications.length === 0 ? (
                <View style={styles.noNotifications}>
                  <Icon name="notifications-none" size={32} color="#9ca3af" />
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
                      <Icon 
                        name={
                          notification.type === 'success' ? 'check' :
                          notification.type === 'error' ? 'error' :
                          notification.type === 'warning' ? 'warning' : 'info'
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
                      <Icon name="close" size={16} color="#9ca3af" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        )}
      </View>

      <ScrollView style={styles.form}>
        <Text style={styles.label}>Workout Name (Optional)</Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={onChange}
              placeholder="e.g., Morning Upper Body"
            />
          )}
        />

        <Text style={styles.label}>Type</Text>
        <Controller
          control={control}
          name="type"
          render={({ field: { onChange, value } }) => (
            <View style={styles.typeContainer}>
              {['STRENGTH', 'CARDIO', 'MIXED', 'HIIT', 'YOGA'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    value === type && styles.typeButtonActive,
                  ]}
                  onPress={() => onChange(type)}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      value === type && styles.typeButtonTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />

        <View style={styles.exerciseSection}>
          <View style={styles.exerciseSectionHeader}>
            <Text style={styles.exerciseSectionTitle}>Exercises</Text>
            <TouchableOpacity
              style={styles.addExerciseButton}
              onPress={() => setShowExerciseModal(true)}
            >
              <Icon name="add" size={20} color="#fff" />
              <Text style={styles.addExerciseText}>Add Exercise</Text>
            </TouchableOpacity>
          </View>
          
          {workoutExercises.length === 0 ? (
            <View style={styles.emptyExercises}>
              <Text style={styles.emptyExercisesText}>No exercises added yet</Text>
              <Text style={styles.emptyExercisesSubtext}>Tap "Add Exercise" to get started</Text>
            </View>
          ) : (
            workoutExercises.map(renderWorkoutExercise)
          )}
        </View>

        <Text style={styles.label}>Notes</Text>
        <Controller
          control={control}
          name="notes"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, styles.textArea]}
              value={value}
              onChangeText={onChange}
              multiline
              numberOfLines={4}
              placeholder="Add any notes about your workout..."
            />
          )}
        />

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Saving...' : 'Save Workout'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showExerciseModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowExerciseModal(false)}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Exercise</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search exercises..."
            autoFocus
          />
          
          <ScrollView horizontal style={styles.categoryScrollView}>
            <View style={styles.categoryContainer}>
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  !selectedCategory && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(null)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    !selectedCategory && styles.categoryChipTextActive,
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              {EXERCISE_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category && styles.categoryChipActive,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedCategory === category && styles.categoryChipTextActive,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          
          <FlatList
            data={getFilteredExercises()}
            renderItem={renderExerciseItem}
            keyExtractor={(item) => item.id}
            style={styles.exerciseList}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  typeButton: {
    padding: 10,
    margin: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  typeButtonActive: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9',
  },
  typeButtonText: {
    color: '#333',
    fontSize: 14,
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  exerciseSection: {
    marginBottom: 20,
  },
  exerciseSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  exerciseSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  addExerciseButton: {
    flexDirection: 'row',
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  addExerciseText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  emptyExercises: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  emptyExercisesText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  emptyExercisesSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  workoutExerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  exerciseTitleContainer: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  exerciseSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  removeExerciseButton: {
    padding: 5,
  },
  setsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  setsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  addSetText: {
    fontSize: 14,
    color: '#0ea5e9',
    fontWeight: '600',
    marginLeft: 3,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  fieldLabelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  setNumberLabel: {
    width: 50,
  },
  fieldLabelContainer: {
    flex: 1,
    alignItems: 'center',
  },
  fieldLabelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  columnHeaders: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f8fafc',
  },
  columnHeader: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  columnHeaderContainer: {
    flex: 1,
    alignItems: 'center',
  },
  previousDataContainer: {
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 3,
    borderLeftColor: '#0ea5e9',
    padding: 12,
    marginBottom: 15,
    borderRadius: 6,
  },
  previousDataTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0369a1',
    marginBottom: 4,
  },
  previousDataValues: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previousDataText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0c4a6e',
  },
  timerContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 15,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  timerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 15,
  },
  circularTimerContainer: {
    marginBottom: 15,
  },
  circularTimer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  timerProgress: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: '#10b981',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  timerInnerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  startSetButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  startSetButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  startSetButtonActive: {
    backgroundColor: '#ef4444',
  },
  startSetText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  startSetTextDisabled: {
    color: '#d1d5db',
  },
  startSetTextActive: {
    color: '#fff',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
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
  setNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  setInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  setInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    marginRight: 8,
    fontSize: 14,
    backgroundColor: '#fff',
    textAlign: 'center',
  },
  restInput: {
    flex: 0.8,
  },
  removeSetButton: {
    padding: 5,
  },
  submitButton: {
    backgroundColor: '#0ea5e9',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  searchInput: {
    margin: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  categoryScrollView: {
    maxHeight: 60,
    marginBottom: 10,
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  categoryChip: {
    height: 36,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  categoryChipActive: {
    backgroundColor: '#0ea5e9',
  },
  categoryChipText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
    textAlign: 'center',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  exerciseList: {
    flex: 1,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  exerciseEquipment: {
    fontSize: 12,
    color: '#888',
  },
});

export default WorkoutLogScreen;

import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PersonalizedWorkoutPlan {
  name: string;
  description: string;
  duration: number;
  target: string;
  exercises: string[];
}

const WORKOUT_PLANS: PersonalizedWorkoutPlan[] = [
  {
    name: 'Push Day',
    description: 'Chest shoulders and triceps focused',
    duration: 45,
    target: 'Chest and Shoulders',
    exercises: [
      'Bench Press',
      'Incline Bench Press',
      'Dumbbell Fly',
      'Overhead Press',
      'Lateral Raise',
      'Tricep Pushdown',
    ],
  },
  {
    name: 'Pull Day',
    description: 'Back and biceps focused',
    duration: 45,
    target: 'Back and Biceps',
    exercises: [
      'Pull-ups',
      'Barbell Row',
      'Lat Pulldown',
      'Seated Cable Row',
      'Barbell Curl',
      'Hammer Curl',
    ],
  },
  {
    name: 'Leg Day',
    description: 'Full lower body workout',
    duration: 50,
    target: 'Legs',
    exercises: [
      'Squat',
      'Leg Press',
      'Romanian Deadlift',
      'Leg Curl',
      'Leg Extension',
      'Calf Raise',
    ],
  },
  {
    name: 'Full Body Strength',
    description: 'Compound movements for total body strength',
    duration: 60,
    target: 'Full Body',
    exercises: [
      'Deadlift',
      'Bench Press',
      'Squat',
      'Overhead Press',
      'Barbell Row',
      'Pull-ups',
    ],
  },
  {
    name: 'Core and Cardio',
    description: 'Core strength and cardio conditioning',
    duration: 30,
    target: 'Core and Cardio',
    exercises: [
      'Plank',
      'Crunches',
      'Russian Twist',
      'Mountain Climbers',
      'Burpees',
      'Jump Rope',
    ],
  },
  {
    name: 'Upper Body Hypertrophy',
    description: 'Volume focused upper body session',
    duration: 40,
    target: 'Shoulders and Arms',
    exercises: [
      'Dumbbell Fly',
      'Dumbbell Curl',
      'Tricep Pushdown',
      'Lateral Raise',
      'Face Pull',
      'Arnold Press',
    ],
  },
];

const PersonalizedWorkoutsScreen = () => {
  const navigation = useNavigation();

  const handleStartWorkout = (workoutPlan: PersonalizedWorkoutPlan) => {
    (navigation as any).navigate('WorkoutLog', {
      personalizedWorkout: {
        name: workoutPlan.name,
        exercises: workoutPlan.exercises,
      },
    });
  };

  const handleBackPress = () => {
    const stackState = navigation.getState();
    const hasStackHistory =
      typeof stackState?.index === 'number' &&
      Array.isArray(stackState.routes) &&
      stackState.index > 0 &&
      stackState.routes.length > 1;

    if (hasStackHistory) {
      navigation.goBack();
      return;
    }

    (navigation as any).navigate('WorkoutList');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="chevron-back" size={26} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personalized Workouts</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {WORKOUT_PLANS.map((workoutPlan) => (
          <View key={workoutPlan.name} style={styles.workoutCard}>
            <Text style={styles.workoutName}>{workoutPlan.name}</Text>
            <Text style={styles.workoutDescription}>{workoutPlan.description}</Text>

            <View style={styles.metaRow}>
              <View style={styles.metaPill}>
                <Text style={styles.metaLabel}>{workoutPlan.exercises.length} exercises</Text>
              </View>
              <View style={styles.metaPill}>
                <Text style={styles.metaLabel}>{workoutPlan.duration} min</Text>
              </View>
            </View>

            <Text style={styles.targetText}>Target: {workoutPlan.target}</Text>

            <TouchableOpacity
              style={styles.startButton}
              onPress={() => handleStartWorkout(workoutPlan)}
            >
              <Text style={styles.startButtonText}>Start Workout</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  backButton: {
    minWidth: 44,
    minHeight: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  workoutCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  workoutName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  workoutDescription: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  metaPill: {
    backgroundColor: '#e0f2fe',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  metaLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0369a1',
  },
  targetText: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 16,
  },
  startButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  startButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0ea5e9',
  },
});

export default PersonalizedWorkoutsScreen;

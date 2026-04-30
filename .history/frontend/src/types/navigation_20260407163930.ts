import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootStackParamList } from './RootStackParamList';

export type WorkoutStackParamList = {
  WorkoutList: undefined;
  WorkoutHistory: undefined;
  WorkoutDetail: { workoutId: string };
  WorkoutLog: { templateWorkout?: any };
};

export type WorkoutStackNavigationProp = StackNavigationProp<WorkoutStackParamList>;

export type MainTabParamList = {
  Home: undefined;
  Workouts: undefined;
  Progress: undefined;
  Streak: undefined;
  Settings: undefined;
};

export type MainTabNavigationProp = BottomTabNavigationProp<MainTabParamList>;

export type RootNavigationProp = StackNavigationProp<RootStackParamList>;

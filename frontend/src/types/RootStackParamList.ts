export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  Register: undefined;
  WorkoutList: undefined;
  WorkoutHistory: undefined;
  WorkoutDetail: { workoutId: string };
  WorkoutLog: { templateWorkout?: any };
  WorkoutForm: { workoutId?: string; workout?: any };
  Profile: undefined;
  Settings: undefined;
};

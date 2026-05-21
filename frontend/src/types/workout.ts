export interface LibraryExercise {
  id: string;
  name: string;
  category: string;
  muscleGroups: string[];
  equipment?: string;
  isActive?: boolean;
}

export interface ExerciseSet {
  id: string;
  reps: number;
  weight?: number;
  duration?: number;
  distance?: number;
  restTime?: number;
  completed?: boolean;
  setNumber: number;
}

export interface Exercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  libraryRecord?: LibraryExercise;
  exercise?: LibraryExercise;
  sets: ExerciseSet[];
  notes?: string;
  order: number;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  category?: string;
  equipment?: string;
  sets: ExerciseSet[];
  notes?: string;
  order: number;
  exercise?: LibraryExercise;
}

export interface Workout {
  id: string;
  name: string;
  date: string;
  type: 'strength' | 'cardio' | 'hiit' | 'yoga' | 'pilates' | 'crossfit' | 'sports' | 'other';
  exercises: Exercise[];
  duration?: number;
  notes?: string;
  isPublic?: boolean;
  totalVolume?: number;
  totalSets?: number;
  totalReps?: number;
  completed?: boolean;
  endTime?: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description?: string;
  exercises: Omit<Exercise, 'id' | 'sets'>[];
  type: string;
}

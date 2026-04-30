/**
 * Calculate personal bests for exercises and workouts
 * @param {Array} workouts - Array of workout objects
 * @param {string} userId - User ID (optional, for filtering)
 * @returns {object} Personal best information
 */
const calculatePersonalBests = (workouts, userId = null) => {
  if (!workouts || workouts.length === 0) {
    return {
      exerciseBests: {},
      workoutBests: {},
      recentBests: [],
      summary: {
        totalBests: 0,
        exercisesWithBests: 0,
        lastUpdated: null
      }
    };
  }

  // Filter workouts by user if userId is provided
  const userWorkouts = userId 
    ? workouts.filter(workout => workout.user && workout.user.toString() === userId.toString())
    : workouts;

  if (userWorkouts.length === 0) {
    return {
      exerciseBests: {},
      workoutBests: {},
      recentBests: [],
      summary: {
        totalBests: 0,
        exercisesWithBests: 0,
        lastUpdated: null
      }
    };
  }

  const exerciseBests = {};
  const workoutBests = {};
  const recentBests = [];

  // Calculate exercise personal bests
  userWorkouts.forEach(workout => {
    const workoutDate = new Date(workout.date);
    
    // Track workout-level bests
    if (!workoutBests.totalVolume || workout.totalVolume > workoutBests.totalVolume.value) {
      workoutBests.totalVolume = {
        value: workout.totalVolume,
        workoutId: workout._id,
        date: workoutDate,
        workoutName: workout.name
      };
    }

    if (!workoutBests.totalDuration || (workout.duration && workout.duration > workoutBests.totalDuration.value)) {
      workoutBests.totalDuration = {
        value: workout.duration,
        workoutId: workout._id,
        date: workoutDate,
        workoutName: workout.name
      };
    }

    if (!workoutBests.totalCalories || (workout.calories && workout.calories > workoutBests.totalCalories.value)) {
      workoutBests.totalCalories = {
        value: workout.calories,
        workoutId: workout._id,
        date: workoutDate,
        workoutName: workout.name
      };
    }

    // Calculate exercise-level bests
    if (workout.exercises && Array.isArray(workout.exercises)) {
      workout.exercises.forEach(exercise => {
        const exerciseName = exercise.name.toLowerCase().trim();
        
        if (!exerciseBests[exerciseName]) {
          exerciseBests[exerciseName] = {
            maxWeight: { value: 0, workoutId: workout._id, date: workoutDate, reps: exercise.reps },
            maxReps: { value: 0, workoutId: workout._id, date: workoutDate, weight: exercise.weight },
            maxVolume: { value: 0, workoutId: workout._id, date: workoutDate, sets: exercise.sets, weight: exercise.weight, reps: exercise.reps },
            maxSets: { value: 0, workoutId: workout._id, date: workoutDate, reps: exercise.reps, weight: exercise.weight },
            workoutCount: 0,
            lastPerformed: workoutDate
          };
        }

        // Update max weight
        if (exercise.weight > exerciseBests[exerciseName].maxWeight.value) {
          exerciseBests[exerciseName].maxWeight = {
            value: exercise.weight,
            workoutId: workout._id,
            date: workoutDate,
            reps: exercise.reps,
            sets: exercise.sets
          };
        }

        // Update max reps
        if (exercise.reps > exerciseBests[exerciseName].maxReps.value) {
          exerciseBests[exerciseName].maxReps = {
            value: exercise.reps,
            workoutId: workout._id,
            date: workoutDate,
            weight: exercise.weight,
            sets: exercise.sets
          };
        }

        // Update max volume for this exercise
        const exerciseVolume = exercise.sets * exercise.reps * exercise.weight;
        if (exerciseVolume > exerciseBests[exerciseName].maxVolume.value) {
          exerciseBests[exerciseName].maxVolume = {
            value: exerciseVolume,
            workoutId: workout._id,
            date: workoutDate,
            sets: exercise.sets,
            weight: exercise.weight,
            reps: exercise.reps
          };
        }

        // Update max sets
        if (exercise.sets > exerciseBests[exerciseName].maxSets.value) {
          exerciseBests[exerciseName].maxSets = {
            value: exercise.sets,
            workoutId: workout._id,
            date: workoutDate,
            reps: exercise.reps,
            weight: exercise.weight
          };
        }

        // Update workout count and last performed
        exerciseBests[exerciseName].workoutCount++;
        if (workoutDate > exerciseBests[exerciseName].lastPerformed) {
          exerciseBests[exerciseName].lastPerformed = workoutDate;
        }
      });
    }
  });

  // Calculate recent bests (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  userWorkouts
    .filter(workout => new Date(workout.date) >= thirtyDaysAgo)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach(workout => {
      if (workout.hasPersonalBest && workout.personalBestExercises) {
        workout.personalBestExercises.forEach(pb => {
          recentBests.push({
            exerciseName: pb.exerciseName,
            type: pb.type,
            value: pb.value,
            previousBest: pb.previousBest,
            improvement: pb.value - pb.previousBest,
            workoutId: workout._id,
            date: new Date(workout.date),
            workoutName: workout.name
          });
        });
      }
    });

  // Calculate summary statistics
  const totalBests = Object.keys(exerciseBests).length;
  const exercisesWithBests = Object.values(exerciseBests).filter(exercise => 
    exercise.maxWeight.value > 0 || exercise.maxReps.value > 0 || exercise.maxVolume.value > 0
  ).length;

  const summary = {
    totalBests,
    exercisesWithBests,
    lastUpdated: new Date(),
    workoutBestsCount: Object.keys(workoutBests).length,
    recentBestsCount: recentBests.length
  };

  return {
    exerciseBests,
    workoutBests,
    recentBests,
    summary
  };
};

/**
 * Check if new workout contains personal bests
 * @param {object} newWorkout - New workout object
 * @param {object} previousBests - Previous personal bests
 * @returns {object} Personal best achievements
 */
const checkPersonalBestAchievements = (newWorkout, previousBests) => {
  const achievements = [];
  const exerciseBests = previousBests.exerciseBests || {};
  const workoutBests = previousBests.workoutBests || {};

  // Check workout-level bests
  if (workoutBests.totalVolume && newWorkout.totalVolume > workoutBests.totalVolume.value) {
    achievements.push({
      type: 'workout',
      category: 'totalVolume',
      value: newWorkout.totalVolume,
      previousBest: workoutBests.totalVolume.value,
      improvement: newWorkout.totalVolume - workoutBests.totalVolume.value,
      message: `New personal best: Total volume ${newWorkout.totalVolume} kg!`
    });
  }

  if (workoutBests.totalDuration && newWorkout.duration && newWorkout.duration > workoutBests.totalDuration.value) {
    achievements.push({
      type: 'workout',
      category: 'totalDuration',
      value: newWorkout.duration,
      previousBest: workoutBests.totalDuration.value,
      improvement: newWorkout.duration - workoutBests.totalDuration.value,
      message: `New personal best: Duration ${newWorkout.duration} minutes!`
    });
  }

  if (workoutBests.totalCalories && newWorkout.calories && newWorkout.calories > workoutBests.totalCalories.value) {
    achievements.push({
      type: 'workout',
      category: 'totalCalories',
      value: newWorkout.calories,
      previousBest: workoutBests.totalCalories.value,
      improvement: newWorkout.calories - workoutBests.totalCalories.value,
      message: `New personal best: ${newWorkout.calories} calories burned!`
    });
  }

  // Check exercise-level bests
  if (newWorkout.exercises && Array.isArray(newWorkout.exercises)) {
    newWorkout.exercises.forEach(exercise => {
      const exerciseName = exercise.name.toLowerCase().trim();
      const previousExerciseBest = exerciseBests[exerciseName];

      if (previousExerciseBest) {
        // Check weight personal best
        if (exercise.weight > previousExerciseBest.maxWeight.value) {
          achievements.push({
            type: 'exercise',
            category: 'maxWeight',
            exerciseName: exercise.name,
            value: exercise.weight,
            previousBest: previousExerciseBest.maxWeight.value,
            improvement: exercise.weight - previousExerciseBest.maxWeight.value,
            message: `New personal best: ${exercise.name} - ${exercise.weight} kg!`
          });
        }

        // Check reps personal best
        if (exercise.reps > previousExerciseBest.maxReps.value) {
          achievements.push({
            type: 'exercise',
            category: 'maxReps',
            exerciseName: exercise.name,
            value: exercise.reps,
            previousBest: previousExerciseBest.maxReps.value,
            improvement: exercise.reps - previousExerciseBest.maxReps.value,
            message: `New personal best: ${exercise.name} - ${exercise.reps} reps!`
          });
        }

        // Check volume personal best for this exercise
        const exerciseVolume = exercise.sets * exercise.reps * exercise.weight;
        if (exerciseVolume > previousExerciseBest.maxVolume.value) {
          achievements.push({
            type: 'exercise',
            category: 'maxVolume',
            exerciseName: exercise.name,
            value: exerciseVolume,
            previousBest: previousExerciseBest.maxVolume.value,
            improvement: exerciseVolume - previousExerciseBest.maxVolume.value,
            message: `New personal best: ${exercise.name} - ${exerciseVolume} kg total volume!`
          });
        }

        // Check sets personal best
        if (exercise.sets > previousExerciseBest.maxSets.value) {
          achievements.push({
            type: 'exercise',
            category: 'maxSets',
            exerciseName: exercise.name,
            value: exercise.sets,
            previousBest: previousExerciseBest.maxSets.value,
            improvement: exercise.sets - previousExerciseBest.maxSets.value,
            message: `New personal best: ${exercise.name} - ${exercise.sets} sets!`
          });
        }
      }
    });
  }

  return {
    hasPersonalBests: achievements.length > 0,
    achievements,
    totalAchievements: achievements.length
  };
};

/**
 * Get personal best progress over time
 * @param {Array} workouts - Array of workout objects
 * @param {string} exerciseName - Exercise name to track
 * @param {string} metric - Metric to track ('weight', 'reps', 'volume')
 * @returns {Array} Progress data points
 */
const getPersonalBestProgress = (workouts, exerciseName, metric = 'weight') => {
  if (!workouts || workouts.length === 0 || !exerciseName) {
    return [];
  }

  const progressData = [];
  const exerciseLower = exerciseName.toLowerCase().trim();

  workouts
    .filter(workout => workout.exercises && Array.isArray(workout.exercises))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .forEach(workout => {
      const exercise = workout.exercises.find(e => e.name.toLowerCase().trim() === exerciseLower);
      
      if (exercise) {
        let value;
        switch (metric) {
          case 'weight':
            value = exercise.weight;
            break;
          case 'reps':
            value = exercise.reps;
            break;
          case 'volume':
            value = exercise.sets * exercise.reps * exercise.weight;
            break;
          default:
            value = exercise.weight;
        }

        progressData.push({
          date: new Date(workout.date),
          value,
          workoutId: workout._id,
          workoutName: workout.name,
          sets: exercise.sets,
          reps: exercise.reps,
          weight: exercise.weight
        });
      }
    });

  return progressData;
};

/**
 * Calculate personal best statistics
 * @param {object} personalBests - Personal bests object
 * @returns {object} Statistics
 */
const getPersonalBestStats = (personalBests) => {
  if (!personalBests || !personalBests.exerciseBests) {
    return {
      totalExercises: 0,
      exercisesWithData: 0,
      averageMaxWeight: 0,
      averageMaxReps: 0,
      averageMaxVolume: 0,
      topExercises: []
    };
  }

  const exercises = Object.values(personalBests.exerciseBests);
  const exercisesWithData = exercises.filter(exercise => 
    exercise.maxWeight.value > 0 || exercise.maxReps.value > 0 || exercise.maxVolume.value > 0
  );

  const totalWeight = exercisesWithData.reduce((sum, exercise) => sum + exercise.maxWeight.value, 0);
  const totalReps = exercisesWithData.reduce((sum, exercise) => sum + exercise.maxReps.value, 0);
  const totalVolume = exercisesWithData.reduce((sum, exercise) => sum + exercise.maxVolume.value, 0);

  // Get top exercises by different metrics
  const topByWeight = [...exercisesWithData]
    .sort((a, b) => b.maxWeight.value - a.maxWeight.value)
    .slice(0, 5)
    .map(exercise => ({
      name: Object.keys(personalBests.exerciseBests).find(key => personalBests.exerciseBests[key] === exercise),
      value: exercise.maxWeight.value,
      date: exercise.maxWeight.date
    }));

  const topByVolume = [...exercisesWithData]
    .sort((a, b) => b.maxVolume.value - a.maxVolume.value)
    .slice(0, 5)
    .map(exercise => ({
      name: Object.keys(personalBests.exerciseBests).find(key => personalBests.exerciseBests[key] === exercise),
      value: exercise.maxVolume.value,
      date: exercise.maxVolume.date
    }));

  return {
    totalExercises: exercises.length,
    exercisesWithData: exercisesWithData.length,
    averageMaxWeight: exercisesWithData.length > 0 ? Math.round(totalWeight / exercisesWithData.length) : 0,
    averageMaxReps: exercisesWithData.length > 0 ? Math.round(totalReps / exercisesWithData.length) : 0,
    averageMaxVolume: exercisesWithData.length > 0 ? Math.round(totalVolume / exercisesWithData.length) : 0,
    topExercises: {
      byWeight: topByWeight,
      byVolume: topByVolume
    },
    workoutBests: personalBests.workoutBests || {}
  };
};

module.exports = {
  calculatePersonalBests,
  checkPersonalBestAchievements,
  getPersonalBestProgress,
  getPersonalBestStats
};

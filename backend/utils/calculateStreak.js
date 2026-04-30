/**
 * Calculate workout streak based on workout dates
 * @param {Array} workoutDates - Array of workout dates
 * @returns {object} Streak information
 */
const calculateStreak = (workoutDates) => {
  if (!workoutDates || workoutDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastWorkoutDate: null,
      streakHistory: []
    };
  }

  // Sort dates in descending order (newest first)
  const sortedDates = workoutDates
    .map(date => new Date(date))
    .sort((a, b) => b - a);

  // Normalize dates to start of day for accurate comparison
  const normalizedDates = sortedDates.map(date => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  });

  // Remove duplicates (same day workouts)
  const uniqueDates = [...new Set(normalizedDates.map(date => date.getTime()))]
    .map(time => new Date(time))
    .sort((a, b) => b - a);

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let streakHistory = [];
  let streakStart = null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if there's a workout today or yesterday to continue streak
  const lastWorkoutDate = uniqueDates[0];
  const dayDiff = Math.floor((today - lastWorkoutDate) / (1000 * 60 * 60 * 24));

  // If last workout was more than 1 day ago, streak is broken
  if (dayDiff > 1) {
    currentStreak = 0;
  } else {
    // Calculate current streak
    currentStreak = 1;
    streakStart = lastWorkoutDate;

    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const currentDate = uniqueDates[i];
      const nextDate = uniqueDates[i + 1];
      const diffDays = Math.floor((currentDate - nextDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day
        currentStreak++;
        streakStart = nextDate;
      } else {
        // Break in streak
        if (streakStart) {
          streakHistory.push({
            start: streakStart,
            end: currentDate,
            length: currentStreak
          });
        }
        
        longestStreak = Math.max(longestStreak, currentStreak);
        currentStreak = 1;
        streakStart = nextDate;
      }
    }

    // Add the final streak
    if (streakStart) {
      streakHistory.push({
        start: streakStart,
        end: uniqueDates[uniqueDates.length - 1],
        length: currentStreak
      });
    }

    longestStreak = Math.max(longestStreak, currentStreak);
  }

  // Calculate overall longest streak from history
  if (streakHistory.length > 0) {
    const historicalLongest = Math.max(...streakHistory.map(streak => streak.length));
    longestStreak = Math.max(longestStreak, historicalLongest);
  }

  return {
    currentStreak,
    longestStreak,
    lastWorkoutDate: lastWorkoutDate || null,
    streakHistory,
    daysSinceLastWorkout: dayDiff,
    isActive: currentStreak > 0
  };
};

/**
 * Check if streak is active (user worked out today or yesterday)
 * @param {Date} lastWorkoutDate - Date of last workout
 * @returns {boolean} True if streak is active
 */
const isStreakActive = (lastWorkoutDate) => {
  if (!lastWorkoutDate) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastWorkout = new Date(lastWorkoutDate);
  lastWorkout.setHours(0, 0, 0, 0);

  const dayDiff = Math.floor((today - lastWorkout) / (1000 * 60 * 60 * 24));

  return dayDiff <= 1;
};

/**
 * Get next streak milestone
 * @param {number} currentStreak - Current streak count
 * @returns {number|null} Next milestone or null if no milestones left
 */
const getNextStreakMilestone = (currentStreak) => {
  const milestones = [7, 14, 30, 60, 90, 100, 200, 365];
  
  for (const milestone of milestones) {
    if (currentStreak < milestone) {
      return milestone;
    }
  }
  
  return null;
};

/**
 * Get streak milestone achievements
 * @param {number} currentStreak - Current streak count
 * @returns {Array} Array of achieved milestones
 */
const getStreakMilestones = (currentStreak) => {
  const milestones = [7, 14, 30, 60, 90, 100, 200, 365];
  
  return milestones.filter(milestone => currentStreak >= milestone);
};

/**
 * Calculate streak freeze eligibility (for premium users)
 * @param {number} currentStreak - Current streak count
 * @param {number} freezeDaysAvailable - Available freeze days
 * @param {Date} lastWorkoutDate - Date of last workout
 * @returns {object} Freeze eligibility information
 */
const calculateFreezeEligibility = (currentStreak, freezeDaysAvailable, lastWorkoutDate) => {
  if (!lastWorkoutDate || currentStreak === 0 || freezeDaysAvailable === 0) {
    return {
      eligible: false,
      reason: 'No active streak or no freeze days available'
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastWorkout = new Date(lastWorkoutDate);
  lastWorkout.setHours(0, 0, 0, 0);

  const dayDiff = Math.floor((today - lastWorkout) / (1000 * 60 * 60 * 24));

  // Can use freeze day if missed 1 day and have active streak
  if (dayDiff === 1 && currentStreak > 0) {
    return {
      eligible: true,
      daysMissed: dayDiff,
      freezeDaysAvailable,
      message: 'You can use a freeze day to maintain your streak'
    };
  }

  return {
    eligible: false,
    reason: dayDiff > 1 ? 'Too many days missed' : 'No freeze needed'
  };
};

/**
 * Predict streak continuation
 * @param {Array} workoutDates - Array of workout dates
 * @param {number} daysToPredict - Number of days to predict ahead
 * @returns {object} Prediction information
 */
const predictStreakContinuation = (workoutDates, daysToPredict = 7) => {
  if (!workoutDates || workoutDates.length < 3) {
    return {
      reliable: false,
      prediction: null,
      confidence: 0,
      message: 'Insufficient data for prediction'
    };
  }

  // Calculate workout frequency (workouts per week)
  const sortedDates = workoutDates
    .map(date => new Date(date))
    .sort((a, b) => a - b);

  const dateRange = (sortedDates[sortedDates.length - 1] - sortedDates[0]) / (1000 * 60 * 60 * 24);
  const frequency = sortedDates.length / (dateRange / 7); // workouts per week

  // Calculate consistency score
  const dayGaps = [];
  for (let i = 1; i < sortedDates.length; i++) {
    const gap = Math.floor((sortedDates[i] - sortedDates[i - 1]) / (1000 * 60 * 60 * 24));
    dayGaps.push(gap);
  }

  const avgGap = dayGaps.reduce((sum, gap) => sum + gap, 0) / dayGaps.length;
  const consistencyScore = Math.max(0, 1 - (avgGap / 7)); // Higher score for more consistent workouts

  // Predict likelihood of maintaining streak
  const confidence = Math.min(consistencyScore * (frequency / 3), 1); // Cap at 100%
  const reliable = confidence > 0.5;

  return {
    reliable,
    prediction: confidence > 0.7 ? 'high' : confidence > 0.4 ? 'moderate' : 'low',
    confidence: Math.round(confidence * 100),
    frequency: Math.round(frequency * 10) / 10,
    consistencyScore: Math.round(consistencyScore * 100),
    message: confidence > 0.7 ? 'High likelihood of maintaining streak' : 
             confidence > 0.4 ? 'Moderate likelihood of maintaining streak' : 
             'Low likelihood of maintaining streak'
  };
};

module.exports = {
  calculateStreak,
  isStreakActive,
  getNextStreakMilestone,
  getStreakMilestones,
  calculateFreezeEligibility,
  predictStreakContinuation
};

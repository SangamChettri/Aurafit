const fs = require('fs');

const missingCode = `
  useEffect(() => {
    const fetchData = async () => {
      try {
        setExercisesLoading(true);
        // Fetch exercises and constants in parallel
        const [exerciseRes, contentRes] = await Promise.allSettled([
          exerciseApi.getExercises(),
          contentApi.getConstants()
        ]);

        if (exerciseRes.status === 'fulfilled' && (exerciseRes.value).success) {
          const formattedExercises = (exerciseRes.value).data.map((ex) => ({
            id: ex.id.toString(),
            name: ex.name,
            category: ex.category || 'Other',
            muscleGroup: ex.muscleGroup || 'FullBody',
            muscleGroups: [ex.muscleGroup || 'FullBody'],
            equipment: ex.equipment || 'Bodyweight'
          }));
          setExercises(formattedExercises);
        }

        if (contentRes.status === 'fulfilled' && (contentRes.value).success) {
          setCategories((contentRes.value).data.muscleGroups || FALLBACK_CATEGORIES);
        } else {
          setCategories(FALLBACK_CATEGORIES);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setCategories(FALLBACK_CATEGORIES);
      } finally {
        setExercisesLoading(false);
      }
    };

    fetchData();
  }, []);

  const addExerciseToWorkout = (exercise) => {
    // Create exercise with default values first
    const newWorkoutExercise = {
      id: Date.now().toString(),
      exerciseId: exercise.id.toString(),
      exerciseName: exercise.name,
      category: exercise.category,
      equipment: exercise.equipment,
      sets: [
        {
          id: Date.now().toString(),
          reps: 0,
          weight: 0,
          restTime: 60,
          completed: false,
          setNumber: 1,
        },
      ],
      order: workoutExercises.length,
    };

    // Add exercise to workout immediately
    setWorkoutExercises([...workoutExercises, newWorkoutExercise]);

    // Then fetch previous workout data and update the exercise
    fetchPreviousWorkoutDataAndUpdate(exercise.id.toString(), newWorkoutExercise.id);

    setShowExerciseModal(false);
    setSearchQuery('');
    setSelectedCategory(null);

    addNotification('Added ' + exercise.name + ' to workout', 'success');
  };

  const fetchPreviousWorkoutDataAndUpdate = async (exerciseId, workoutExerciseId) => {
    try {
      const response = await api.get('/workouts/exercise/' + exerciseId + '/previous');

      if (response.data.success && response.data.data) {
        // Update the exercise with previous data
        setWorkoutExercises(prev => prev.map(ex => {
          if (ex.id === workoutExerciseId) {
            return {
              ...ex,
              sets: ex.sets.map(set => ({
                ...set,
                reps: response.data.data.reps,
                weight: response.data.data.weight
              }))
            };
          }
          return ex;
        }));

        // Also update the previousWorkoutData state for display
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

  const startTimer = (exerciseId, setId) => {
    const timerKey = exerciseId + '-' + setId;

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

  const stopTimer = (exerciseId, setId) => {
    const timerKey = exerciseId + '-' + setId;

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

  const updateTimerTime = (exerciseId, setId, field, value) => {
    const timerKey = exerciseId + '-' + setId;
    setActiveTimers(prev => ({
      ...prev,
      [timerKey]: {
        ...prev[timerKey],
        [field]: Math.max(0, Math.min(field === 'minutes' ? 59 : 59, value))
      }
    }));
  };

  const canStartSet = (exerciseId, setId) => {
    const workoutExercise = workoutExercises.find(ex => ex.id === exerciseId);
    const set = workoutExercise?.sets.find(s => s.id === setId);
    return set && set.reps > 0 && (set.weight ?? 0) >= 0;
  };

  const addNotification = (message, type = 'info') => {
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

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const updateExerciseSet = (exerciseId, setId, field, value) => {
    setWorkoutExercises(exercises =>
      exercises.map(exercise => {
        if (exercise.id === exerciseId) {
          return {
            ...exercise,
            sets: exercise.sets.map((set) =>
              set.id === setId ? { ...set, [field]: value } : set
            ),
          };
        }
        return exercise;
      })
    );
  };

  const addSet = (exerciseId) => {
    setWorkoutExercises(exercises =>
      exercises.map(exercise => {
        if (exercise.id === exerciseId) {
          const lastSet = exercise.sets[exercise.sets.length - 1];
          const newSet = {
            id: Date.now().toString(),
            reps: lastSet?.reps || 0,
            weight: lastSet?.weight || 0,
            restTime: lastSet?.restTime || 60,
            completed: false,
            setNumber: exercise.sets.length + 1,
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

  const removeSet = (exerciseId, setId) => {
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

  const removeExercise = (exerciseId) => {
    setWorkoutExercises(exercises => exercises.filter(exercise => exercise.id !== exerciseId));
  };

  const onSubmit = async (data) => {
    if (workoutExercises.length === 0) {
      Alert.alert('Error', 'Please add at least one exercise to your workout');
      return;
    }

    try {
      setLoading(true);
      const workoutData = {
        ...data,
        type: data.type.toLowerCase(),
        exercises: workoutExercises.map(we => ({
          id: we.id,
          exerciseId: we.exerciseId,
          exerciseName: we.exerciseName,
          libraryRecord: we.category || we.equipment ? {
            id: we.exerciseId,
            name: we.exerciseName,
            category: we.category || 'General',
            muscleGroups: [],
            equipment: we.equipment,
            isActive: true
          } : undefined,
          sets: we.sets,
          order: we.order || 0
        })),
        date: new Date().toISOString(),
        completed: false,
      };

      const response = await api.post('/workouts', workoutData);
      if (response.data.success) {
        addNotification('Workout logged successfully!', 'success');
        navigation.goBack();
      }
    } catch (error) {
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
    let filteredExercises = exercises;

    if (selectedCategory) {
      filteredExercises = filteredExercises.filter((ex) =>
        ex.muscleGroup === selectedCategory || (ex.muscleGroups && ex.muscleGroups.includes(selectedCategory))
      );
    }

    if (searchQuery) {
      filteredExercises = filteredExercises.filter((ex) =>
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (!selectedCategory || ex.muscleGroup === selectedCategory || (ex.muscleGroups && ex.muscleGroups.includes(selectedCategory)))
      );
    }

    return filteredExercises;
  };

  const renderExerciseItem = ({ item }) => (
    <TouchableOpacity
      style={styles.exerciseItem}
      onPress={() => addExerciseToWorkout(item)}
    >
      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseName}>{item.name}</Text>
        <Text style={styles.exerciseDetails}>
          {item.category || 'General'}
          {' • '}
          {(item.muscleGroup === 'FullBody' ? 'Full Body' : item.muscleGroup) || 'Full Body'}
        </Text>
        {item.equipment && (
          <Text style={styles.exerciseEquipment}>
            Equipment: {item.equipment}
          </Text>
        )}
      </View>
      <Icon name="add-circle-outline" size={24} color="#0ea5e9" />
    </TouchableOpacity>
  );
`;

const filePath = 'frontend/src/screens/workout/WorkoutLogScreen.tsx';
let lines = fs.readFileSync(filePath, 'utf8').split('\n');

const missingLines = missingCode.split('\n').map(l => l + '\r');

// Find where to insert
// 168 is   }, [personalizedWorkout, templateWorkout, exercises, setValue]);
// 169 is         )}\r
lines.splice(168, 5, ...missingLines);

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log('Restored correctly');

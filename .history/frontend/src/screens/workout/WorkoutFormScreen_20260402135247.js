import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import workoutApi from '../../api/workoutApi';
import { useFormApi } from '../../hooks/useApi';

const WorkoutFormScreen = ({ route }) => {
  const navigation = useNavigation();
  const { workoutId, workout: existingWorkout } = route.params || {};
  
  const isEditing = !!workoutId || !!existingWorkout;
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'STRENGTH',
    date: new Date().toISOString(),
    exercises: [],
    duration: '',
    calories: '',
    notes: '',
  });
  
  const [validationErrors, setValidationErrors] = useState({});

  // Initialize form with existing workout data if editing
  useEffect(() => {
    if (isEditing && existingWorkout) {
      setFormData({
        name: existingWorkout.name || '',
        type: existingWorkout.type || 'STRENGTH',
        date: existingWorkout.date || new Date().toISOString(),
        exercises: existingWorkout.exercises || [],
        duration: existingWorkout.duration?.toString() || '',
        calories: existingWorkout.calories?.toString() || '',
        notes: existingWorkout.notes || '',
      });
    }
  }, [isEditing, existingWorkout]);

  // Form submission hook
  const { loading, success, submit, error } = useFormApi(
    isEditing 
      ? (data) => workoutApi.updateWorkout(workoutId, data)
      : workoutApi.createWorkout,
    {
      onSuccess: () => {
        Alert.alert(
          'Success',
          isEditing ? 'Workout updated successfully!' : 'Workout created successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      },
    }
  );

  /**
   * Handle form input changes
   */
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  /**
   * Add new exercise to the workout
   */
  const addExercise = () => {
    const newExercise = {
      id: Date.now().toString(),
      name: '',
      sets: 3,
      reps: 10,
      weight: 0,
    };
    
    setFormData(prev => ({
      ...prev,
      exercises: [...prev.exercises, newExercise],
    }));
  };

  /**
   * Update exercise data
   */
  const updateExercise = (exerciseId, field, value) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.map(exercise =>
        exercise.id === exerciseId
          ? { ...exercise, [field]: value }
          : exercise
      ),
    }));
  };

  /**
   * Remove exercise from workout
   */
  const removeExercise = (exerciseId) => {
    Alert.alert(
      'Remove Exercise',
      'Are you sure you want to remove this exercise?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setFormData(prev => ({
              ...prev,
              exercises: prev.exercises.filter(exercise => exercise.id !== exerciseId),
            }));
          },
        },
      ]
    );
  };

  /**
   * Validate form inputs
   */
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Workout name is required';
    }

    if (!formData.exercises || formData.exercises.length === 0) {
      errors.exercises = 'At least one exercise is required';
    } else {
      // Validate each exercise
      formData.exercises.forEach((exercise, index) => {
        if (!exercise.name.trim()) {
          errors[`exercise_${index}_name`] = 'Exercise name is required';
        }
        if (exercise.sets < 1 || exercise.sets > 50) {
          errors[`exercise_${index}_sets`] = 'Sets must be between 1 and 50';
        }
        if (exercise.reps < 1 || exercise.reps > 200) {
          errors[`exercise_${index}_reps`] = 'Reps must be between 1 and 200';
        }
        if (exercise.weight < 0 || exercise.weight > 2000) {
          errors[`exercise_${index}_weight`] = 'Weight must be between 0 and 2000';
        }
      });
    }

    if (formData.duration && (formData.duration < 1 || formData.duration > 480)) {
      errors.duration = 'Duration must be between 1 and 480 minutes';
    }

    if (formData.calories && (formData.calories < 0 || formData.calories > 5000)) {
      errors.calories = 'Calories must be between 0 and 5000';
    }

    if (formData.notes && formData.notes.length > 500) {
      errors.notes = 'Notes cannot exceed 500 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    // Prepare submission data
    const submissionData = {
      name: formData.name.trim(),
      type: formData.type,
      date: formData.date,
      exercises: formData.exercises.map(exercise => ({
        name: exercise.name.trim(),
        sets: parseInt(exercise.sets),
        reps: parseInt(exercise.reps),
        weight: parseFloat(exercise.weight),
      })),
      duration: formData.duration ? parseInt(formData.duration) : undefined,
      calories: formData.calories ? parseInt(formData.calories) : undefined,
      notes: formData.notes.trim() || undefined,
    };

    await submit(submissionData);
  };

  /**
   * Workout type options
   */
  const workoutTypes = [
    { value: 'STRENGTH', label: 'Strength', icon: 'fitness' },
    { value: 'CARDIO', label: 'Cardio', icon: 'walk' },
    { value: 'MIXED', label: 'Mixed', icon: 'refresh' },
    { value: 'HIIT', label: 'HIIT', icon: 'flash' },
    { value: 'YOGA', label: 'Yoga', icon: 'flower' },
  ];

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {isEditing ? 'Edit Workout' : 'New Workout'}
        </Text>
        <TouchableOpacity 
          onPress={handleSubmit} 
          disabled={loading}
          style={styles.saveButton}
        >
          {loading ? (
            <ActivityIndicator color="#3b82f6" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Workout Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Workout Name *</Text>
          <TextInput
            style={[
              styles.input,
              validationErrors.name ? styles.inputError : null,
            ]}
            value={formData.name}
            onChangeText={(value) => handleInputChange('name', value)}
            placeholder="e.g., Morning Strength Training"
            editable={!loading}
          />
          {validationErrors.name && (
            <Text style={styles.errorText}>{validationErrors.name}</Text>
          )}
        </View>

        {/* Workout Type */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Workout Type</Text>
          <View style={styles.typeContainer}>
            {workoutTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.typeOption,
                  formData.type === type.value ? styles.typeOptionSelected : null,
                ]}
                onPress={() => handleInputChange('type', type.value)}
                disabled={loading}
              >
                <Text style={styles.typeIcon}>{type.icon}</Text>
                <Text style={[
                  styles.typeLabel,
                  formData.type === type.value ? styles.typeLabelSelected : null,
                ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date</Text>
          <TextInput
            style={styles.input}
            value={new Date(formData.date).toLocaleDateString()}
            editable={false}
          />
        </View>

        {/* Exercises Section */}
        <View style={styles.inputGroup}>
          <View style={styles.sectionHeader}>
            <Text style={styles.label}>Exercises *</Text>
            <TouchableOpacity onPress={addExercise} disabled={loading}>
              <Text style={styles.addButton}>+ Add Exercise</Text>
            </TouchableOpacity>
          </View>
          
          {validationErrors.exercises && (
            <Text style={styles.errorText}>{validationErrors.exercises}</Text>
          )}

          {formData.exercises.map((exercise, index) => (
            <View key={exercise.id} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseNumber}>Exercise {index + 1}</Text>
                <TouchableOpacity 
                  onPress={() => removeExercise(exercise.id)}
                  disabled={loading}
                >
                  <Text style={styles.removeButton}>Remove</Text>
                </TouchableOpacity>
              </View>

              {/* Exercise Name */}
              <TextInput
                style={[
                  styles.exerciseInput,
                  validationErrors[`exercise_${index}_name`] ? styles.inputError : null,
                ]}
                value={exercise.name}
                onChangeText={(value) => updateExercise(exercise.id, 'name', value)}
                placeholder="Exercise name"
                editable={!loading}
              />
              {validationErrors[`exercise_${index}_name`] && (
                <Text style={styles.errorText}>
                  {validationErrors[`exercise_${index}_name`]}
                </Text>
              )}

              {/* Sets, Reps, Weight */}
              <View style={styles.exerciseDetails}>
                <View style={styles.detailInput}>
                  <Text style={styles.detailLabel}>Sets</Text>
                  <TextInput
                    style={[
                      styles.detailTextInput,
                      validationErrors[`exercise_${index}_sets`] ? styles.inputError : null,
                    ]}
                    value={exercise.sets.toString()}
                    onChangeText={(value) => updateExercise(exercise.id, 'sets', value)}
                    keyboardType="numeric"
                    editable={!loading}
                  />
                </View>

                <View style={styles.detailInput}>
                  <Text style={styles.detailLabel}>Reps</Text>
                  <TextInput
                    style={[
                      styles.detailTextInput,
                      validationErrors[`exercise_${index}_reps`] ? styles.inputError : null,
                    ]}
                    value={exercise.reps.toString()}
                    onChangeText={(value) => updateExercise(exercise.id, 'reps', value)}
                    keyboardType="numeric"
                    editable={!loading}
                  />
                </View>

                <View style={styles.detailInput}>
                  <Text style={styles.detailLabel}>Weight (kg)</Text>
                  <TextInput
                    style={[
                      styles.detailTextInput,
                      validationErrors[`exercise_${index}_weight`] ? styles.inputError : null,
                    ]}
                    value={exercise.weight.toString()}
                    onChangeText={(value) => updateExercise(exercise.id, 'weight', value)}
                    keyboardType="numeric"
                    editable={!loading}
                  />
                </View>
              </View>

              {validationErrors[`exercise_${index}_sets`] && (
                <Text style={styles.errorText}>
                  {validationErrors[`exercise_${index}_sets`]}
                </Text>
              )}
              {validationErrors[`exercise_${index}_reps`] && (
                <Text style={styles.errorText}>
                  {validationErrors[`exercise_${index}_reps`]}
                </Text>
              )}
              {validationErrors[`exercise_${index}_weight`] && (
                <Text style={styles.errorText}>
                  {validationErrors[`exercise_${index}_weight`]}
                </Text>
              )}
            </View>
          ))}

          {formData.exercises.length === 0 && (
            <View style={styles.emptyExercises}>
              <Text style={styles.emptyText}>No exercises added yet</Text>
              <TouchableOpacity onPress={addExercise} disabled={loading}>
                <Text style={styles.addFirstExercise}>+ Add your first exercise</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Optional Fields */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Duration (minutes)</Text>
          <TextInput
            style={[
              styles.input,
              validationErrors.duration ? styles.inputError : null,
            ]}
            value={formData.duration}
            onChangeText={(value) => handleInputChange('duration', value)}
            placeholder="e.g., 45"
            keyboardType="numeric"
            editable={!loading}
          />
          {validationErrors.duration && (
            <Text style={styles.errorText}>{validationErrors.duration}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Calories Burned</Text>
          <TextInput
            style={[
              styles.input,
              validationErrors.calories ? styles.inputError : null,
            ]}
            value={formData.calories}
            onChangeText={(value) => handleInputChange('calories', value)}
            placeholder="e.g., 300"
            keyboardType="numeric"
            editable={!loading}
          />
          {validationErrors.calories && (
            <Text style={styles.errorText}>{validationErrors.calories}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              validationErrors.notes ? styles.inputError : null,
            ]}
            value={formData.notes}
            onChangeText={(value) => handleInputChange('notes', value)}
            placeholder="Any notes about this workout..."
            multiline
            numberOfLines={3}
            editable={!loading}
          />
          {validationErrors.notes && (
            <Text style={styles.errorText}>{validationErrors.notes}</Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  cancelButton: {
    fontSize: 16,
    color: '#6b7280',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    marginTop: 4,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#1f2937',
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fee2e2',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  typeOption: {
    width: '30%',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  typeOptionSelected: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  typeIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  typeLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  typeLabelSelected: {
    color: '#3b82f6',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  removeButton: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '500',
  },
  exerciseInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#fff',
    color: '#1f2937',
    marginBottom: 8,
  },
  exerciseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailInput: {
    width: '30%',
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  detailTextInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#fff',
    color: '#1f2937',
    textAlign: 'center',
  },
  emptyExercises: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  addFirstExercise: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
});

export default WorkoutFormScreen;

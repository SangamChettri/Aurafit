import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useApi } from '../../hooks/useApi';
import workoutApi from '../../api/workoutApi';
import { format } from 'date-fns';

const WorkoutHistoryScreen = () => {
  const navigation = useNavigation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch workouts with pagination
  const {
    data: workoutsData,
    loading,
    error,
    execute: fetchWorkouts,
    reset,
  } = useApi(
    (params) => workoutApi.getWorkouts(params),
    {
      immediate: false,
      showErrorAlert: false,
    }
  );

  // Delete workout API
  const { loading: deleting, execute: deleteWorkout } = useApi(workoutApi.deleteWorkout);

  // State for pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Initial data
  const [workouts, setWorkouts] = useState([]);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    if (workoutsData) {
      if (page === 1) {
        setWorkouts(workoutsData.workouts || []);
      } else {
        setWorkouts(prev => [...prev, ...(workoutsData.workouts || [])]);
      }
      setPagination(workoutsData.pagination);
      setHasMore(workoutsData.pagination?.hasNext || false);
    }
  }, [workoutsData, page]);

  // Initial load
  useEffect(() => {
    loadWorkouts(1, false);
  }, []);

  /**
   * Load workouts with filters
   */
  const loadWorkouts = async (pageNum = 1, append = false) => {
    if (!append) {
      setPage(1);
      reset();
    }

    const params = {
      page: pageNum,
      limit: 10,
      sortBy: 'date',
      sortOrder: 'desc',
    };

    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }

    if (filterType !== 'all') {
      params.type = filterType;
    }

    await fetchWorkouts(params);
  };

  /**
   * Handle refresh
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWorkouts(1, false);
    setRefreshing(false);
  };

  /**
   * Load more workouts
   */
  const handleLoadMore = async () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      await loadWorkouts(nextPage, true);
    }
  };

  /**
   * Handle workout press
   */
  const handleWorkoutPress = (workout) => {
    navigation.navigate('WorkoutDetail', { workoutId: workout.id });
  };

  /**
   * Handle workout edit
   */
  const handleEditWorkout = (workout) => {
    navigation.navigate('WorkoutForm', { workoutId: workout.id, workout });
  };

  /**
   * Handle workout delete
   */
  const handleDeleteWorkout = (workout) => {
    setSelectedWorkout(workout);
    setShowDeleteModal(true);
  };

  /**
   * Confirm workout deletion
   */
  const confirmDeleteWorkout = async () => {
    if (!selectedWorkout) return;

    const result = await deleteWorkout(selectedWorkout.id);
    
    if (result.success) {
      // Remove workout from list
      setWorkouts(prev => prev.filter(w => w.id !== selectedWorkout.id));
      setShowDeleteModal(false);
      setSelectedWorkout(null);
      
      Alert.alert('Success', 'Workout deleted successfully');
    } else {
      Alert.alert('Error', result.error || 'Failed to delete workout');
    }
  };

  /**
   * Format workout date
   */
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  /**
   * Get workout type icon
   */
  const getWorkoutTypeIcon = (type) => {
    const icons = {
      STRENGTH: 'fitness',
      CARDIO: 'walk',
      MIXED: 'refresh',
      HIIT: 'flash',
      YOGA: 'flower',
    };
    return icons[type] || 'fitness';
  };

  /**
   * Calculate total volume for workout
   */
  const getTotalVolume = (workout) => {
    if (workout.totalVolume) return workout.totalVolume;
    
    return workout.exercises?.reduce((total, exercise) => {
      return total + (exercise.sets * exercise.reps * exercise.weight || 0);
    }, 0) || 0;
  };

  /**
   * Render workout item
   */
  const renderWorkoutItem = ({ item }) => (
    <TouchableOpacity
      style={styles.workoutCard}
      onPress={() => handleWorkoutPress(item)}
    >
      <View style={styles.workoutHeader}>
        <View style={styles.workoutInfo}>
          <View style={styles.workoutTitleRow}>
            <Text style={styles.workoutIcon}>
              {getWorkoutTypeIcon(item.type)}
            </Text>
            <Text style={styles.workoutName} numberOfLines={1}>
              {item.name}
            </Text>
          </View>
          <Text style={styles.workoutDate}>
            {formatDate(item.date)}
          </Text>
        </View>
        
        <View style={styles.workoutActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditWorkout(item)}
          >
            <Text style={styles.actionButtonText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteWorkout(item)}
          >
            <Text style={styles.actionButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.workoutStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {item.exercises?.length || 0}
          </Text>
          <Text style={styles.statLabel}>Exercises</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {getTotalVolume(item)}
          </Text>
          <Text style={styles.statLabel}>Volume (kg)</Text>
        </View>
        
        {item.duration && (
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.duration}</Text>
            <Text style={styles.statLabel}>Minutes</Text>
          </View>
        )}
        
        {item.caloriesBurned && (
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.caloriesBurned}</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
        )}
      </View>

      {item.hasPersonalBest && (
        <View style={styles.personalBestBadge}>
          <Text style={styles.personalBestText}>🏆 Personal Best</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🏋️‍♂️</Text>
      <Text style={styles.emptyTitle}>No Workouts Yet</Text>
      <Text style={styles.emptyMessage}>
        Start tracking your fitness journey by logging your first workout!
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => navigation.navigate('WorkoutForm')}
      >
        <Text style={styles.emptyButtonText}>Log Your First Workout</Text>
      </TouchableOpacity>
    </View>
  );

  /**
   * Render loading footer
   */
  const renderFooter = () => {
    if (!loading) return null;
    
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#3b82f6" />
        <Text style={styles.footerText}>Loading more workouts...</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Workout History</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('WorkoutForm')}
        >
          <Text style={styles.addButtonText}>+ Add Workout</Text>
        </TouchableOpacity>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search workouts..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => loadWorkouts(1, false)}
          />
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Text style={styles.filterButtonText}>🔍</Text>
          </TouchableOpacity>
        </View>
        
        {filterType !== 'all' && (
          <TouchableOpacity
            style={styles.activeFilter}
            onPress={() => {
              setFilterType('all');
              loadWorkouts(1, false);
            }}
          >
            <Text style={styles.activeFilterText}>
              {filterType} ✕
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Workout List */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadWorkouts(1, false)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={workouts}
          renderItem={renderWorkoutItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#3b82f6']}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={!loading && renderEmptyState()}
        />
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.filterModal}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Filter Workouts</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.filterOptions}>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  filterType === 'all' && styles.filterOptionSelected,
                ]}
                onPress={() => {
                  setFilterType('all');
                  setShowFilters(false);
                  loadWorkouts(1, false);
                }}
              >
                <Text style={[
                  styles.filterOptionText,
                  filterType === 'all' && styles.filterOptionTextSelected,
                ]}>
                  All Workouts
                </Text>
              </TouchableOpacity>

              {['STRENGTH', 'CARDIO', 'MIXED', 'HIIT', 'YOGA'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterOption,
                    filterType === type && styles.filterOptionSelected,
                  ]}
                  onPress={() => {
                    setFilterType(type);
                    setShowFilters(false);
                    loadWorkouts(1, false);
                  }}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filterType === type && styles.filterOptionTextSelected,
                  ]}>
                    {getWorkoutTypeIcon(type)} {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModal}>
            <Text style={styles.deleteTitle}>Delete Workout?</Text>
            <Text style={styles.deleteMessage}>
              Are you sure you want to delete "{selectedWorkout?.name}"? This action cannot be undone.
            </Text>
            
            <View style={styles.deleteActions}>
              <TouchableOpacity
                style={styles.cancelDeleteButton}
                onPress={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                <Text style={styles.cancelDeleteButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.confirmDeleteButton}
                onPress={confirmDeleteWorkout}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.confirmDeleteButtonText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  searchSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    marginRight: 12,
  },
  filterButton: {
    padding: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  filterButtonText: {
    fontSize: 16,
  },
  activeFilter: {
    marginTop: 12,
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  activeFilterText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
  },
  listContainer: {
    padding: 20,
  },
  workoutCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    marginBottom: 12,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  workoutIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  workoutDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  workoutActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  actionButtonText: {
    fontSize: 16,
  },
  workoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  personalBestBadge: {
    marginTop: 8,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  personalBestText: {
    fontSize: 12,
    color: '#92400e',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  emptyButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    maxHeight: '80%',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  closeButton: {
    fontSize: 20,
    color: '#6b7280',
  },
  filterOptions: {
    gap: 8,
  },
  filterOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterOptionSelected: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  filterOptionTextSelected: {
    color: '#3b82f6',
    fontWeight: '500',
  },
  deleteModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    maxWidth: 320,
  },
  deleteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  deleteMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  deleteActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelDeleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  cancelDeleteButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  confirmDeleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    alignItems: 'center',
  },
  confirmDeleteButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
});

export default WorkoutHistoryScreen;

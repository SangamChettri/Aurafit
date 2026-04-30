import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../config/api';
import { 
  Dumbbell, 
  Plus, 
  Tag,
  Activity,
  CheckCircle2,
  XCircle,
  Search,
  X
} from 'lucide-react';
import { useState } from 'react';
import { CardGridSkeleton } from '../components/LoadingSkeleton';
import { useToast } from '../components/Toast';

export default function Exercises() {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    muscleGroup: '',
    equipment: '',
    instructions: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      const response = await api.get('/admin/exercise-library');
      return response.data.data;
    },
  });

  const filteredExercises = data?.filter((exercise: any) =>
    exercise.name.toLowerCase().includes(search.toLowerCase()) ||
    exercise.category?.toLowerCase().includes(search.toLowerCase()) ||
    exercise.muscleGroup?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddExercise = () => {
    setShowAddModal(true);
    setFormData({
      name: '',
      category: '',
      muscleGroup: '',
      equipment: '',
      instructions: ''
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Exercise name is required';
    }
    
    if (!formData.category) {
      errors.category = 'Category is required';
    }
    
    if (!formData.muscleGroup) {
      errors.muscleGroup = 'Muscle group is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveExercise = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/admin/exercise-library', {
        name: formData.name.trim(),
        category: formData.category,
        muscleGroup: formData.muscleGroup,
        equipment: formData.equipment.trim() || null,
        instructions: formData.instructions.trim() || null
      });

      if (response.data.success) {
        showToast('Exercise added successfully!', 'success');
        setShowAddModal(false);
        queryClient.invalidateQueries({ queryKey: ['exercises'] });
      } else {
        showToast('Failed to add exercise', 'error');
      }
    } catch (error: any) {
      console.error('Add exercise error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add exercise';
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExercise = async (id: number) => {
    try {
      const response = await api.delete(`/admin/exercise-library/${id}`);
      
      if (response.data.success) {
        showToast('Exercise deleted successfully!', 'success');
        queryClient.invalidateQueries({ queryKey: ['exercises'] });
      } else {
        showToast('Failed to delete exercise', 'error');
      }
    } catch (error: any) {
      console.error('Delete exercise error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete exercise';
      showToast(errorMessage, 'error');
    } finally {
      setDeleteConfirm(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Exercises</h1>
            <p className="text-gray-500 mt-1">Manage workout exercises</p>
          </div>
        </div>
        <CardGridSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exercises</h1>
          <p className="text-gray-500 mt-1">Manage workout exercises</p>
        </div>
        <button
          onClick={handleAddExercise}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Add Exercise</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
          />
        </div>
      </div>

      {/* Exercises Grid */}
      {filteredExercises?.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Dumbbell className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No exercises found</h3>
          <p className="text-gray-500">Try adjusting your search or add a new exercise.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises?.map((exercise: any) => (
            <div
              key={exercise.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden card-hover"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary-100 p-2 rounded-lg">
                      <Dumbbell className="w-5 h-5 text-primary-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {exercise.name}
                    </h3>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    exercise.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {exercise.isActive ? (
                      <><CheckCircle2 className="w-3 h-3 mr-1" /> Active</>
                    ) : (
                      <><XCircle className="w-3 h-3 mr-1" /> Inactive</>
                    )}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  {exercise.category && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Tag className="w-4 h-4 mr-2 text-gray-400" />
                      <span>Category: <span className="font-medium">{exercise.category}</span></span>
                    </div>
                  )}
                  {exercise.muscleGroup && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Activity className="w-4 h-4 mr-2 text-gray-400" />
                      <span>Muscle: <span className="font-medium">{exercise.muscleGroup}</span></span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    ID: {exercise.id}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => showToast('Edit feature coming soon!', 'info')}
                      className="px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteExercise(exercise.id)}
                      className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Footer */}
      {filteredExercises?.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium">{filteredExercises.length}</span> exercises
          </p>
          <p className="text-sm text-gray-500">
            <span className="font-medium text-green-600">
              {filteredExercises.filter((e: any) => e.isActive).length}
            </span>{' '}
            active,{' '}
            <span className="font-medium text-gray-600">
              {filteredExercises.filter((e: any) => !e.isActive).length}
            </span>{' '}
            inactive
          </p>
        </div>
      )}

      {/* Add Exercise Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Add New Exercise</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Exercise Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exercise Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      formErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Bench Press"
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      formErrors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a category</option>
                    <option value="Barbell">Barbell</option>
                    <option value="Dumbbell">Dumbbell</option>
                    <option value="Machine">Machine</option>
                    <option value="Bodyweight">Bodyweight</option>
                    <option value="Cardio">Cardio</option>
                    <option value="Cable">Cable</option>
                    <option value="Other">Other</option>
                  </select>
                  {formErrors.category && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.category}</p>
                  )}
                </div>

                {/* Muscle Group */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Muscle Group <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.muscleGroup}
                    onChange={(e) => setFormData({ ...formData, muscleGroup: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      formErrors.muscleGroup ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a muscle group</option>
                    <option value="Chest">Chest</option>
                    <option value="Back">Back</option>
                    <option value="Shoulders">Shoulders</option>
                    <option value="Biceps">Biceps</option>
                    <option value="Triceps">Triceps</option>
                    <option value="Legs">Legs</option>
                    <option value="Core">Core</option>
                    <option value="FullBody">FullBody</option>
                    <option value="Cardio">Cardio</option>
                  </select>
                  {formErrors.muscleGroup && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.muscleGroup}</p>
                  )}
                </div>

                {/* Equipment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Equipment (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.equipment}
                    onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., Barbell, Dumbbells"
                  />
                </div>

                {/* Instructions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instructions (Optional)
                  </label>
                  <textarea
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter exercise instructions..."
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveExercise}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : 'Save Exercise'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4">
            <div className="p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Exercise</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete "{deleteConfirm.name}"? It will be removed from the app.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteExercise(deleteConfirm.id)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

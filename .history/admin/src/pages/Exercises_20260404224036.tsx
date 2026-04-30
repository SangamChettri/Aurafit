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
  const { showToast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      const response = await api.get('/admin/exercises');
      return response.data.data;
    },
  });

  const filteredExercises = data?.filter((exercise: any) =>
    exercise.name.toLowerCase().includes(search.toLowerCase()) ||
    exercise.category?.toLowerCase().includes(search.toLowerCase()) ||
    exercise.muscleGroup?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddExercise = () => {
    showToast('Add Exercise feature coming soon!', 'info');
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
                      onClick={() => showToast('Delete feature coming soon!', 'info')}
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
    </div>
  );
}

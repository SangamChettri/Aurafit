import { useQuery } from '@tanstack/react-query';
import api from '../config/api';

export default function Exercises() {
  const { data, isLoading } = useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      const response = await api.get('/admin/exercises');
      return response.data.data;
    },
  });

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Exercises</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {data?.map((exercise: any) => (
            <li key={exercise.id} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{exercise.name}</p>
                  <p className="text-sm text-gray-500">
                    {exercise.category} • {exercise.muscleGroup}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    exercise.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {exercise.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

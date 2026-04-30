import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../config/api';
import Pagination from '../components/Pagination';

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  isActive: boolean;
  criteria: any;
}

const Achievements = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['achievements', page],
    queryFn: async () => {
      const response = await api.get(`/admin/achievements?page=${page}&limit=10`);
      return response.data.data;
    },
  });

  const achievements = (data?.achievements as Achievement[]) || [];
  const pagination = data?.pagination;

  const upsertMutation = useMutation({
    mutationFn: async (achievement: Partial<Achievement>) => {
      if (achievement.id) {
        return api.put(`/admin/achievements/${achievement.id}`, achievement);
      }
      return api.post('/admin/achievements', achievement);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      setIsModalOpen(false);
      setEditingAchievement(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/admin/achievements/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
    },
  });

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading achievements...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Achievements Management</h1>
          <p className="text-gray-600 mt-1">Create and manage rewards for user milestones.</p>
        </div>
        <button
          onClick={() => {
            setEditingAchievement(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Add Achievement
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-bottom">
            <tr>
              <th className="px-6 py-4 font-semibold text-sm text-gray-600 uppercase">Icon</th>
              <th className="px-6 py-4 font-semibold text-sm text-gray-600 uppercase">Title & Description</th>
              <th className="px-6 py-4 font-semibold text-sm text-gray-600 uppercase">Category</th>
              <th className="px-6 py-4 font-semibold text-sm text-gray-600 uppercase">Points</th>
              <th className="px-6 py-4 font-semibold text-sm text-gray-600 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {achievements.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No achievements found.
                </td>
              </tr>
            ) : (
              achievements.map((achievement) => (
                <tr key={achievement.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl">
                      <i className={`material-icons`}>{achievement.icon}</i>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-800">{achievement.title}</div>
                    <div className="text-sm text-gray-500 max-w-md">{achievement.description}</div>
                  </td>
                  <td className="px-6 py-4 capitalize text-sm text-gray-600">{achievement.category}</td>
                  <td className="px-6 py-4 font-medium text-gray-800">{achievement.points}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => {
                        setEditingAchievement(achievement);
                        setIsModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 font-medium mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this achievement?')) {
                          deleteMutation.mutate(achievement.id);
                        }
                      }}
                      className="text-red-500 hover:text-red-700 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={pagination?.pages || 1}
        onPageChange={setPage}
        totalItems={pagination?.total}
        limit={pagination?.limit}
        label="achievements"
      />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-8">
            <h2 className="text-xl font-bold mb-6 text-gray-800">
              {editingAchievement ? 'Edit Achievement' : 'New Achievement'}
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = {
                  id: editingAchievement?.id,
                  title: formData.get('title') as string,
                  description: formData.get('description') as string,
                  icon: formData.get('icon') as string,
                  category: formData.get('category') as string,
                  points: parseInt(formData.get('points') as string),
                  criteria: JSON.parse((formData.get('criteria') as string) || '{}'),
                };
                upsertMutation.mutate(data);
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    name="title"
                    defaultValue={editingAchievement?.title}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    defaultValue={editingAchievement?.description}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    rows={3}
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Icon (Material Icon Name)</label>
                    <input
                      name="icon"
                      defaultValue={editingAchievement?.icon}
                      required
                      placeholder="e.g. fitness_center"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                    <input
                      name="points"
                      type="number"
                      defaultValue={editingAchievement?.points || 10}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    name="category"
                    defaultValue={editingAchievement?.category || 'workout'}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="workout">Workout</option>
                    <option value="streak">Streak</option>
                    <option value="consistency">Consistency</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Criteria (JSON Format)</label>
                  <input
                    name="criteria"
                    defaultValue={JSON.stringify(editingAchievement?.criteria || { type: 'workout_completed', target: 5 })}
                    required
                    placeholder='{"type": "workout_completed", "target": 5}'
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={upsertMutation.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                >
                  {upsertMutation.isPending ? 'Saving...' : 'Save Achievement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Achievements;

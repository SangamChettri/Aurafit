import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../config/api';
import { 
  Search, 
  Trash2, 
  Users as UsersIcon,
  UserCheck,
  UserX,
  X,
  Dumbbell,
  Flame,
  Calendar
} from 'lucide-react';
import Avatar from '../components/Avatar';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { useToast } from '../components/Toast';
import Pagination from '../components/Pagination';

export default function Users() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState<any>(null);
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);
  const [userDetailsError, setUserDetailsError] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      // Only trigger search if empty or has at least 2 characters
      if (searchInput.length === 0 || searchInput.length >= 2) {
        setDebouncedSearch(searchInput);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, debouncedSearch],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({ page: page.toString(), limit: '10' });
        if (debouncedSearch) params.append('search', debouncedSearch);
        const response = await api.get(`/admin/users?${params}`);
        return response.data.data;
      } catch (error) {
        // Return empty array on error to prevent infinite loading loops
        return { users: [], pagination: { total: 0, pages: 1, page: 1, limit: 10 } };
      }
    },
  });

  const handleDelete = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/admin/users/${userId}`);
        showToast('User deleted successfully', 'success');
      } catch (error) {
        showToast('Failed to delete user', 'error');
      }
    }
  };

  const handleViewUser = async (userId: string) => {
    setSelectedUserId(userId);
    setIsModalOpen(true);
    setLoadingUserDetails(true);
    setUserDetailsError(null);
    setSelectedUserDetails(null);

    try {
      const response = await api.get(`/admin/users/${userId}`);
      setSelectedUserDetails(response.data.data);
    } catch (error) {
      setUserDetailsError('Could not load user details');
    } finally {
      setLoadingUserDetails(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUserId(null);
    setSelectedUserDetails(null);
    setUserDetailsError(null);
  };

  const handleRetryFetch = () => {
    if (selectedUserId) {
      handleViewUser(selectedUserId);
    }
  };


  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 mt-1">Manage your platform users</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">
          <UsersIcon className="w-4 h-4" />
          <span>Total: {data?.pagination?.total || 0} users</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchInput}
            onChange={(e) => {
              const val = e.target.value;
              setSearchInput(val);
              // Immediately clear search and reload full list
              if (val === '') {
                setDebouncedSearch('');
              }
              setPage(1);
            }}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
          />
        </div>
      </div>

      {/* Loading Skeleton or Users Table */}
      {isLoading ? (
        <TableSkeleton />
      ) : (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {data?.users?.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UsersIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No users found matching your search</h3>
            <p className="text-gray-500">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data?.users?.map((user: any, index: number) => (
                    <tr 
                      key={user.id} 
                      className={`hover:bg-gray-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Avatar 
                            name={user.name || user.email} 
                            size="md"
                          />
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {user.name || user.email}
                            </p>
                            <p className="text-xs text-gray-500">ID: {user.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          user.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? (
                            <><UserCheck className="w-3 h-3" /> Active</>
                          ) : (
                            <><UserX className="w-3 h-3" /> Inactive</>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <Pagination
              page={page}
              totalPages={data?.pagination?.pages || 1}
              onPageChange={setPage}
              totalItems={data?.pagination?.total}
              limit={data?.pagination?.limit}
              label="users"
            />
          </>
        )}
      </div>
      )}

      {/* User Detail Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-lg mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Loading State */}
            {loadingUserDetails && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500">Loading user details...</p>
              </div>
            )}

            {/* Error State */}
            {userDetailsError && (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-red-500 mb-4">{userDetailsError}</p>
                <button
                  onClick={handleRetryFetch}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {/* User Details */}
            {selectedUserDetails && !loadingUserDetails && !userDetailsError && (
              <div className="space-y-6">
                {/* Section 1: Profile */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile</h3>
                  <div className="flex items-start gap-4">
                    <Avatar
                      name={selectedUserDetails.name || selectedUserDetails.email}
                      size="lg"
                    />
                    <div className="flex-1">
                      <p className="text-lg font-bold text-gray-900">
                        {selectedUserDetails.name || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-500 mb-2">
                        {selectedUserDetails.email}
                      </p>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        selectedUserDetails.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedUserDetails.isActive ? (
                          <><UserCheck className="w-3 h-3" /> Active</>
                        ) : (
                          <><UserX className="w-3 h-3" /> Inactive</>
                        )}
                      </span>
                      <p className="text-sm text-gray-500 mt-2">
                        Joined: {new Date(selectedUserDetails.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 2: Workout Stats */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Workout Stats</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <Dumbbell className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                      <p className="text-xs text-gray-500 mb-1">Total Workouts</p>
                      <p className="text-lg font-bold text-gray-900">{selectedUserDetails.totalWorkouts}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <Dumbbell className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <p className="text-xs text-gray-500 mb-1">Total Weight</p>
                      <p className="text-lg font-bold text-gray-900">{selectedUserDetails.totalVolumeKg} kg</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <Calendar className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                      <p className="text-xs text-gray-500 mb-1">Last Workout</p>
                      <p className="text-lg font-bold text-gray-900">
                        {selectedUserDetails.lastWorkoutDate
                          ? new Date(selectedUserDetails.lastWorkoutDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })
                          : 'Never'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 3: Streaks */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Streaks</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <Flame className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                      <p className="text-xs text-gray-500 mb-1">Current Streak</p>
                      <p className="text-lg font-bold text-gray-900">{selectedUserDetails.currentStreak} days</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <Flame className="w-6 h-6 text-red-600 mx-auto mb-2" />
                      <p className="text-xs text-gray-500 mb-1">Best Streak</p>
                      <p className="text-lg font-bold text-gray-900">{selectedUserDetails.bestStreak} days</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../config/api';
import { 
  ArrowLeft, 
  Mail, 
  Calendar, 
  Crown, 
  Shield,
  User,
  Activity,
  Trophy,
  Scale
} from 'lucide-react';
import Avatar from '../components/Avatar';
import { UserDetailSkeleton } from '../components/LoadingSkeleton';

export default function UserDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const response = await api.get(`/admin/users/${id}`);
      return response.data.data;
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (isActive: boolean) => {
      return api.put(`/admin/users/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', id] });
    },
  });

  if (isLoading) {
    return <UserDetailSkeleton />;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Back Button */}
      <Link
        to="/users"
        className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Users</span>
      </Link>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar name={data?.name || data?.email} size="xl" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {data?.name || data?.email}
            </h1>
            <p className="text-gray-500">User ID: {data?.id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => toggleStatusMutation.mutate(!data?.isActive)}
            disabled={toggleStatusMutation.isPending}
            className={`px-4 py-2 rounded-lg transition-colors font-medium ${
              data?.isActive
                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                : 'bg-green-50 text-green-600 hover:bg-green-100'
            } disabled:opacity-50`}
          >
            {data?.isActive ? 'Deactivate Account' : 'Activate Account'}
          </button>
        </div>
      </div>

      {/* Quick Stats Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 font-medium">Total Workouts</span>
            <Activity className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{data?.stats?.totalWorkouts || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 font-medium">Achievements</span>
            <Trophy className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{data?.achievements?.length || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 font-medium">Personal Records</span>
            <Crown className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{data?.stats?.totalPersonalRecords || 0}</div>
        </div>
      </div>

      {/* User Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <User className="w-5 h-5 mr-2 text-primary-600" />
              Basic Information
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-50">
              <div className="flex items-center text-gray-600">
                <Mail className="w-4 h-4 mr-3 text-gray-400" />
                <span className="text-sm">Email</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{data?.email}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-50">
              <div className="flex items-center text-gray-600">
                <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                <span className="text-sm">Joined</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {new Date(data?.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center text-gray-600">
                <Shield className="w-4 h-4 mr-3 text-gray-400" />
                <span className="text-sm">Role</span>
              </div>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                data?.role === 'super_admin'
                  ? 'bg-purple-100 text-purple-800'
                  : data?.role === 'admin'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {data?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Metrics & Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Scale className="w-5 h-5 mr-2 text-primary-600" />
              Latest Health Metrics
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-50">
              <span className="text-sm text-gray-600">Subscription Status</span>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                data?.subscriptionStatus === 'PREMIUM'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {data?.subscriptionStatus === 'PREMIUM' && <Crown className="w-3 h-3 mr-1" />}
                {data?.subscriptionStatus}
              </span>
            </div>
            {data?.measurements?.[0] ? (
              <>
                <div className="flex items-center justify-between py-3 border-b border-gray-50">
                  <span className="text-sm text-gray-600">Current Weight</span>
                  <span className="text-sm font-medium text-gray-900">{data.measurements[0].weight} kg</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-gray-600">Body Fat %</span>
                  <span className="text-sm font-medium text-gray-900">{data.measurements[0].bodyFat}%</span>
                </div>
              </>
            ) : (
              <div className="py-6 text-center text-gray-400 text-sm italic">No measurements logged yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Achievements List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">User Achievements</h2>
        </div>
        <div className="p-6">
          {data?.achievements?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.achievements.map((ua: any) => (
                <div key={ua.id} className="flex items-center p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <div className="bg-amber-200 p-2 rounded-full mr-3">
                    <Trophy className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-amber-900">{ua.title}</div>
                    <div className="text-xs text-amber-700">Earned {new Date(ua.earnedAt).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No achievements earned yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

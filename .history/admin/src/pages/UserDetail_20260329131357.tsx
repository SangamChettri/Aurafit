import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../config/api';
import { 
  ArrowLeft, 
  Mail, 
  Calendar, 
  Crown, 
  CheckCircle2, 
  XCircle,
  Shield,
  User
} from 'lucide-react';
import Avatar from '../components/Avatar';
import { UserDetailSkeleton } from '../components/LoadingSkeleton';

export default function UserDetail() {
  const { id } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const response = await api.get(`/admin/users/${id}`);
      return response.data.data;
    },
  });

  if (isLoading) {
    return <UserDetailSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        to="/users"
        className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Users</span>
      </Link>

      {/* Page Header */}
      <div className="flex items-center space-x-4">
        <Avatar name={`${data?.firstName} ${data?.lastName}`} size="xl" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {data?.firstName} {data?.lastName}
          </h1>
          <p className="text-gray-500">User ID: {data?.id}</p>
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
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
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

        {/* Account Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-primary-600" />
              Account Status
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-50">
              <div className="flex items-center text-gray-600">
                <Crown className="w-4 h-4 mr-3 text-gray-400" />
                <span className="text-sm">Subscription</span>
              </div>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                data?.subscriptionStatus === 'PREMIUM'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {data?.subscriptionStatus === 'PREMIUM' && <Crown className="w-3 h-3 mr-1" />}
                {data?.subscriptionStatus}
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center text-gray-600">
                {data?.isActive ? (
                  <CheckCircle2 className="w-4 h-4 mr-3 text-gray-400" />
                ) : (
                  <XCircle className="w-4 h-4 mr-3 text-gray-400" />
                )}
                <span className="text-sm">Account Status</span>
              </div>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                data?.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {data?.isActive ? (
                  <><CheckCircle2 className="w-3 h-3 mr-1" /> Active</>
                ) : (
                  <><XCircle className="w-3 h-3 mr-1" /> Inactive</>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-4 pt-4">
        <button
          onClick={() => alert('Edit user feature coming soon!')}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          Edit User
        </button>
        <button
          onClick={() => alert('Toggle status feature coming soon!')}
          className={`px-4 py-2 rounded-lg transition-colors font-medium ${
            data?.isActive
              ? 'bg-red-50 text-red-600 hover:bg-red-100'
              : 'bg-green-50 text-green-600 hover:bg-green-100'
          }`}
        >
          {data?.isActive ? 'Deactivate Account' : 'Activate Account'}
        </button>
      </div>
    </div>
  );
}

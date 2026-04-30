import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../config/api';

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
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">User Details</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Email</dt>
            <dd className="mt-1 text-sm text-gray-900">{data?.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Name</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {data?.firstName} {data?.lastName}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Role</dt>
            <dd className="mt-1 text-sm text-gray-900">{data?.role}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Subscription</dt>
            <dd className="mt-1 text-sm text-gray-900">{data?.subscriptionStatus}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {data?.isActive ? 'Active' : 'Inactive'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Joined</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(data?.createdAt).toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

import { useQuery } from '@tanstack/react-query';
import api from '../config/api';
import { 
  Users, 
  Crown, 
  Activity, 
  Dumbbell, 
  Target,
  TrendingUp,
  Calendar
} from 'lucide-react';
import StatCard from '../components/StatCard';
import Avatar from '../components/Avatar';
import { DashboardSkeleton } from '../components/LoadingSkeleton';

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await api.get('/admin/dashboard');
      return response.data.data;
    },
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const stats = [
    { 
      name: 'Total Users', 
      value: data?.totalUsers || 0, 
      icon: Users,
      color: 'blue' as const,
      trend: { value: 12, isPositive: true }
    },
    { 
      name: 'Premium Users', 
      value: data?.premiumUsers || 0, 
      icon: Crown,
      color: 'green' as const,
      trend: { value: 8, isPositive: true }
    },
    { 
      name: 'Active Users', 
      value: data?.activeUsers || 0, 
      icon: Activity,
      color: 'amber' as const,
      trend: { value: 5, isPositive: true }
    },
    { 
      name: 'Total Workouts', 
      value: data?.totalWorkouts || 0, 
      icon: Dumbbell,
      color: 'purple' as const,
      trend: { value: 15, isPositive: true }
    },
    { 
      name: 'Goals Set', 
      value: data?.totalGoals || 0, 
      icon: Target,
      color: 'pink' as const,
      trend: { value: 3, isPositive: true }
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here is what is happening with your platform.</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {stats.map((stat) => (
          <StatCard
            key={stat.name}
            title={stat.name}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* Recent Users Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
              <p className="text-sm text-gray-500 mt-1">New users who joined recently</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-primary-600">
              <TrendingUp className="w-4 h-4" />
              <span className="font-medium">+{data?.recentUsers?.length || 0} this week</span>
            </div>
          </div>
        </div>

        {data?.recentUsers?.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No recent users</h3>
            <p className="text-gray-500">New users will appear here when they join.</p>
          </div>
        ) : (
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data?.recentUsers?.map((user: any, index: number) => (
                  <tr 
                    key={user.id} 
                    className={`hover:bg-gray-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Avatar 
                          name={`${user.firstName} ${user.lastName}`} 
                          size="sm"
                        />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.subscriptionStatus === 'PREMIUM'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.subscriptionStatus}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

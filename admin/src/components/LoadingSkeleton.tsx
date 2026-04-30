export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="animate-shimmer h-12 w-12 rounded-lg mb-4" />
            <div className="animate-shimmer h-4 w-24 rounded mb-2" />
            <div className="animate-shimmer h-8 w-16 rounded" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="animate-shimmer h-6 w-32 rounded" />
        </div>
        <div className="divide-y divide-gray-100">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 flex items-center space-x-4">
              <div className="animate-shimmer h-10 w-10 rounded-full" />
              <div className="flex-1">
                <div className="animate-shimmer h-4 w-32 rounded mb-2" />
                <div className="animate-shimmer h-3 w-48 rounded" />
              </div>
              <div className="animate-shimmer h-4 w-24 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="divide-y divide-gray-100">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="p-4 flex items-center space-x-4">
            <div className="animate-shimmer h-10 w-10 rounded-full" />
            <div className="flex-1">
              <div className="animate-shimmer h-4 w-32 rounded mb-2" />
              <div className="animate-shimmer h-3 w-48 rounded" />
            </div>
            <div className="animate-shimmer h-6 w-16 rounded-full" />
            <div className="animate-shimmer h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="animate-shimmer h-6 w-3/4 rounded mb-4" />
          <div className="animate-shimmer h-4 w-full rounded mb-2" />
          <div className="animate-shimmer h-4 w-2/3 rounded" />
          <div className="mt-4 flex justify-between items-center">
            <div className="animate-shimmer h-6 w-16 rounded-full" />
            <div className="animate-shimmer h-8 w-20 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function UserDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="animate-shimmer h-16 w-16 rounded-full" />
          <div>
            <div className="animate-shimmer h-6 w-48 rounded mb-2" />
            <div className="animate-shimmer h-4 w-32 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i}>
              <div className="animate-shimmer h-3 w-24 rounded mb-2" />
              <div className="animate-shimmer h-5 w-32 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

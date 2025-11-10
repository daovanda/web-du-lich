interface CarLoadingSkeletonProps {
  count?: number;
}

export default function CarLoadingSkeleton({ count = 6 }: CarLoadingSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="bg-gray-900 rounded-lg p-4 h-56 animate-pulse"
          style={{
            animationDelay: `${i * 100}ms`,
          }}
        >
          {/* Image skeleton */}
          <div className="w-full h-32 bg-gray-800 rounded mb-3"></div>
          
          {/* Title skeleton */}
          <div className="h-4 bg-gray-800 rounded mb-2"></div>
          
          {/* Price skeleton */}
          <div className="h-4 bg-gray-800 rounded w-1/2 mb-2"></div>
          
          {/* Route skeleton */}
          <div className="flex gap-2 mb-2">
            <div className="h-3 bg-gray-800 rounded w-1/3"></div>
            <div className="h-3 bg-gray-800 rounded w-1/3"></div>
          </div>
          
          {/* Time skeleton */}
          <div className="h-3 bg-gray-800 rounded w-1/4"></div>
        </div>
      ))}
    </div>
  );
}
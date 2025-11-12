// _components/StayLoadingSkeleton.tsx

interface StayLoadingSkeletonProps {
  count?: number;
}

export default function StayLoadingSkeleton({ count = 6 }: StayLoadingSkeletonProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="bg-gray-900 rounded-lg p-4 h-56 animate-pulse"
          style={{
            animationDelay: `${i * 100}ms`,
          }}
        >
          <div className="w-full h-32 bg-gray-800 rounded mb-3"></div>
          <div className="h-4 bg-gray-800 rounded mb-2"></div>
          <div className="h-4 bg-gray-800 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
}
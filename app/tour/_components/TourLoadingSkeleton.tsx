// src/app/tours/_components/TourLoadingSkeleton.tsx

interface TourLoadingSkeletonProps {
  count?: number;
}

export default function TourLoadingSkeleton({
  count = 6,
}: TourLoadingSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-500 ease-out opacity-100 scale-100">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="bg-gray-900 rounded-lg p-4 h-56 transition-all duration-300 ease-out animate-pulse"
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
type Props = {
  count?: number;
};

export default function MotorbikeLoadingSkeleton({ count = 6 }: Props) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-500 ease-out opacity-100 scale-100"
    >
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="bg-black border border-neutral-800 rounded-xl overflow-hidden transition-all duration-300 ease-out animate-pulse"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="w-full aspect-square bg-neutral-900" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-neutral-900 rounded w-3/4" />
            <div className="h-3 bg-neutral-900 rounded w-1/2" />
            <div className="h-3 bg-neutral-900 rounded w-full" />
            <div className="h-3 bg-neutral-900 rounded w-2/3" />
            <div className="pt-3 border-t border-neutral-800">
              <div className="h-4 bg-neutral-900 rounded w-1/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}


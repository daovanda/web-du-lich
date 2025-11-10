// src/app/tours/_components/TourSearchBar.tsx

interface TourSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  isInitialLoad: boolean;
}

export default function TourSearchBar({
  value,
  onChange,
  isInitialLoad,
}: TourSearchBarProps) {
  return (
    <div
      className={`my-2 transition-all duration-700 ease-out delay-500 ${
        isInitialLoad ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
      }`}
    >
      <input
        type="text"
        placeholder="Tìm kiếm tour..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-gray-500 transition-all duration-300 ease-out hover:border-gray-600"
      />
    </div>
  );
}
import { MapPin } from "lucide-react";

type TourItineraryProps = {
  itinerary: Record<string, any> | null | undefined; // ✅ Cho phép null/undefined
};

export default function TourItinerary({ itinerary }: TourItineraryProps) {
  // ✅ Kiểm tra itinerary null/undefined/empty
  if (!itinerary || typeof itinerary !== 'object') return null;

  const entries = Object.entries(itinerary);

  // ✅ Nếu không có entry nào
  if (entries.length === 0) return null;

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <MapPin className="w-6 h-6 text-blue-400" />
        Lịch trình chi tiết
      </h2>
      <div className="space-y-4">
        {entries.map(([key, value], index) => (
          <div
            key={key}
            className="flex gap-4 group hover:bg-gray-800/50 rounded-xl p-4 transition-colors"
          >
            {/* Number circle */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
                {index + 1}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1 capitalize">
                {key.replace(/_/g, " ").replace(/day/i, "Ngày")}
              </h3>
              <p className="text-gray-300 leading-relaxed">{String(value)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
import { MapPin } from "lucide-react";

type TourItineraryProps = {
  itinerary: Record<string, any> | null | undefined;
};

export default function TourItinerary({ itinerary }: TourItineraryProps) {
  if (!itinerary || typeof itinerary !== 'object') return null;

  const entries = Object.entries(itinerary);

  if (entries.length === 0) return null;

  return (
    <section className="rounded-xl border border-neutral-800 bg-black p-5">
      <h2 className="text-lg font-semibold mb-5 flex items-center gap-2 text-white">
        <MapPin className="w-4 h-4 text-neutral-400" />
        Lịch trình chi tiết
      </h2>
      <div className="space-y-3">
        {entries.map(([key, value], index) => (
          <div
            key={key}
            className="flex gap-4 group hover:bg-neutral-900 rounded-lg p-4 transition-colors border border-transparent hover:border-neutral-800"
          >
            {/* Number circle */}
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                {index + 1}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1.5 capitalize text-white">
                {key.replace(/_/g, " ").replace(/day/i, "Ngày")}
              </h3>
              <p className="text-neutral-400 leading-relaxed text-sm">{String(value)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
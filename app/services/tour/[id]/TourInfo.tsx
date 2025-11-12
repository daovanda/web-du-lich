import { Calendar, Clock, Users, User } from "lucide-react";

type TourInfoProps = {
  tour: {
    duration_days: number | null;
    start_date: string | null;
    end_date: string | null;
    available_slots: number | null;
    guide_name: string | null;
  } | null;
};

export default function TourInfo({ tour }: TourInfoProps) {
  if (!tour) return null;

  const infoItems = [
    {
      icon: Clock,
      label: "Thời lượng",
      value: tour.duration_days ? `${tour.duration_days} ngày` : null,
    },
    {
      icon: Calendar,
      label: "Khởi hành",
      value: tour.start_date
        ? new Date(tour.start_date).toLocaleDateString("vi-VN")
        : null,
    },
    {
      icon: Calendar,
      label: "Kết thúc",
      value: tour.end_date
        ? new Date(tour.end_date).toLocaleDateString("vi-VN")
        : null,
    },
    {
      icon: Users,
      label: "Chỗ trống",
      value: tour.available_slots !== null ? `${tour.available_slots} chỗ` : null,
    },
    {
      icon: User,
      label: "Hướng dẫn viên",
      value: tour.guide_name,
    },
  ].filter((item) => item.value);

  if (infoItems.length === 0) return null;

  return (
    <section className="rounded-xl border border-neutral-800 bg-black p-5">
      <h2 className="text-lg font-semibold mb-5 text-white">Thông tin tour</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {infoItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="bg-neutral-900 rounded-lg p-4 border border-neutral-800 hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-start gap-3">
                <Icon className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-neutral-500 mb-1 uppercase tracking-wide font-semibold">{item.label}</p>
                  <p className="text-sm font-medium text-white">{item.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
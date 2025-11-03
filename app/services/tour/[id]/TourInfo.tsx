import { Calendar, Clock, Users, User } from "lucide-react";

type TourInfoProps = {
  tour: {
    duration_days: number | null;
    start_date: string | null;
    end_date: string | null;
    available_slots: number | null;
    guide_name: string | null;
  } | null; // ✅ Cho phép null
};

export default function TourInfo({ tour }: TourInfoProps) {
  // ✅ Kiểm tra tour null
  if (!tour) return null;

  const infoItems = [
    {
      icon: Clock,
      label: "Thời lượng",
      value: tour.duration_days ? `${tour.duration_days} ngày` : null,
      color: "text-blue-400",
    },
    {
      icon: Calendar,
      label: "Khởi hành",
      value: tour.start_date
        ? new Date(tour.start_date).toLocaleDateString("vi-VN")
        : null,
      color: "text-purple-400",
    },
    {
      icon: Calendar,
      label: "Kết thúc",
      value: tour.end_date
        ? new Date(tour.end_date).toLocaleDateString("vi-VN")
        : null,
      color: "text-pink-400",
    },
    {
      icon: Users,
      label: "Chỗ trống",
      value: tour.available_slots !== null ? `${tour.available_slots} chỗ` : null,
      color: "text-green-400",
    },
    {
      icon: User,
      label: "Hướng dẫn viên",
      value: tour.guide_name,
      color: "text-orange-400",
    },
  ].filter((item) => item.value); // Chỉ hiển thị những item có giá trị

  // ✅ Nếu không có thông tin nào, không render gì
  if (infoItems.length === 0) return null;

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <h2 className="text-2xl font-bold mb-6">Thông tin tour</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {infoItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 ${item.color} flex-shrink-0 mt-0.5`} />
                <div>
                  <p className="text-sm text-gray-400 mb-1">{item.label}</p>
                  <p className="font-semibold">{item.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
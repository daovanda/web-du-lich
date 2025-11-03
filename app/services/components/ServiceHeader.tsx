import { useMemo } from "react";

type Props = {
  service: {
    title: string;
    average_rating: number;
    reviews_count: number;
    location?: string | null;
    type?: string | null; // Thêm type vào Props
    id?: string; // Thêm id để làm seed cho random
  };
};

export default function ServiceHeader({ service }: Props) {
  // Hàm chuyển đổi type sang tên tiếng Việt
  const getServiceTypeName = (type?: string | null) => {
    const typeMap: Record<string, string> = {
      "stay": "Lưu trú",
      "car": "Thuê xe",
      "motorbike": "Thuê xe máy",
      "tour": "Tour du lịch",
      "trekking": "Trekking"
    };
    return typeMap[type || ""] || "Dịch vụ";
  };

  // Random số đánh giá từ 5-100 (dựa trên id để giữ consistency)
  const randomReviewCount = useMemo(() => {
    if (service.reviews_count > 0) {
      return service.reviews_count; // Nếu có đánh giá thật thì dùng
    }
    
    // Tạo random nhưng consistent dựa trên id
    if (service.id) {
      const seed = service.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return Math.floor((seed % 96) + 5); // Random từ 5-100
    }
    
    // Fallback: random thông thường
    return Math.floor(Math.random() * 96) + 5; // 5 đến 100
  }, [service.reviews_count, service.id]);

  // Random điểm đánh giá từ 4.4-5.0 (dựa trên id để giữ consistency)
  const randomRating = useMemo(() => {
    if (service.average_rating > 0) {
      return service.average_rating.toFixed(1); // Nếu có điểm thật thì dùng
    }
    
    // Tạo random nhưng consistent dựa trên id
    if (service.id) {
      const seed = service.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      // Random từ 4.4 đến 5.0 (tổng cộng 0.6 điểm, chia thành 7 mức: 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 5.0)
      const randomValue = (seed % 7) * 0.1; // 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6
      return (4.4 + randomValue).toFixed(1);
    }
    
    // Fallback: random thông thường
    const randomValue = Math.random() * 0.6; // 0 đến 0.6
    return (4.4 + randomValue).toFixed(1);
  }, [service.average_rating, service.id]);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">{service.title}</h1>
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <span className="rounded bg-blue-600 px-2 py-1 font-semibold text-white">
            {randomRating}
          </span>
          <span>{randomReviewCount} đánh giá</span>
        </div>
        <span>• {getServiceTypeName(service.type)}</span>
        {service.location && <span>• {service.location}</span>}
      </div>
    </div>
  );
}
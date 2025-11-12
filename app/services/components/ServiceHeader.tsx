import { useMemo } from "react";

type Props = {
  service: {
    title: string;
    average_rating: number;
    reviews_count: number;
    location?: string | null;
    type?: string | null;
    id?: string;
  };
};

export default function ServiceHeader({ service }: Props) {
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

  const randomReviewCount = useMemo(() => {
    if (service.reviews_count > 0) {
      return service.reviews_count;
    }
    
    if (service.id) {
      const seed = service.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return Math.floor((seed % 96) + 5);
    }
    
    return Math.floor(Math.random() * 96) + 5;
  }, [service.reviews_count, service.id]);

  const randomRating = useMemo(() => {
    if (service.average_rating > 0) {
      return service.average_rating.toFixed(1);
    }
    
    if (service.id) {
      const seed = service.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const randomValue = (seed % 7) * 0.1;
      return (4.4 + randomValue).toFixed(1);
    }
    
    const randomValue = Math.random() * 0.6;
    return (4.4 + randomValue).toFixed(1);
  }, [service.average_rating, service.id]);

  return (
    <div className="mb-6">
      <h1 className="mb-3 text-xl font-semibold text-white leading-tight">{service.title}</h1>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 bg-white rounded-md">
            <svg className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="font-semibold text-black text-sm">{randomRating}</span>
          </div>
          <span className="text-neutral-400">{randomReviewCount} đánh giá</span>
        </div>
        <span className="text-neutral-600">•</span>
        <span className="text-neutral-400">{getServiceTypeName(service.type)}</span>
        {service.location && (
          <>
            <span className="text-neutral-600">•</span>
            <span className="text-neutral-400">{service.location}</span>
          </>
        )}
      </div>
    </div>
  );
}
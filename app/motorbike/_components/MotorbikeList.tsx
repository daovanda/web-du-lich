import ServiceCard from "@/components/ServiceCard";
import type { MotorbikeService } from "../_types/motorbike.types";
import MotorbikeLoadingSkeleton from "./MotorbikeLoadingSkeleton";

type Props = {
  services: MotorbikeService[];
  loading: boolean;
  error: string | null;
  isInitialLoad: boolean;
};

export default function MotorbikeList({ services, loading, error, isInitialLoad }: Props) {
  if (error) {
    return (
      <div className="bg-neutral-900 border border-red-900/50 text-red-400 text-center py-3 px-4 rounded-xl mb-4 transition-all duration-500 ease-out">
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (loading) {
    return <MotorbikeLoadingSkeleton count={6} />;
  }

  if (services.length === 0) {
    return (
      <div
        className={`text-center py-16 transition-all duration-700 ease-out delay-900 ${
          isInitialLoad ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
        }`}
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-900 flex items-center justify-center">
          <svg className="w-8 h-8 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-neutral-500 text-sm">Không tìm thấy dịch vụ nào phù hợp</p>
        <p className="text-neutral-600 text-xs mt-2">Thử thay đổi bộ lọc để xem thêm kết quả</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 gap-3 sm:gap-4 transition-all duration-500 ease-out ${!loading ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
      {services.map((service) => (
        <div
          key={service.id}
          className={`transition-all duration-600 ease-out ${
            isInitialLoad ? "opacity-0 translate-y-6" : "opacity-100 translate-y-0"
          }`}
          style={{ transitionDelay: "0ms" }}
        >
          <ServiceCard service={service as any} />
        </div>
      ))}
    </div>
  );
}


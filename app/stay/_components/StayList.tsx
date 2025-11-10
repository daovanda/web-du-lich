// _components/StayList.tsx

import ServiceCard from "@/components/ServiceCard";
import { Stay } from "../_types/stay.types";
import { transformStayToCardData } from "../_utils/stayTransform";
interface StayListProps {
  stays: Stay[];
  isInitialLoad: boolean;
}

export default function StayList({ stays, isInitialLoad }: StayListProps) {
  if (stays.length === 0) {
    return (
      <p
        className={`text-gray-400 text-center transition-all duration-700 ease-out delay-900 ${
          isInitialLoad
            ? "opacity-0 translate-y-4"
            : "opacity-100 translate-y-0"
        }`}
      >
        Không tìm thấy dịch vụ nào.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {stays.map((stay, index) => (
        <div
          key={stay.id}
          className={`transition-all duration-600 ease-out ${
            isInitialLoad
              ? "opacity-0 translate-y-6"
              : "opacity-100 translate-y-0"
          }`}
          style={{
            transitionDelay: `${800 + index * 100}ms`,
          }}
        >
          <ServiceCard service={transformStayToCardData(stay)} />
        </div>
      ))}
    </div>
  );
}
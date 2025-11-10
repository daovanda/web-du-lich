// src/app/tours/_components/TourList.tsx

import ServiceCard from "@/components/ServiceCard";
import { Tour } from "../_types/tour.types";
import { transformTourToCardData } from "../_utils/tourTransform";

interface TourListProps {
  tours: Tour[];
  isInitialLoad: boolean;
}

export default function TourList({ tours, isInitialLoad }: TourListProps) {
  if (tours.length === 0) {
    return (
      <p
        className={`text-gray-400 text-center transition-all duration-700 ease-out delay-900 ${
          isInitialLoad ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
        }`}
      >
        Không tìm thấy tour nào.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-500 ease-out opacity-100 scale-100">
      {tours.map((tour, index) => (
        <div
          key={tour.service_id}
          className={`transition-all duration-600 ease-out ${
            isInitialLoad
              ? "opacity-0 translate-y-6"
              : "opacity-100 translate-y-0"
          }`}
          style={{
            transitionDelay: `${800 + index * 100}ms`,
          }}
        >
          <ServiceCard service={transformTourToCardData(tour)} />
        </div>
      ))}
    </div>
  );
}
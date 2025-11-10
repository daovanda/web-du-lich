import { Car } from "../_types/car.types";

export function transformCarToCardData(car: Car) {
  return {
    id: car.id,
    title: car.title,
    description: car.description,
    image_url: car.image_url ?? "/images/default-car.jpg",
    price: car.price,
    type: "car" as const,
    location: car.location,
    average_rating: undefined,
    reviews_count: 0,
    extra: {
      // ✅ Gom thông tin thành một chuỗi duy nhất để ServiceCard hiển thị được
      guide_name: `${car.vehicle_type || "Xe"} • ${car.departure_location} → ${car.arrival_location} (${car.departure_time})`,
    },
  };
}

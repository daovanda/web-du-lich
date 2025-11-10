// stayTransform.ts
import { Stay } from "../_types/stay.types";

export function transformStayToCardData(stay: Stay): {
  id: string;
  title: string;
  description: string;
  image_url: string;
  price: string;
  type: "stay" | "car" | "motorbike" | "tour";
  location?: string;
  average_rating?: number;
  reviews_count?: number;
} {
  return {
    id: stay.id,
    title: stay.title,
    description: stay.description,
    image_url: stay.image_url,
    price: stay.price,
    type: "stay", // ✅ Không cần as const nữa
    location: stay.location,
    average_rating: stay.average_rating,
    reviews_count: stay.reviews_count,
  };
}




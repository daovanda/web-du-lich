import { Stay } from "../_types/stay.types";

export function transformStayToCardData(stay: Stay) {
  return {
    id: stay.id,
    title: stay.title,
    description: stay.description,
    image_url: stay.image_url, // hoặc stay.images?.[0] tùy DB
    price: stay.price,
    type: "stay", // ✅ Bắt buộc
    location: stay.location,
    average_rating: stay.average_rating ?? undefined,
    reviews_count: stay.reviews_count ?? 0,
  };
}




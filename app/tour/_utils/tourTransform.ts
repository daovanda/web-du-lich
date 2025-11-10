// src/app/tours/_utils/tourTransform.ts

import { Tour, TourCardData } from "../_types/tour.types";

/**
 * Transform Tour data to ServiceCard compatible format
 */
export function transformTourToCardData(tour: Tour): TourCardData {
  return {
    id: tour.service_id,
    title: tour.title,
    description: tour.description,
    image_url: tour.image_url,
    price: tour.price.toString(),
    location: tour.tour_destination || tour.service_location,
    type: "tour",
    average_rating: tour.average_rating ?? undefined,
    reviews_count: tour.reviews_count,
    extra: {
      duration_days: tour.duration_days,
      guide_name: tour.guide_name,
    },
  };
}
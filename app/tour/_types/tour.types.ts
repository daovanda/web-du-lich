// src/app/tours/_types/tour.types.ts

export interface Tour {
  service_id: string;
  title: string;
  description: string;
  service_location: string;
  price: number;
  image_url: string;
  images?: string[];
  average_rating: number | null;
  reviews_count: number;
  tour_destination: string;
  duration_days: number;
  start_date: string;
  end_date: string;
  available_slots: number;
  guide_name: string;
}

export interface TourCardData {
  id: string;
  title: string;
  description: string;
  image_url: string;
  price: string;
  location: string;
  type: "tour";
  average_rating: number | undefined;
  reviews_count: number;
  extra: {
    duration_days: number;
    guide_name: string;
  };
}

export interface UseTourResult {
  tours: Tour[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isInitialLoad: boolean;
}
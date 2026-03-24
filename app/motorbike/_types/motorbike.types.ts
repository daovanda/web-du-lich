export type MotorbikeService = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  price: string | null;
  type: "motorbike";
  location: string | null;
  average_rating?: number | null;
  reviews_count?: number | null;
  extra?: Record<string, unknown>;
};

export type MotorbikeSortBy = "default" | "price-asc" | "price-desc";

export type MotorbikeFilterState = {
  searchQuery: string;
  bikeType: string;
  location: string;
  minEngineSize: string;
  maxEngineSize: string;
  minYear: string;
  maxYear: string;
  minPrice: string;
  maxPrice: string;
  sortBy: MotorbikeSortBy;
};

export const DEFAULT_MOTORBIKE_FILTERS: MotorbikeFilterState = {
  searchQuery: "",
  bikeType: "",
  location: "",
  minEngineSize: "0",
  maxEngineSize: "",
  minYear: "2000",
  maxYear: "",
  minPrice: "",
  maxPrice: "500000",
  sortBy: "default",
};


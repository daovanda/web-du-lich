// _types/stay.types.ts

export interface Stay {
  id: string;
  title: string;
  description: string;
  location: string;
  address?: string;
  price: string;
  image_url: string; // Required by ServiceCard
  type: "stay"; // Required by ServiceCard
  max_guests: number;
  number_of_rooms: number;
  number_of_beds: number;
  images?: string[];
  amenities?: string[];
  average_rating?: number;
  reviews_count?: number;
  extra?: {
    max_guests?: number;
    number_of_rooms?: number;
    number_of_beds?: number;
    check_in?: string;
    check_out?: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface StayFilterState {
  searchQuery: string;
  location: string;
  minGuests: string;
  maxGuests: string;
  minRooms: string;
  maxRooms: string;
  minBeds: string;
  maxBeds: string;
  priceRange: "all" | "under1m" | "1m-3m" | "over3m";
  checkInDate: string;
  checkOutDate: string;
}

export interface StaySearchParams {
  filters: StayFilterState;
}

export interface StayApiResponse {
  data: Stay[];
  error: string | null;
}

export const PRICE_RANGES = [
  { value: "all", label: "Tất cả mức giá" },
  { value: "under1m", label: "< 1tr" },
  { value: "1m-3m", label: "1tr - 3tr" },
  { value: "over3m", label: "> 3tr" },
] as const;

export const DEFAULT_FILTERS: StayFilterState = {
  searchQuery: "",
  location: "",
  minGuests: "0",
  maxGuests: "",
  minRooms: "0",
  maxRooms: "",
  minBeds: "0",
  maxBeds: "",
  priceRange: "all",
  checkInDate: "",
  checkOutDate: "",
};
// _types/stay.types.ts

export interface Stay {
  id: string;
  title: string;
  description: string;
  location: string;
  address: string;
  price: string;
  max_guests: number;
  number_of_rooms: number;
  number_of_beds: number;
  images?: string[];
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
  sortBy: "default" | "price-asc" | "price-desc"; // THÊM MỚI
}

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
  sortBy: "default", // THÊM MỚI
};

export const PRICE_RANGES = [
  { value: "all", label: "Tất cả" },
  { value: "under1m", label: "< 1 triệu" },
  { value: "1m-3m", label: "1-3 triệu" },
  { value: "over3m", label: "> 3 triệu" },
];

// THÊM MỚI
export const SORT_OPTIONS = [
  { value: "default", label: "Mặc định" },
  { value: "price-asc", label: "Giá tăng dần" },
  { value: "price-desc", label: "Giá giảm dần" },
];
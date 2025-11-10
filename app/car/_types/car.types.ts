export interface Car {
  id: string;
  title: string;
  description: string;
  price: string;
  vehicle_type: string;
  departure_location: string;
  arrival_location: string;
  departure_time: string;
  location: string;
  address: string;
  image_url?: string;
}

export interface CarFilterState {
  searchQuery: string;
  vehicleType: string;
  departureLocation: string;
  arrivalLocation: string;
  priceRange: string;
  departureTime: string;
}

export interface RouteOption {
  departure: string;
  arrival: string;
  count: number;
}
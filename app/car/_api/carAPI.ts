import { supabase } from "@/lib/supabase";
import { CarFilterState } from "../_types/car.types";

export async function fetchCars(filters: CarFilterState) {
  let query = supabase.from("cars_view").select("*");

  // Apply filters
  if (filters.searchQuery) {
    query = query.or(
      `title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%,location.ilike.%${filters.searchQuery}%,address.ilike.%${filters.searchQuery}%,departure_location.ilike.%${filters.searchQuery}%,arrival_location.ilike.%${filters.searchQuery}%`
    );
  }

  if (filters.vehicleType) {
    query = query.eq("vehicle_type", filters.vehicleType);
  }

  if (filters.departureLocation) {
    query = query.eq("departure_location", filters.departureLocation);
  }

  if (filters.arrivalLocation) {
    query = query.eq("arrival_location", filters.arrivalLocation);
  }

  const { data, error } = await query;
  
  if (error) throw error;
  
  return data || [];
}

export async function fetchFilterOptions() {
  const { data } = await supabase
    .from("cars_view")
    .select("departure_location, arrival_location");

  return data || [];
}
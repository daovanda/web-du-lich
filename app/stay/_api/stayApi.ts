// _api/stayApi.ts

import { supabase } from "@/lib/supabase";
import { Stay, StayFilterState } from "../_types/stay.types";

export async function fetchStays(filters: StayFilterState): Promise<Stay[]> {
  let query = supabase.from("stays_view").select("*");

  // Apply search filter
  if (filters.searchQuery) {
    query = query.or(
      `title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%,location.ilike.%${filters.searchQuery}%,address.ilike.%${filters.searchQuery}%`
    );
  }

  // Apply location filter
  if (filters.location) {
    query = query.eq("location", filters.location);
  }

  // Apply guests range filter
  if (filters.minGuests && filters.minGuests !== "0") {
    query = query.gte("max_guests", parseInt(filters.minGuests));
  }
  if (filters.maxGuests) {
    query = query.lte("max_guests", parseInt(filters.maxGuests));
  }

  // Apply rooms range filter
  if (filters.minRooms && filters.minRooms !== "0") {
    query = query.gte("number_of_rooms", parseInt(filters.minRooms));
  }
  if (filters.maxRooms) {
    query = query.lte("number_of_rooms", parseInt(filters.maxRooms));
  }

  // Apply beds range filter
  if (filters.minBeds && filters.minBeds !== "0") {
    query = query.gte("number_of_beds", parseInt(filters.minBeds));
  }
  if (filters.maxBeds) {
    query = query.lte("number_of_beds", parseInt(filters.maxBeds));
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function fetchLocations(): Promise<string[]> {
  const { data } = await supabase
    .from("stays_view")
    .select("location");

  if (!data) return [];

  const uniqueLocations = [
    ...new Set(data.map((item) => item.location).filter(Boolean)),
  ] as string[];

  return uniqueLocations.sort();
}
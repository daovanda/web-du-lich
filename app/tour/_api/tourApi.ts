// src/app/tours/_api/tourApi.ts

import { supabase } from "@/lib/supabase";
import { Tour } from "../_types/tour.types";

export interface FetchToursParams {
  searchQuery?: string;
}

export interface FetchToursResult {
  data: Tour[] | null;
  error: Error | null;
}

export async function fetchTours(
  params: FetchToursParams = {}
): Promise<FetchToursResult> {
  try {
    const { searchQuery } = params;

    let query = supabase
      .from("tour_with_reviews")
      .select(`
        service_id,
        title,
        description,
        service_location,
        price,
        image_url, 
        images,
        average_rating,
        reviews_count,
        tour_destination,
        duration_days,
        start_date,
        end_date,
        available_slots,
        guide_name
      `);

    // Apply search filter if provided
    if (searchQuery && searchQuery.trim()) {
      query = query.or(
        `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,tour_destination.ilike.%${searchQuery}%,service_location.ilike.%${searchQuery}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return {
      data: data as Tour[],
      error: null,
    };
  } catch (err) {
    console.error("Error fetching tours:", err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error("Unknown error occurred"),
    };
  }
}
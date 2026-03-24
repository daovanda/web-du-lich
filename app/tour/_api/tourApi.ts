// src/app/tours/_api/tourApi.ts

import { Tour } from "../_types/tour.types";
import { apiRequest } from "@/lib/apiClient";

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
    const searchQuery = params.searchQuery?.trim() || "";
    const query = searchQuery
      ? `/api/tours?searchQuery=${encodeURIComponent(searchQuery)}`
      : "/api/tours";
    const res = await apiRequest<{ data: Tour[] }>(query, {
      fallbackMessage: "Không thể tải danh sách tour",
    });

    return {
      data: res.data || [],
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
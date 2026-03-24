// _api/stayApi.ts

import { Stay, StayFilterState } from "../_types/stay.types";
import { apiRequest } from "@/lib/apiClient";

export async function fetchStays(filters: StayFilterState): Promise<Stay[]> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, String(value));
  });

  const res = await apiRequest<{ data: Stay[] }>(`/api/stays?${params.toString()}`, {
    fallbackMessage: "Không thể tải danh sách lưu trú",
  });

  return res.data || [];
}

export async function fetchLocations(): Promise<string[]> {
  const res = await apiRequest<{ locations?: string[] }>("/api/stays?includeLocations=true", {
    fallbackMessage: "Không thể tải danh sách địa điểm",
  });
  return res.locations || [];
}
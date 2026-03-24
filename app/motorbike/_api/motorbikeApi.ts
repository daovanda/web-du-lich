import { apiRequest } from "@/lib/apiClient";
import type { MotorbikeFilterState, MotorbikeService } from "../_types/motorbike.types";

export async function fetchMotorbikeLocations(): Promise<{
  locations: string[];
  topLocations: string[];
}> {
  const res = await apiRequest<{
    data: MotorbikeService[];
    locations?: string[];
    topLocations?: string[];
  }>("/api/motorbikes?includeLocations=true", {
    fallbackMessage: "Không thể tải dữ liệu địa điểm",
  });

  return {
    locations: res.locations || [],
    topLocations: res.topLocations || [],
  };
}

export async function fetchMotorbikes(
  filters: MotorbikeFilterState
): Promise<MotorbikeService[]> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (!value) return;
    params.set(key, String(value));
  });

  const res = await apiRequest<{ data: MotorbikeService[] }>(
    `/api/motorbikes?${params.toString()}`,
    { fallbackMessage: "Không thể tải danh sách xe máy" }
  );

  return res.data || [];
}


import { apiRequest } from "@/lib/apiClient";
import { Car, CarFilterState } from "../_types/car.types";

export async function fetchCars(filters: CarFilterState) {
  const params = new URLSearchParams();
  if (filters.searchQuery) params.set("searchQuery", filters.searchQuery);
  if (filters.vehicleType) params.set("vehicleType", filters.vehicleType);
  if (filters.departureLocation) params.set("departureLocation", filters.departureLocation);
  if (filters.arrivalLocation) params.set("arrivalLocation", filters.arrivalLocation);

  const res = await apiRequest<{ data: Car[] }>(`/api/cars?${params.toString()}`, {
    fallbackMessage: "Không thể tải danh sách xe",
  });
  return res.data || [];
}

export async function fetchFilterOptions() {
  const res = await apiRequest<{ data: Pick<Car, "departure_location" | "arrival_location">[] }>("/api/cars", {
    fallbackMessage: "Không thể tải bộ lọc",
  });
  return res.data || [];
}
import { useState, useEffect } from "react";
import { fetchCars } from "../_api/carAPI";
import { filterByDepartureTime, filterByPriceRange } from "../_utils/carQuery";
import { Car, CarFilterState } from "../_types/car.types";

export function useCars(filters: CarFilterState) {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCars = async () => {
      try {
        setLoading(true);
        let data = await fetchCars(filters);
        
        // Apply client-side filters
        data = filterByDepartureTime(data, filters.departureTime);
        data = filterByPriceRange(data, filters.priceRange);
        
        setCars(data);
        setError(null);
      } catch (err: any) {
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
        console.error("Error fetching cars:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCars();
  }, [filters]);

  return { cars, loading, error };
}
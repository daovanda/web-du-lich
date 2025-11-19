// _hooks/useStays.ts

import { useState, useEffect } from "react";
import { Stay, StayFilterState } from "../_types/stay.types";
import { fetchStays } from "../_api/stayApi";
import { filterStaysByPrice, sortStaysByPrice } from "../_utils/stayQuery";

interface UseStaysResult {
  stays: Stay[];
  loading: boolean;
  error: string | null;
  isInitialLoad: boolean;
}

export function useStays(filters: StayFilterState): UseStaysResult {
  const [stays, setStays] = useState<Stay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const loadStays = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch stays from API
        const data = await fetchStays(filters);

        // Apply price filter in memory
        let filteredData = filterStaysByPrice(data, filters.priceRange);

        // Apply sorting - THÊM MỚI
        filteredData = sortStaysByPrice(filteredData, filters.sortBy);

        setStays(filteredData);
      } catch (err: any) {
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
        console.error("Error fetching stays:", err);
      } finally {
        setLoading(false);
        if (isInitialLoad) {
          setIsInitialLoad(false);
        }
      }
    };

    loadStays();
  }, [filters, isInitialLoad]);

  return { stays, loading, error, isInitialLoad };
}
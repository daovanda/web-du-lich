// src/app/tours/_hooks/useTours.ts

import { useEffect, useState } from "react";
import { fetchTours } from "../_api/tourApi";
import { Tour, UseTourResult } from "../_types/tour.types";
import { useRef } from "react";

export function useTours(): UseTourResult {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const initialLoadRef = useRef(true);

  useEffect(() => {
    const loadTours = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await fetchTours({ searchQuery });

        if (fetchError) {
          setError("Không thể tải danh sách tour. Vui lòng thử lại sau.");
          setTours([]);
          return;
        }

        setTours(data || []);
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("Không thể tải danh sách tour. Vui lòng thử lại sau.");
        setTours([]);
      } finally {
        setLoading(false);
        if (initialLoadRef.current) {
          initialLoadRef.current = false;
          setIsInitialLoad(false);
        }
      }
    };

    loadTours();
  }, [searchQuery]);

  return {
    tours,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    isInitialLoad,
  };
}
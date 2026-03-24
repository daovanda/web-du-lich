// _hooks/useStays.ts - OPTIMIZED VERSION

import { useState, useEffect, useRef } from "react";
import { Stay, StayFilterState } from "../_types/stay.types";
import { fetchStays } from "../_api/stayApi";

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
  
  // 🔥 FIX: Prevent unnecessary re-fetches
  const initialLoadRef = useRef(true);

  useEffect(() => {
    const loadStays = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch stays from API với ALL logic ở server
        const data = await fetchStays(filters);

        setStays(data);
      } catch (err) {
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
        console.error("Error fetching stays:", err);
      } finally {
        setLoading(false);
        
        // 🔥 FIX: Only set isInitialLoad once
        if (initialLoadRef.current) {
          initialLoadRef.current = false;
          // Delay để animation chạy
          setTimeout(() => setIsInitialLoad(false), 100);
        }
      }
    };

    loadStays();
  }, [filters]); // ⚠️ CHỈ depend vào filters

  return { stays, loading, error, isInitialLoad };
}

// 🔥 BONUS: Version với debounce cho search
export function useStaysWithDebounce(
  filters: StayFilterState,
  debounceMs: number = 300
): UseStaysResult {
  const [stays, setStays] = useState<Stay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchStays(filters);
        setStays(data);
      } catch {
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
        if (isInitialLoad) setIsInitialLoad(false);
      }
    }, filters.searchQuery ? debounceMs : 0); // Chỉ debounce search query

    return () => clearTimeout(timer);
  }, [filters, isInitialLoad]);

  return { stays, loading, error, isInitialLoad };
}
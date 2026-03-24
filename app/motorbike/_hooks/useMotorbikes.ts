import { useEffect, useRef, useState } from "react";
import type { MotorbikeFilterState, MotorbikeService } from "../_types/motorbike.types";
import { fetchMotorbikes } from "../_api/motorbikeApi";

export function useMotorbikes(filters: MotorbikeFilterState) {
  const [services, setServices] = useState<MotorbikeService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const initialLoadRef = useRef(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchMotorbikes(filters);
        setServices(data);
      } catch (err) {
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
        console.error("Error fetching motorbikes:", err);
      } finally {
        setLoading(false);
        if (initialLoadRef.current) {
          initialLoadRef.current = false;
          // allow initial animations to trigger
          setTimeout(() => setIsInitialLoad(false), 100);
        }
      }
    };

    load();
  }, [filters]);

  return { services, loading, error, isInitialLoad };
}

